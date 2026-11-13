import {
  fetchForecast,
  geocodeCity,
  UpstreamError,
} from '@/lib/weather/open-meteo';
import type {
  Location,
  WeatherErrorBody,
  WeatherReport,
} from '@/lib/weather/types';

const MAX_CITY_LENGTH = 100;

type LocationQuery =
  | { kind: 'city'; city: string }
  | { kind: 'coordinates'; location: Location }
  | { kind: 'invalid'; error: string };

function errorResponse(error: string, status: number): Response {
  const body: WeatherErrorBody = { error };
  return Response.json(body, { status });
}

function parseCoordinate(raw: string, limit: number): number | null {
  if (raw.trim() === '') {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) && Math.abs(value) <= limit ? value : null;
}

function parseLocationQuery(params: URLSearchParams): LocationQuery {
  const city = params.get('city');
  const lat = params.get('lat');
  const lon = params.get('lon');

  if (city !== null) {
    const trimmed = city.trim();
    if (trimmed === '') {
      return { kind: 'invalid', error: 'City must not be blank' };
    }
    if (trimmed.length > MAX_CITY_LENGTH) {
      return {
        kind: 'invalid',
        error: `City must be at most ${MAX_CITY_LENGTH} characters`,
      };
    }
    return { kind: 'city', city: trimmed };
  }

  if (lat === null || lon === null) {
    return {
      kind: 'invalid',
      error: 'Provide either "city" or both "lat" and "lon"',
    };
  }

  const latitude = parseCoordinate(lat, 90);
  const longitude = parseCoordinate(lon, 180);
  if (latitude === null || longitude === null) {
    return {
      kind: 'invalid',
      error: '"lat" must be within -90..90 and "lon" within -180..180',
    };
  }

  return {
    kind: 'coordinates',
    location: {
      name: 'Your location',
      country: null,
      latitude,
      longitude,
      timezone: null,
    },
  };
}

async function resolveLocation(
  query: Exclude<LocationQuery, { kind: 'invalid' }>
): Promise<Location | null> {
  return query.kind === 'city' ? geocodeCity(query.city) : query.location;
}

/** Network failures surface as TypeError from fetch; bad JSON as SyntaxError. */
function isUpstreamFailure(error: unknown): boolean {
  return (
    error instanceof UpstreamError ||
    error instanceof TypeError ||
    error instanceof SyntaxError
  );
}

/** Returns current weather and a 7-day forecast for `?city=` or `?lat=&lon=`. */
export async function GET(request: Request): Promise<Response> {
  const query = parseLocationQuery(new URL(request.url).searchParams);
  if (query.kind === 'invalid') {
    return errorResponse(query.error, 400);
  }

  try {
    const location = await resolveLocation(query);
    if (!location) {
      const city = query.kind === 'city' ? query.city : '';
      return errorResponse(`City "${city}" not found`, 404);
    }

    const report: WeatherReport = await fetchForecast(location);
    return Response.json(report);
  } catch (error) {
    if (!isUpstreamFailure(error)) {
      throw error;
    }
    console.error('Weather lookup failed', error);
    return errorResponse('Weather service unavailable', 502);
  }
}
