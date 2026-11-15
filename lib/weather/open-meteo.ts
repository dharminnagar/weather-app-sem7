import { describeWeatherCode } from './codes';
import type { WeatherProvider } from './provider';
import type {
  CurrentWeather,
  DailyForecast,
  Location,
  WeatherReport,
} from './types';
import { UpstreamError } from './upstream-error';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 7;

const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'wind_speed_10m',
  'weather_code',
  'is_day',
];

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
];

interface RawGeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  timezone?: string;
}

interface RawGeocodingResponse {
  results?: RawGeocodingResult[];
}

interface RawCurrent {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
  is_day: number;
}

interface RawDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: (number | null)[];
}

interface RawForecastResponse {
  timezone: string;
  current: RawCurrent;
  daily: RawDaily;
}

/** Fetches JSON, reporting every way Open-Meteo can fail as `UpstreamError`. */
async function getJson<T>(url: URL, service: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (cause) {
    throw new UpstreamError(service, 'unreachable', { cause });
  }
  if (!response.ok) {
    throw new UpstreamError(service, response.status);
  }
  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new UpstreamError(service, 'invalid-response', { cause });
  }
}

/** Resolves a city name to its best-matching location, or null if unknown. */
export async function geocodeCity(name: string): Promise<Location | null> {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set('name', name);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const body = await getJson<RawGeocodingResponse>(url, 'Geocoding API');
  const match = body.results?.[0];
  if (!match) {
    return null;
  }

  return {
    name: match.name,
    country: match.country ?? null,
    latitude: match.latitude,
    longitude: match.longitude,
    timezone: match.timezone ?? null,
  };
}

function toCurrentWeather(raw: RawCurrent): CurrentWeather {
  return {
    time: raw.time,
    temperatureC: raw.temperature_2m,
    feelsLikeC: raw.apparent_temperature,
    humidityPercent: raw.relative_humidity_2m,
    windSpeedKmh: raw.wind_speed_10m,
    isDay: raw.is_day === 1,
    condition: describeWeatherCode(raw.weather_code, {
      isDay: raw.is_day === 1,
    }),
  };
}

function toDailyForecasts(raw: RawDaily): DailyForecast[] {
  return raw.time.map((date, day) => ({
    date,
    maxC: raw.temperature_2m_max[day],
    minC: raw.temperature_2m_min[day],
    precipitationChancePercent: raw.precipitation_probability_max[day] ?? null,
    condition: describeWeatherCode(raw.weather_code[day]),
  }));
}

/** Fetches current conditions and a 7-day forecast for a location. */
export async function fetchForecast(
  location: Location
): Promise<WeatherReport> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('current', CURRENT_FIELDS.join(','));
  url.searchParams.set('daily', DAILY_FIELDS.join(','));
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('wind_speed_unit', 'kmh');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', String(FORECAST_DAYS));

  const body = await getJson<RawForecastResponse>(url, 'Forecast API');

  return {
    location: { ...location, timezone: location.timezone ?? body.timezone },
    current: toCurrentWeather(body.current),
    daily: toDailyForecasts(body.daily),
  };
}

export const openMeteo: WeatherProvider = { geocodeCity, fetchForecast };
