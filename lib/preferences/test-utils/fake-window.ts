export type FakeWindow = {
  storage: Map<string, string>;
  /** Makes every localStorage call throw, like Safari private mode. */
  breakStorage: () => void;
  /** Sets what `matchMedia('(prefers-color-scheme: dark)')` reports. */
  setSystemDark: (dark: boolean) => void;
  uninstall: () => void;
};

/** Installs a minimal `window` (localStorage, events, matchMedia) on globalThis for Bun tests. */
export function installFakeWindow(): FakeWindow {
  const storage = new Map<string, string>();
  let storageBroken = false;
  let systemDark = false;

  const guard = <Result>(action: () => Result): Result => {
    if (storageBroken) throw new Error('Storage unavailable');
    return action();
  };

  const fakeWindow = {
    localStorage: {
      getItem: (key: string): string | null =>
        guard(() => storage.get(key) ?? null),
      setItem: (key: string, value: string): void =>
        guard(() => void storage.set(key, value)),
    },
    matchMedia: (query: string) => ({
      matches: query.includes('dark') && systemDark,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  const globals = globalThis as { window?: unknown };
  const previous = globals.window;
  globals.window = fakeWindow;

  return {
    storage,
    breakStorage: () => {
      storageBroken = true;
    },
    setSystemDark: (dark: boolean) => {
      systemDark = dark;
    },
    uninstall: () => {
      globals.window = previous;
    },
  };
}
