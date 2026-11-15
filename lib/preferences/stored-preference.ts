import { createStoredValue, type StoredValue } from './stored-value';

export type StoredPreference<Value extends string> = Omit<
  StoredValue<Value>,
  'subscribe'
>;

/**
 * A string preference restricted to `allowedValues`; anything else in storage
 * reads as `fallback`.
 */
export function createStoredPreference<Value extends string>(
  storageKey: string,
  allowedValues: readonly Value[],
  fallback: Value
): StoredPreference<Value> {
  const isAllowed = (raw: string | null): raw is Value =>
    raw !== null && (allowedValues as readonly string[]).includes(raw);

  const { use, read, write } = createStoredValue<Value>({
    storageKey,
    parse: (raw) => (isAllowed(raw) ? raw : fallback),
    serialize: (value) => value,
    fallback,
  });

  return { use, read, write };
}
