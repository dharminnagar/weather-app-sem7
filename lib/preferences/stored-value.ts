import { useSyncExternalStore } from 'react';

export type StoredValueOptions<Value> = {
  storageKey: string;
  /** Turns the raw stored string (or `null` when unset) into a value; must not throw. */
  parse: (raw: string | null) => Value;
  serialize: (value: Value) => string;
  /** Used before hydration and whenever storage is empty or unreadable. */
  fallback: Value;
};

export type StoredValue<Value> = {
  /** React hook returning the current value and a setter that persists it. */
  use: () => [Value, (next: Value) => void];
  /** Reads the persisted value outside React. Unchanged storage returns the same reference. */
  read: () => Value;
  /** Persists a value and notifies every subscriber. */
  write: (next: Value) => void;
  subscribe: (notify: () => void) => () => void;
};

/**
 * A value persisted in `localStorage` and shared by every component (and
 * browser tab) that uses it.
 *
 * `read` caches the parsed value per raw string because `useSyncExternalStore`
 * re-renders forever if a snapshot is a fresh object on every call.
 */
export function createStoredValue<Value>({
  storageKey,
  parse,
  serialize,
  fallback,
}: StoredValueOptions<Value>): StoredValue<Value> {
  const listeners = new Set<() => void>();
  let cached: { raw: string | null; value: Value } | null = null;
  let unpersisted: { value: Value } | null = null;

  const read = (): Value => {
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(storageKey);
    } catch {
      return unpersisted?.value ?? fallback;
    }
    if (cached === null || cached.raw !== raw) {
      cached = { raw, value: parse(raw) };
    }
    return cached.value;
  };

  const write = (next: Value): void => {
    const raw = serialize(next);
    try {
      window.localStorage.setItem(storageKey, raw);
      cached = { raw, value: next };
      unpersisted = null;
    } catch {
      // Storage can be unavailable (private mode, quota); keep the change for this page.
      unpersisted = { value: next };
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

  const use = (): [Value, (next: Value) => void] => [
    useSyncExternalStore(subscribe, read, getServerSnapshot),
    write,
  ];

  return { use, read, write, subscribe };
}
