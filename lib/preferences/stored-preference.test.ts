import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { createStoredPreference } from './stored-preference';
import { installFakeWindow, type FakeWindow } from './test-utils/fake-window';

const COLORS = ['red', 'blue'] as const;

let fakeWindow: FakeWindow;

beforeEach(() => {
  fakeWindow = installFakeWindow();
});

afterEach(() => {
  fakeWindow.uninstall();
});

describe('createStoredPreference', () => {
  test('reads the fallback when nothing is stored', () => {
    const color = createStoredPreference('color', COLORS, 'red');

    expect(color.read()).toBe('red');
  });

  test('persists written values', () => {
    const color = createStoredPreference('color', COLORS, 'red');

    color.write('blue');

    expect(color.read()).toBe('blue');
    expect(fakeWindow.storage.get('color')).toBe('blue');
  });

  test('ignores stored values outside the allowed set', () => {
    fakeWindow.storage.set('color', 'green');
    const color = createStoredPreference('color', COLORS, 'red');

    expect(color.read()).toBe('red');
  });

  test('reads the fallback when storage throws', () => {
    fakeWindow.breakStorage();
    const color = createStoredPreference('color', COLORS, 'red');

    expect(color.read()).toBe('red');
  });

  test('keeps a choice for this page when storage throws', () => {
    fakeWindow.breakStorage();
    const color = createStoredPreference('color', COLORS, 'red');

    expect(() => color.write('blue')).not.toThrow();
    expect(color.read()).toBe('blue');
  });
});
