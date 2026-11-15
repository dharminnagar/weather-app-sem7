'use client';

import { formatDayLabel } from '@/lib/weather/dates';
import { buildTrendChart, type ChartBox } from '@/lib/weather/trend';
import type { DailyForecast } from '@/lib/weather/types';
import { formatTemperature, type TemperatureUnit } from '@/lib/weather/units';
import { useElementWidth } from '../hooks/useElementWidth';

export type TemperatureTrendProps = {
  daily: DailyForecast[];
  unit: TemperatureUnit;
};

const CHART_HEIGHT = 220;
const AXIS_LABEL_RIGHT_EDGE = 28;
const GRID_START = AXIS_LABEL_RIGHT_EDGE + 6;
/** The left inset keeps the first day's labels clear of the axis labels. */
const CHART_PADDING: ChartBox['padding'] = {
  top: 22,
  right: 20,
  bottom: 30,
  left: 58,
};

/** Chart labels are already converted, so they are rounded rather than re-formatted. */
const formatDegrees = (value: number): string =>
  `${Math.round(value) === 0 ? 0 : Math.round(value)}°`;

function describeTrend(daily: DailyForecast[], unit: TemperatureUnit): string {
  const highs = daily.map((day) => day.maxC);
  const lows = daily.map((day) => day.minC);
  const range = (values: number[]): string =>
    `${formatTemperature(Math.min(...values), unit)} to ${formatTemperature(Math.max(...values), unit)}`;
  return `Daily highs range from ${range(highs)} and lows from ${range(lows)} over the next ${daily.length} days.`;
}

export function TemperatureTrend({ daily, unit }: TemperatureTrendProps) {
  const [containerRef, width] = useElementWidth(480);

  if (daily.length === 0) return null;

  const chart = buildTrendChart(daily, unit, {
    width,
    height: CHART_HEIGHT,
    padding: CHART_PADDING,
  });

  return (
    <section
      aria-labelledby="trend-heading"
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="trend-heading" className="text-xl font-semibold tracking-tight">
          Temperature trend
        </h2>
        <p className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-0.5 w-4 rounded-full bg-orange-500"
            />
            High
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-0.5 w-4 rounded-full bg-sky-500"
            />
            Low
          </span>
        </p>
      </div>

      <div ref={containerRef} className="mt-4">
        <svg
          role="img"
          aria-label={describeTrend(daily, unit)}
          width={width}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
          className="block max-w-full overflow-visible text-[11px] tabular-nums"
        >
          {chart.ticks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={GRID_START}
                x2={width - CHART_PADDING.right}
                y1={tick.y}
                y2={tick.y}
                className="stroke-zinc-200 dark:stroke-zinc-800"
              />
              <text
                x={AXIS_LABEL_RIGHT_EDGE}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-zinc-500 dark:fill-zinc-400"
              >
                {formatDegrees(tick.value)}
              </text>
            </g>
          ))}

          <path d={chart.bandPath} className="fill-orange-500/10" />
          <path
            d={chart.highPath}
            fill="none"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-orange-500"
          />
          <path
            d={chart.lowPath}
            fill="none"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-sky-500"
          />

          {chart.highs.map((high, index) => {
            const low = chart.lows[index];
            const day = daily[index];
            return (
              <g key={day.date}>
                <circle
                  cx={high.x}
                  cy={high.y}
                  r={3.5}
                  className="fill-orange-500"
                />
                <text
                  x={high.x}
                  y={high.y - 8}
                  textAnchor="middle"
                  className="fill-zinc-900 font-semibold dark:fill-zinc-100"
                >
                  {formatDegrees(high.value)}
                </text>
                <circle
                  cx={low.x}
                  cy={low.y}
                  r={3.5}
                  className="fill-sky-500"
                />
                <text
                  x={low.x}
                  y={low.y + 16}
                  textAnchor="middle"
                  className="fill-zinc-600 dark:fill-zinc-400"
                >
                  {formatDegrees(low.value)}
                </text>
                <text
                  x={high.x}
                  y={CHART_HEIGHT - 6}
                  textAnchor="middle"
                  className="fill-zinc-600 font-medium dark:fill-zinc-400"
                >
                  {formatDayLabel(day.date, index)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
