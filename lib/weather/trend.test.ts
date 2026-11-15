import { describe, expect, test } from 'bun:test';
import type { DailyForecast } from './types';
import { buildTrendChart, niceTicks, type ChartBox } from './trend';

const BOX: ChartBox = {
  width: 300,
  height: 120,
  padding: { top: 10, right: 20, bottom: 30, left: 40 },
};

const day = (date: string, minC: number, maxC: number): DailyForecast => ({
  date,
  minC,
  maxC,
  precipitationChancePercent: null,
  condition: { code: 0, label: 'Clear sky', icon: '☀️' },
});

const WEEK: DailyForecast[] = [
  day('2026-11-14', 4, 11),
  day('2026-11-15', 6, 14),
  day('2026-11-16', 2, 9),
];

describe('niceTicks', () => {
  test('covers the range with round steps', () => {
    expect(niceTicks(3.2, 17.8)).toEqual([0, 5, 10, 15, 20]);
  });

  test('works below zero', () => {
    expect(niceTicks(-7, 4)).toEqual([-10, -5, 0, 5]);
  });

  test('widens a flat range so the axis has height', () => {
    const ticks = niceTicks(5, 5);

    expect(ticks.length).toBeGreaterThan(1);
    expect(ticks[0]).toBeLessThan(5);
    expect(ticks.at(-1)).toBeGreaterThan(5);
  });
});

describe('buildTrendChart', () => {
  test('returns nothing to draw without data', () => {
    const chart = buildTrendChart([], 'celsius', BOX);

    expect(chart.highs).toEqual([]);
    expect(chart.highPath).toBe('');
  });

  test('spreads days evenly across the plot width', () => {
    const { highs } = buildTrendChart(WEEK, 'celsius', BOX);

    expect(highs.map((point) => point.x)).toEqual([40, 160, 280]);
  });

  test('centres a single day', () => {
    const { highs } = buildTrendChart([WEEK[0]], 'celsius', BOX);

    expect(highs[0].x).toBe(160);
  });

  test('maps the axis range onto the plot height', () => {
    const { ticks } = buildTrendChart(WEEK, 'celsius', BOX);

    expect(ticks[0]).toEqual({ value: 0, y: 90 });
    expect(ticks.at(-1)).toEqual({ value: 15, y: 10 });
  });

  test('draws warmer temperatures higher up', () => {
    const { highs, lows } = buildTrendChart(WEEK, 'celsius', BOX);

    highs.forEach((high, index) => expect(high.y).toBeLessThan(lows[index].y));
    expect(highs[1].y).toBeLessThan(highs[0].y);
  });

  test('labels points and ticks in the chosen unit', () => {
    const chart = buildTrendChart(WEEK, 'fahrenheit', BOX);

    expect(chart.highs[0].value).toBeCloseTo(51.8);
    expect(chart.lows[2].value).toBeCloseTo(35.6);
    expect(chart.ticks[0].value).toBeLessThanOrEqual(35.6);
  });

  test('builds line paths through every point and a closed band', () => {
    const chart = buildTrendChart(WEEK, 'celsius', BOX);

    expect(chart.highPath).toMatch(/^M40 [\d.]+ L160 [\d.]+ L280 [\d.]+$/);
    expect(chart.bandPath.startsWith('M40 ')).toBe(true);
    expect(chart.bandPath.endsWith('Z')).toBe(true);
  });
});
