import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { createWeatherHandler } from './handler';
import type { WeatherProvider } from './provider';
import { UpstreamError } from './upstream-error';
import type { Location, WeatherReport } from './types';

const LONDON: Location = {
  name: 'London',
  country: 'United Kingdom',
  latitude: 51.5,
  longitude: -0.12,
  timezone: 'Europe/London',
};

const reportFor = (location: Location): WeatherReport => ({
  location,
  current: {
    time: '2026-11-15T10:00',
    temperatureC: 7,
    feelsLikeC: 5,
    humidityPercent: 63,
    windSpeedKmh: 5,
    isDay: true,
    condition: { code: 0, label: 'Clear sky', icon: '☀️' },
  },
  daily: [],
});

type FakeProvider = {
  [Method in keyof WeatherProvider]: ReturnType<
    typeof mock<WeatherProvider[Method]>
  >;
};

const fakeProvider = (known: Location | null = LONDON): FakeProvider => ({
  geocodeCity: mock(async () => known),
  fetchForecast: mock(async (location: Location) => reportFor(location)),
});

afterEach(() => {
  mock.restore();
});

const call = (provider: WeatherProvider, query: string): Promise<Response> =>
  createWeatherHandler(provider)(
    new Request(`http://localhost/api/weather?${query}`)
  );

describe('validation', () => {
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
  ])(
    'rejects "%s" with 400 without calling the provider',
    async (query, error) => {
      const provider = fakeProvider();

      const response = await call(provider, query);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error });
      expect(provider.geocodeCity).not.toHaveBeenCalled();
      expect(provider.fetchForecast).not.toHaveBeenCalled();
    }
  );
});

describe('lookups', () => {
  test('geocodes the trimmed city and returns its report', async () => {
    const provider = fakeProvider();

    const response = await call(provider, 'city=%20London%20');

    expect(response.status).toBe(200);
    expect(provider.geocodeCity).toHaveBeenCalledWith('London');
    expect(provider.fetchForecast).toHaveBeenCalledWith(LONDON);
    expect(await response.json()).toEqual(reportFor(LONDON));
  });

  test('returns 404 naming the trimmed city when it is unknown', async () => {
    const provider = fakeProvider(null);

    const response = await call(provider, 'city=%20Xyzzyqwplk%20');

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: 'City "Xyzzyqwplk" not found',
    });
    expect(provider.fetchForecast).not.toHaveBeenCalled();
  });

  test('looks up coordinates directly as "Your location"', async () => {
    const provider = fakeProvider();

    await call(provider, 'lat=23.02&lon=72.57');

    expect(provider.geocodeCity).not.toHaveBeenCalled();
    expect(provider.fetchForecast).toHaveBeenCalledWith({
      name: 'Your location',
      country: null,
      latitude: 23.02,
      longitude: 72.57,
      timezone: null,
    });
  });

  test('prefers the city over coordinates', async () => {
    const provider = fakeProvider();

    await call(provider, 'city=London&lat=1&lon=1');

    expect(provider.fetchForecast).toHaveBeenCalledWith(LONDON);
  });
});

describe('provider failures', () => {
  test('returns 502 when the provider reports an upstream failure', async () => {
    spyOn(console, 'error').mockImplementation(() => {});
    const provider = fakeProvider();
    provider.fetchForecast.mockImplementation(async () => {
      throw new UpstreamError('Forecast API', 'unreachable');
    });

    const response = await call(provider, 'city=London');

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Weather service unavailable',
    });
  });

  test('does not hide programming errors behind a 502', async () => {
    const provider = fakeProvider();
    provider.geocodeCity.mockImplementation(async () => {
      throw new RangeError('bug');
    });

    await expect(call(provider, 'city=London')).rejects.toBeInstanceOf(
      RangeError
    );
  });
});
