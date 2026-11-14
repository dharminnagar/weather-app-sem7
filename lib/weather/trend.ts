import type { DailyForecast } from './types';
import { convertFromCelsius, type TemperatureUnit } from './units';

export type ChartBox = {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
};

/** A plotted temperature; `value` is already in the display unit. */
export type TrendPoint = { x: number; y: number; value: number };

export type AxisTick = { value: number; y: number };

export type TrendChart = {
  highs: TrendPoint[];
  lows: TrendPoint[];
  ticks: AxisTick[];
  highPath: string;
  lowPath: string;
  /** Closed shape between the high and low lines. */
  bandPath: string;
};

const TARGET_TICK_INTERVALS = 4;

/** Picks 1, 2, 5 or 10 times a power of ten, the steps people read easily. */
function niceStep(roughStep: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const residual = roughStep / magnitude;
  const multiplier =
    residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  return multiplier * magnitude;
}

/** Evenly spaced round values that cover `min..max`. */
export function niceTicks(min: number, max: number): number[] {
  const [low, high] = min === max ? [min - 1, max + 1] : [min, max];
  const step = niceStep((high - low) / TARGET_TICK_INTERVALS);
  const first = Math.floor(low / step);
  const last = Math.ceil(high / step);
  return Array.from({ length: last - first + 1 }, (_, index) =>
    // toFixed strips float noise such as 0.30000000000000004.
    Number(((first + index) * step).toFixed(10))
  );
}

const roundCoordinate = (value: number): number => Math.round(value * 10) / 10;

const toLine = (points: TrendPoint[]): string =>
  points
    .map(
      ({ x, y }, index) =>
        `${index === 0 ? 'M' : 'L'}${roundCoordinate(x)} ${roundCoordinate(y)}`
    )
    .join(' ');

const EMPTY_CHART: TrendChart = {
  highs: [],
  lows: [],
  ticks: [],
  highPath: '',
  lowPath: '',
  bandPath: '',
};

/** Lays out daily highs and lows as SVG coordinates inside `box`. */
export function buildTrendChart(
  daily: readonly DailyForecast[],
  unit: TemperatureUnit,
  { width, height, padding }: ChartBox
): TrendChart {
  if (daily.length === 0) return EMPTY_CHART;

  const highValues = daily.map((day) => convertFromCelsius(day.maxC, unit));
  const lowValues = daily.map((day) => convertFromCelsius(day.minC, unit));
  const tickValues = niceTicks(Math.min(...lowValues), Math.max(...highValues));
  const axisMin = tickValues[0];
  const axisMax = tickValues[tickValues.length - 1];

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const xAt = (index: number): number =>
    daily.length === 1
      ? padding.left + plotWidth / 2
      : padding.left + (index * plotWidth) / (daily.length - 1);
  const yAt = (value: number): number =>
    padding.top + ((axisMax - value) / (axisMax - axisMin)) * plotHeight;

  const toPoints = (values: number[]): TrendPoint[] =>
    values.map((value, index) => ({ x: xAt(index), y: yAt(value), value }));

  const highs = toPoints(highValues);
  const lows = toPoints(lowValues);
  const highPath = toLine(highs);

  return {
    highs,
    lows,
    ticks: tickValues.map((value) => ({ value, y: yAt(value) })),
    highPath,
    lowPath: toLine(lows),
    bandPath: `${highPath} ${toLine([...lows].reverse()).replace(/^M/, 'L')} Z`,
  };
}
