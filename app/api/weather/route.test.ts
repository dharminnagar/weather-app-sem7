import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { GET } from './route';

const GEOCODE_HIT = {
  results: [
    {
      name: 'London',
      latitude: 51.5,
      longitude: -0.12,
      country: 'United Kingdom',
      timezone: 'Europe/London',
    },
  ],
};

const FORECAST = {
  timezone: 'Europe/London',
  current: {
    time: '2026-11-14T10:00',
    temperature_2m: 7,
    apparent_temperature: 5,
    relative_humidity_2m: 63,
    wind_speed_10m: 5,
    weather_code: 0,
    is_day: 1,
  },
  daily: {
    time: ['2026-11-14'],
    weather_code: [3],
    temperature_2m_max: [9],
    temperature_2m_min: [0],
    precipitation_probability_max: [0],
  },
};

const callRoute = (query: string): Promise<Response> =>
  GET(new Request(`http://localhost/api/weather?${query}`));

/** Answers geocoding and forecast URLs with the given bodies. */
const mockOpenMeteo = (
  geocodeBody: unknown,
  forecastBody: unknown = FORECAST
) => {
  const fakeFetch = async (input: RequestInfo | URL): Promise<Response> =>
    Response.json(
      String(input).includes('geocoding-api') ? geocodeBody : forecastBody
    );
  // Bun's `typeof fetch` also declares `preconnect`, which a fake never needs.
  return spyOn(globalThis, 'fetch').mockImplementation(
    fakeFetch as typeof fetch
  );
};

afterEach(() => {
  mock.restore();
});

describe('GET /api/weather validation', () => {
  test.each([
    ['', 'Provide either "city" or both "lat" and "lon"'],
    ['city=%20%20', 'City must not be blank'],
    [`city=${'a'.repeat(101)}`, 'City must be at most 100 characters'],
    ['lat=10', 'Provide either "city" or both "lat" and "lon"'],
    ['lat=91&lon=0', '"lat" must be within -90..90 and "lon" within -180..180'],
    [
      'lat=0&lon=181',
      '"lat" must be within -90..90 and "lon" within -180..180',
    ],
    [
      'lat=abc&lon=0',
      '"lat" must be within -90..90 and "lon" within -180..180',
    ],
    ['lat=&lon=0', '"lat" must be within -90..90 and "lon" within -180..180'],
  ])('rejects "%s" with 400', async (query, error) => {
    const fetchSpy = spyOn(globalThis, 'fetch');

    const response = await callRoute(query);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('GET /api/weather lookups', () => {
  test('returns a report for a known city', async () => {
    mockOpenMeteo(GEOCODE_HIT);

    const response = await callRoute('city=London');
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.location.name).toBe('London');
    expect(body.current.temperatureC).toBe(7);
    expect(body.daily).toHaveLength(1);
  });

  test('returns 404 with the trimmed city name when it is unknown', async () => {
    mockOpenMeteo({});

    const response = await callRoute('city=%20Xyzzyqwplk%20');

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: 'City "Xyzzyqwplk" not found',
    });
  });

  test('labels coordinate lookups as "Your location"', async () => {
    const fetchSpy = mockOpenMeteo(GEOCODE_HIT);

    const response = await callRoute('lat=23.02&lon=72.57');
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.location).toMatchObject({
      name: 'Your location',
      country: null,
      timezone: 'Europe/London',
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test('city takes precedence over coordinates', async () => {
    mockOpenMeteo(GEOCODE_HIT);

    const body = await (await callRoute('city=London&lat=1&lon=1')).json();

    expect(body.location.name).toBe('London');
  });
});

describe('GET /api/weather upstream failures', () => {
  const silenceErrorLog = () =>
    spyOn(console, 'error').mockImplementation(() => {});

  test('returns 502 when Open-Meteo responds with an error', async () => {
    silenceErrorLog();
    spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('down', { status: 500 })
    );

    const response = await callRoute('city=London');

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Weather service unavailable',
    });
  });

  test('returns 502 when the network is unreachable', async () => {
    silenceErrorLog();
    spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fetch failed'));

    const response = await callRoute('lat=0&lon=0');

    expect(response.status).toBe(502);
  });
});
