import { useCallback, useEffect, useRef, useState } from 'react';
import type { WeatherErrorBody, WeatherReport } from '@/lib/weather/types';

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; report: WeatherReport }
  | { status: 'error'; message: string };

export type UseWeatherResult = {
  state: WeatherState;
  searchCity: (city: string) => void;
  searchCoords: (latitude: number, longitude: number) => void;
  /** Shows the loading state while something other than a fetch is pending, e.g. geolocation. */
  startLoading: () => void;
  fail: (message: string) => void;
};

const NETWORK_ERROR_MESSAGE =
  'Could not reach the weather service. Check your connection.';
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

const isWeatherErrorBody = (body: unknown): body is WeatherErrorBody =>
  typeof body === 'object' &&
  body !== null &&
  'error' in body &&
  typeof body.error === 'string';

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    return isWeatherErrorBody(body) ? body.error : GENERIC_ERROR_MESSAGE;
  } catch {
    return GENERIC_ERROR_MESSAGE;
  }
}

/** Client-only: fetches weather through this app's `/api/weather` route. */
export function useWeather(): UseWeatherResult {
  const [state, setState] = useState<WeatherState>({ status: 'idle' });
  const inFlightRef = useRef<AbortController | null>(null);

  const abortInFlight = useCallback((): void => {
    inFlightRef.current?.abort();
    inFlightRef.current = null;
  }, []);

  useEffect(() => abortInFlight, [abortInFlight]);

  const fetchWeather = useCallback(
    async (params: URLSearchParams): Promise<void> => {
      abortInFlight();
      const controller = new AbortController();
      inFlightRef.current = controller;
      setState({ status: 'loading' });

      try {
        const response = await fetch(`/api/weather?${params.toString()}`, {
          signal: controller.signal,
        });
        const nextState: WeatherState = response.ok
          ? {
              status: 'success',
              report: (await response.json()) as WeatherReport,
            }
          : { status: 'error', message: await readErrorMessage(response) };
        if (!controller.signal.aborted) setState(nextState);
      } catch (error) {
        if (isAbortError(error) || controller.signal.aborted) return;
        setState({ status: 'error', message: NETWORK_ERROR_MESSAGE });
      } finally {
        if (inFlightRef.current === controller) inFlightRef.current = null;
      }
    },
    [abortInFlight]
  );

  const searchCity = useCallback(
    (city: string): void => {
      void fetchWeather(new URLSearchParams({ city }));
    },
    [fetchWeather]
  );

  const searchCoords = useCallback(
    (latitude: number, longitude: number): void => {
      void fetchWeather(
        new URLSearchParams({ lat: String(latitude), lon: String(longitude) })
      );
    },
    [fetchWeather]
  );

  const startLoading = useCallback((): void => {
    abortInFlight();
    setState({ status: 'loading' });
  }, [abortInFlight]);

  const fail = useCallback(
    (message: string): void => {
      abortInFlight();
      setState({ status: 'error', message });
    },
    [abortInFlight]
  );

  return { state, searchCity, searchCoords, startLoading, fail };
}
