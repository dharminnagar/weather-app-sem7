import type { ReactNode } from 'react';
import type {
  CurrentWeather as CurrentWeatherData,
  Location,
} from '@/lib/weather/types';
import { formatTemperature, type TemperatureUnit } from '@/lib/weather/units';

export type CurrentWeatherProps = {
  location: Location;
  current: CurrentWeatherData;
  unit: TemperatureUnit;
  /** Rendered beside the location name, e.g. a save-to-favourites button. */
  headerAction?: ReactNode;
};

/** `time` is already local to the location ("YYYY-MM-DDTHH:MM"), so no Date conversion. */
const formatLocalClockTime = (localDateTime: string): string =>
  localDateTime.slice(11, 16);

export function CurrentWeather({
  location,
  current,
  unit,
  headerAction,
}: CurrentWeatherProps) {
  const updatedAt = formatLocalClockTime(current.time);

  return (
    <section
      aria-labelledby="current-weather-heading"
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex items-center gap-2">
          <h2
            id="current-weather-heading"
            className="text-xl font-semibold tracking-tight"
          >
            {location.name}
            {location.country && (
              <span className="font-normal text-zinc-600 dark:text-zinc-400">
                , {location.country}
              </span>
            )}
          </h2>
          {headerAction}
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Updated <time dateTime={current.time}>{updatedAt}</time>
        </p>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <span aria-hidden="true" className="text-6xl leading-none sm:text-7xl">
          {current.condition.icon}
        </span>
        <div>
          <p className="text-6xl font-semibold tracking-tight tabular-nums sm:text-7xl">
            {formatTemperature(current.temperatureC, unit)}
          </p>
          <p className="mt-1 text-base text-zinc-700 dark:text-zinc-300">
            {current.condition.label}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <WeatherDetail
          term="Feels like"
          value={formatTemperature(current.feelsLikeC, unit)}
        />
        <WeatherDetail
          term="Humidity"
          value={`${Math.round(current.humidityPercent)}%`}
        />
        <WeatherDetail
          term="Wind"
          value={`${Math.round(current.windSpeedKmh)} km/h`}
        />
      </dl>
    </section>
  );
}

type WeatherDetailProps = { term: string; value: string };

function WeatherDetail({ term, value }: WeatherDetailProps) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
        {term}
      </dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
