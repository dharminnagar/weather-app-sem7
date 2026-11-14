'use client';

import {
  TEMPERATURE_UNIT_SYMBOL,
  TEMPERATURE_UNITS,
  temperatureUnitPreference,
  type TemperatureUnit,
} from '@/lib/weather/units';
import { SegmentedControl, type SegmentedOption } from './SegmentedControl';

const UNIT_OPTIONS: SegmentedOption<TemperatureUnit>[] = TEMPERATURE_UNITS.map(
  (unit) => ({ value: unit, content: TEMPERATURE_UNIT_SYMBOL[unit] })
);

export function UnitToggle() {
  const [unit, setUnit] = temperatureUnitPreference.use();

  return (
    <SegmentedControl
      label="Temperature unit"
      options={UNIT_OPTIONS}
      value={unit}
      onChange={setUnit}
    />
  );
}
