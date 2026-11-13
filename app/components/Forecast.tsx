import type { DailyForecast } from '@/lib/weather/types';

export type ForecastProps = {
  daily: DailyForecast[];
};

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'UTC',
});

/** Parses at UTC noon and formats in UTC so the weekday never shifts by a day. */
const formatDayLabel = (isoDate: string, index: number): string =>
  index === 0
    ? 'Today'
    : weekdayFormatter.format(new Date(`${isoDate}T12:00:00Z`));

export function Forecast({ daily }: ForecastProps) {
  return (
    <section
      aria-labelledby="forecast-heading"
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2
        id="forecast-heading"
        className="text-xl font-semibold tracking-tight"
      >
        7-day forecast
      </h2>
      <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
        {daily.map((day, index) => (
          <li
            key={day.date}
            className="grid grid-cols-[3.5rem_2rem_1fr_auto] items-center gap-3 py-3"
          >
            <span className="font-medium">
              <time dateTime={day.date}>{formatDayLabel(day.date, index)}</time>
            </span>
            <span aria-hidden="true" className="text-2xl leading-none">
              {day.condition.icon}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-zinc-700 dark:text-zinc-300">
                {day.condition.label}
              </span>
              {day.precipitationChancePercent !== null && (
                <span className="block text-xs text-sky-700 tabular-nums dark:text-sky-400">
                  {Math.round(day.precipitationChancePercent)}% rain
                </span>
              )}
            </span>
            <span className="text-right tabular-nums">
              <span className="font-semibold">
                <span className="sr-only">High </span>
                {Math.round(day.maxC)}°
              </span>
              <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                <span className="sr-only">Low </span>
                {Math.round(day.minC)}°
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
