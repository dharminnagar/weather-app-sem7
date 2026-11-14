import { describe, expect, test } from 'bun:test';
import { formatDayLabel } from './dates';

describe('formatDayLabel', () => {
  test('calls the first day "Today"', () => {
    expect(formatDayLabel('2026-11-14', 0)).toBe('Today');
  });

  test('uses the short weekday of the date itself, whatever the timezone', () => {
    expect(formatDayLabel('2026-11-15', 1)).toBe('Sun');
    expect(formatDayLabel('2026-11-16', 2)).toBe('Mon');
  });
});
