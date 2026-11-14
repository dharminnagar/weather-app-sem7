'use client';

import {
  TEMPERATURE_UNIT_SYMBOL,
  TEMPERATURE_UNITS,
  temperatureUnitPreference,
} from '@/lib/weather/units';

export function UnitToggle() {
  const [unit, setUnit] = temperatureUnitPreference.use();

  return (
    <div
      role="group"
      aria-label="Temperature unit"
      className="inline-flex h-9 shrink-0 rounded-lg border border-zinc-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900"
    >
      {TEMPERATURE_UNITS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={unit === option}
          onClick={() => setUnit(option)}
          className="min-w-10 rounded-md px-2 text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none aria-pressed:bg-sky-600 aria-pressed:text-white dark:text-zinc-400 dark:hover:text-zinc-100 dark:aria-pressed:text-white"
        >
          {TEMPERATURE_UNIT_SYMBOL[option]}
        </button>
      ))}
    </div>
  );
}
