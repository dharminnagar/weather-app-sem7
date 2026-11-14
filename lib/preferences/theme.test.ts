import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { installFakeWindow, type FakeWindow } from './test-utils/fake-window';
import {
  applyTheme,
  resolveTheme,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  type ThemeTarget,
} from './theme';
import { themePreference } from './theme-preference';

const makeRoot = (): ThemeTarget => ({
  dataset: {},
  style: { colorScheme: '' },
});

/** Runs the inline <head> script the way the browser would. */
const runInitScript = (root: ThemeTarget): void => {
  const run = new Function('document', THEME_INIT_SCRIPT);
  run({ documentElement: root });
};

let fakeWindow: FakeWindow;

beforeEach(() => {
  fakeWindow = installFakeWindow();
});

afterEach(() => {
  fakeWindow.uninstall();
});

describe('resolveTheme', () => {
  test.each([
    ['light', false, 'light'],
    ['light', true, 'light'],
    ['dark', false, 'dark'],
    ['dark', true, 'dark'],
    ['system', false, 'light'],
    ['system', true, 'dark'],
  ] as const)('%s with system dark=%p is %s', (preference, dark, expected) => {
    expect(resolveTheme(preference, dark)).toBe(expected);
  });
});

describe('themePreference', () => {
  test('defaults to following the system', () => {
    expect(themePreference.read()).toBe('system');
  });

  test('persists under the key the init script reads', () => {
    themePreference.write('dark');

    expect(fakeWindow.storage.get(THEME_STORAGE_KEY)).toBe('dark');
  });
});

describe('applyTheme', () => {
  test('sets data-theme and color-scheme on the root element', () => {
    const root = makeRoot();

    applyTheme(root, 'dark');

    expect(root.dataset.theme).toBe('dark');
    expect(root.style.colorScheme).toBe('dark');
  });
});

describe('THEME_INIT_SCRIPT', () => {
  test('applies a saved choice before hydration', () => {
    fakeWindow.storage.set(THEME_STORAGE_KEY, 'dark');
    const root = makeRoot();

    runInitScript(root);

    expect(root.dataset.theme).toBe('dark');
  });

  test('follows the system when nothing is saved', () => {
    fakeWindow.setSystemDark(true);
    const root = makeRoot();

    runInitScript(root);

    expect(root.dataset.theme).toBe('dark');
  });

  test('treats an unknown saved value as "system"', () => {
    fakeWindow.storage.set(THEME_STORAGE_KEY, 'neon');
    const root = makeRoot();

    runInitScript(root);

    expect(root.dataset.theme).toBe('light');
  });

  test('defaults to light when storage is unavailable', () => {
    fakeWindow.breakStorage();
    const root = makeRoot();

    runInitScript(root);

    expect(root.dataset.theme).toBe('light');
  });
});
