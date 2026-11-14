import { useSyncExternalStore } from 'react';

export type StoredPreference<Value extends string> = {
  /** React hook returning the current value and a setter that persists it. */
  use: () => [Value, (next: Value) => void];
  /** Reads the persisted value outside React; falls back when unset or invalid. */
  read: () => Value;
  /** Persists a value and notifies every subscribed component. */
  write: (next: Value) => void;
};

/**
 * Creates a string preference persisted in `localStorage` and shared across
 * every component (and browser tab) that uses it.
 *
 * The server snapshot is always `fallback`, so the stored value appears right
 * after hydration instead of causing a hydration mismatch.
 */
export function createStoredPreference<Value extends string>(
  storageKey: string,
  allowedValues: readonly Value[],
  fallback: Value
): StoredPreference<Value> {
  const listeners = new Set<() => void>();

  const isAllowed = (raw: string | null): raw is Value =>
    raw !== null && (allowedValues as readonly string[]).includes(raw);

  const read = (): Value => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return isAllowed(raw) ? raw : fallback;
    } catch {
      return fallback;
    }
  };

  const write = (next: Value): void => {
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // Storage can be unavailable (private mode, quota); keep the in-memory change.
    }
    listeners.forEach((notify) => notify());
  };

  const subscribe = (notify: () => void): (() => void) => {
    const onStorage = (event: StorageEvent): void => {
      if (event.key === storageKey) notify();
    };
    listeners.add(notify);
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(notify);
      window.removeEventListener('storage', onStorage);
    };
  };

  const getServerSnapshot = (): Value => fallback;

  const use = (): [Value, (next: Value) => void] => {
    const value = useSyncExternalStore(subscribe, read, getServerSnapshot);
    return [value, write];
  };

  return { use, read, write };
}
