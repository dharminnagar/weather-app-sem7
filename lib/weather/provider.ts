import type { Location, WeatherReport } from './types';

/**
 * Where weather data comes from. Implementations throw `UpstreamError` for any
 * failure of the service behind them, and nothing else for expected outcomes.
 */
export type WeatherProvider = {
  /** Best-matching location for a city name, or `null` if there is none. */
  geocodeCity: (name: string) => Promise<Location | null>;
  /** Current conditions and a daily forecast for a location. */
  fetchForecast: (location: Location) => Promise<WeatherReport>;
};
