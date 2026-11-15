import { describe, expect, test } from 'bun:test';
import { describeWeatherCode } from './codes';

describe('describeWeatherCode', () => {
  test('maps a known WMO code to its label and icon', () => {
    expect(describeWeatherCode(0)).toEqual({
      code: 0,
      label: 'Clear sky',
      icon: '☀️',
    });
  });

  test('maps thunderstorm codes to the storm icon', () => {
    for (const code of [95, 96, 99]) {
      expect(describeWeatherCode(code).icon).toBe('⛈️');
    }
  });

  test('falls back to "Unknown" for unmapped codes but keeps the code', () => {
    expect(describeWeatherCode(42)).toEqual({
      code: 42,
      label: 'Unknown',
      icon: '🌡️',
    });
  });

  test('shows the moon instead of the sun at night', () => {
    expect(describeWeatherCode(0, { isDay: false })).toEqual({
      code: 0,
      label: 'Clear sky',
      icon: '🌙',
    });
    expect(describeWeatherCode(1, { isDay: false }).icon).toBe('🌙');
  });

  test('never shows a sun at night', () => {
    const sunny = ['☀️', '🌤️', '⛅', '🌦️'];
    for (let code = 0; code <= 99; code++) {
      expect(sunny).not.toContain(
        describeWeatherCode(code, { isDay: false }).icon
      );
    }
  });

  test('keeps sunless icons at night', () => {
    expect(describeWeatherCode(65, { isDay: false }).icon).toBe(
      describeWeatherCode(65).icon
    );
  });
});
