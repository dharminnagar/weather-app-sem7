import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { fetchForecast, geocodeCity, UpstreamError } from './open-meteo';
import type { Location } from './types';

const AHMEDABAD: Location = {
  name: 'Ahmedabad',
  country: 'India',
  latitude: 23.02,
  longitude: 72.57,
  timezone: null,
};

const FORECAST_BODY = {
  timezone: 'Asia/Kolkata',
  current: {
    time: '2026-11-14T10:00',
    temperature_2m: 28.4,
    apparent_temperature: 27.9,
    relative_humidity_2m: 40,
    wind_speed_10m: 12.1,
    weather_code: 1,
    is_day: 1,
  },
  daily: {
    time: ['2026-11-14', '2026-11-15'],
    weather_code: [0, 61],
    temperature_2m_max: [31, 29],
    temperature_2m_min: [18, 19],
    precipitation_probability_max: [0, null],
  },
};

const respondWith = (body: unknown, status = 200) =>
  spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(body, { status }));

const requestedUrl = (fetchSpy: ReturnType<typeof respondWith>): URL =>
  new URL(String(fetchSpy.mock.calls[0][0]));

afterEach(() => {
  mock.restore();
});

describe('geocodeCity', () => {
  test('returns the first match as a Location', async () => {
    const fetchSpy = respondWith({
      results: [
        {
          name: 'Paris',
          latitude: 48.85,
          longitude: 2.35,
          country: 'France',
          timezone: 'Europe/Paris',
        },
      ],
    });

    expect(await geocodeCity('Paris')).toEqual({
      name: 'Paris',
      country: 'France',
      latitude: 48.85,
      longitude: 2.35,
      timezone: 'Europe/Paris',
    });
    expect(requestedUrl(fetchSpy).searchParams.get('name')).toBe('Paris');
    expect(requestedUrl(fetchSpy).searchParams.get('count')).toBe('1');
  });

  test('fills missing country and timezone with null', async () => {
    respondWith({ results: [{ name: 'X', latitude: 1, longitude: 2 }] });

    const location = await geocodeCity('X');

    expect(location?.country).toBeNull();
    expect(location?.timezone).toBeNull();
  });

  test('returns null when nothing matches', async () => {
    respondWith({});

    expect(await geocodeCity('Xyzzyqwplk')).toBeNull();
  });

  test('throws UpstreamError on a non-OK response', async () => {
    respondWith({ reason: 'boom' }, 500);

    await expect(geocodeCity('Paris')).rejects.toBeInstanceOf(UpstreamError);
  });
});

describe('fetchForecast', () => {
  test('maps the raw response into a WeatherReport', async () => {
    respondWith(FORECAST_BODY);

    const report = await fetchForecast(AHMEDABAD);

    expect(report.location).toEqual({ ...AHMEDABAD, timezone: 'Asia/Kolkata' });
    expect(report.current).toEqual({
      time: '2026-11-14T10:00',
      temperatureC: 28.4,
      feelsLikeC: 27.9,
      humidityPercent: 40,
      windSpeedKmh: 12.1,
      isDay: true,
      condition: { code: 1, label: 'Mainly clear', icon: '🌤️' },
    });
    expect(report.daily).toHaveLength(2);
    expect(report.daily[1]).toMatchObject({
      date: '2026-11-15',
      maxC: 29,
      minC: 19,
      precipitationChancePercent: null,
    });
  });

  test('keeps a timezone the location already has', async () => {
    respondWith(FORECAST_BODY);

    const report = await fetchForecast({ ...AHMEDABAD, timezone: 'UTC' });

    expect(report.location.timezone).toBe('UTC');
  });

  test('requests metric units for the location coordinates', async () => {
    const fetchSpy = respondWith(FORECAST_BODY);

    await fetchForecast(AHMEDABAD);

    const params = requestedUrl(fetchSpy).searchParams;
    expect(params.get('latitude')).toBe('23.02');
    expect(params.get('longitude')).toBe('72.57');
    expect(params.get('temperature_unit')).toBe('celsius');
    expect(params.get('forecast_days')).toBe('7');
  });

  test('throws UpstreamError on a non-OK response', async () => {
    respondWith({}, 503);

    await expect(fetchForecast(AHMEDABAD)).rejects.toBeInstanceOf(
      UpstreamError
    );
  });
});
