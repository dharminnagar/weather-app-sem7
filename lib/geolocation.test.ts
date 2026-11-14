import { describe, expect, test } from 'bun:test';
import {
  GEOLOCATION_MESSAGES,
  locate,
  type GeolocationSource,
} from './geolocation';

const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;

const succeedingAt = (
  latitude: number,
  longitude: number
): GeolocationSource => ({
  getCurrentPosition: (onSuccess) =>
    onSuccess({ coords: { latitude, longitude } }),
});

const failingWith = (code: number): GeolocationSource => ({
  getCurrentPosition: (_onSuccess, onError) =>
    onError({ code, PERMISSION_DENIED }),
});

describe('locate', () => {
  test('resolves with the device coordinates', async () => {
    expect(await locate(succeedingAt(23.02, 72.57))).toEqual({
      latitude: 23.02,
      longitude: 72.57,
    });
  });

  test('explains when the browser has no geolocation', async () => {
    await expect(locate(undefined)).rejects.toThrow(
      GEOLOCATION_MESSAGES.unsupported
    );
  });

  test('suggests searching instead when permission is denied', async () => {
    await expect(locate(failingWith(PERMISSION_DENIED))).rejects.toThrow(
      GEOLOCATION_MESSAGES.denied
    );
  });

  test('reports other failures generically', async () => {
    await expect(locate(failingWith(POSITION_UNAVAILABLE))).rejects.toThrow(
      GEOLOCATION_MESSAGES.failed
    );
  });
});
