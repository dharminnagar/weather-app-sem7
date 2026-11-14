import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { createStoredValue } from './stored-value';
import { installFakeWindow, type FakeWindow } from './test-utils/fake-window';

type Tags = readonly string[];

const EMPTY_TAGS: Tags = [];

const parseTags = (raw: string | null): Tags => {
  if (raw === null) return EMPTY_TAGS;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) &&
      parsed.every((tag) => typeof tag === 'string')
      ? parsed
      : EMPTY_TAGS;
  } catch {
    return EMPTY_TAGS;
  }
};

const createTags = () =>
  createStoredValue<Tags>({
    storageKey: 'tags',
    parse: parseTags,
    serialize: (tags) => JSON.stringify(tags),
    fallback: EMPTY_TAGS,
  });

let fakeWindow: FakeWindow;

beforeEach(() => {
  fakeWindow = installFakeWindow();
});

afterEach(() => {
  fakeWindow.uninstall();
});

describe('createStoredValue', () => {
  test('reads the fallback when nothing is stored', () => {
    expect(createTags().read()).toBe(EMPTY_TAGS);
  });

  test('round-trips structured values through storage', () => {
    const tags = createTags();

    tags.write(['a', 'b']);

    expect(fakeWindow.storage.get('tags')).toBe('["a","b"]');
    expect(tags.read()).toEqual(['a', 'b']);
  });

  test('returns the same snapshot while storage is unchanged', () => {
    fakeWindow.storage.set('tags', '["a"]');
    const tags = createTags();

    expect(tags.read()).toBe(tags.read());
  });

  test('returns a new snapshot after storage changes', () => {
    const tags = createTags();
    tags.write(['a']);
    const before = tags.read();

    tags.write(['a', 'b']);

    expect(tags.read()).not.toBe(before);
  });

  test('notifies subscribers on write', () => {
    const tags = createTags();
    let notified = 0;
    const unsubscribe = tags.subscribe(() => notified++);

    tags.write(['a']);
    unsubscribe();
    tags.write(['b']);

    expect(notified).toBe(1);
  });

  test('keeps the written value in memory when storage throws', () => {
    fakeWindow.breakStorage();
    const tags = createTags();

    expect(() => tags.write(['a'])).not.toThrow();
    expect(tags.read()).toEqual(['a']);
  });
});
