import { describe, expect, test } from 'bun:test';
import { convertFromCelsius, formatTemperature } from './units';

describe('convertFromCelsius', () => {
  test.each([
    [0, 32],
    [100, 212],
    [-40, -40],
    [37, 98.6],
  ])('%p°C is %p°F', (celsius, fahrenheit) => {
    expect(convertFromCelsius(celsius, 'fahrenheit')).toBeCloseTo(fahrenheit);
  });

  test('leaves Celsius unchanged', () => {
    expect(convertFromCelsius(21.4, 'celsius')).toBe(21.4);
  });
});

describe('formatTemperature', () => {
  test('rounds and appends the unit symbol', () => {
    expect(formatTemperature(21.6, 'celsius')).toBe('22°C');
    expect(formatTemperature(21.6, 'fahrenheit')).toBe('71°F');
  });

  test('omits the unit letter when asked', () => {
    expect(formatTemperature(7, 'fahrenheit', { withUnit: false })).toBe('45°');
  });

  test('never renders negative zero', () => {
    expect(formatTemperature(-0.4, 'celsius')).toBe('0°C');
  });
});
