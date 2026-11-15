import { createStoredPreference } from '@/lib/preferences/stored-preference';

export const TEMPERATURE_UNITS = ['celsius', 'fahrenheit'] as const;

export type TemperatureUnit = (typeof TEMPERATURE_UNITS)[number];

export const TEMPERATURE_UNIT_SYMBOL: Record<TemperatureUnit, string> = {
  celsius: '°C',
  fahrenheit: '°F',
};

export const temperatureUnitPreference = createStoredPreference(
  'weather:temperature-unit',
  TEMPERATURE_UNITS,
  'celsius'
);

/** The API always reports Celsius; conversion happens only for display. */
export const convertFromCelsius = (
  celsius: number,
  unit: TemperatureUnit
): number => (unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius);

/** Rounded temperature, e.g. "21°C"; pass `withUnit: false` for "21°". */
export function formatTemperature(
  celsius: number,
  unit: TemperatureUnit,
  { withUnit = true }: { withUnit?: boolean } = {}
): string {
  const rounded = Math.round(convertFromCelsius(celsius, unit));
  return withUnit
    ? `${rounded}${TEMPERATURE_UNIT_SYMBOL[unit]}`
    : `${rounded}°`;
}
