import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  installFakeWindow,
  type FakeWindow,
} from '@/lib/preferences/test-utils/fake-window';
import {
  FAVOURITES_STORAGE_KEY,
  favouriteCities,
  formatFavourite,
  isFavourite,
  MAX_FAVOURITES,
  parseFavourites,
  removeFavourite,
  toggleFavourite,
  type FavouriteCity,
} from './favourites';

const london: FavouriteCity = { name: 'London', country: 'United Kingdom' };
const paris: FavouriteCity = { name: 'Paris', country: 'France' };
const parisTexas: FavouriteCity = { name: 'Paris', country: 'United States' };

const cityNumber = (index: number): FavouriteCity => ({
  name: `City ${index}`,
  country: null,
});

describe('isFavourite', () => {
  test('matches name and country, ignoring case', () => {
    const list = [london];

    expect(
      isFavourite(list, { name: 'LONDON', country: 'united kingdom' })
    ).toBe(true);
    expect(isFavourite(list, paris)).toBe(false);
  });

  test('tells apart cities that share a name', () => {
    expect(isFavourite([paris], parisTexas)).toBe(false);
  });
});

describe('toggleFavourite', () => {
  test('adds a new city to the front', () => {
    expect(toggleFavourite([london], paris)).toEqual([paris, london]);
  });

  test('removes a city that is already saved', () => {
    expect(toggleFavourite([paris, london], { ...paris })).toEqual([london]);
  });

  test(`keeps at most ${MAX_FAVOURITES}, dropping the oldest`, () => {
    const full = Array.from({ length: MAX_FAVOURITES }, (_, index) =>
      cityNumber(index)
    );

    const next = toggleFavourite(full, london);

    expect(next).toHaveLength(MAX_FAVOURITES);
    expect(next[0]).toEqual(london);
    expect(next).not.toContainEqual(full[MAX_FAVOURITES - 1]);
  });

  test('does not mutate the input', () => {
    const list = [london];

    toggleFavourite(list, paris);

    expect(list).toEqual([london]);
  });
});

describe('removeFavourite', () => {
  test('removes only the matching city', () => {
    expect(removeFavourite([paris, parisTexas, london], paris)).toEqual([
      parisTexas,
      london,
    ]);
  });
});

describe('formatFavourite', () => {
  test('includes the country when known', () => {
    expect(formatFavourite(london)).toBe('London, United Kingdom');
    expect(formatFavourite(cityNumber(1))).toBe('City 1');
  });
});

describe('parseFavourites', () => {
  test('returns an empty list for missing or corrupt data', () => {
    expect(parseFavourites(null)).toEqual([]);
    expect(parseFavourites('not json')).toEqual([]);
    expect(parseFavourites('{"name":"London"}')).toEqual([]);
  });

  test('keeps only well-formed entries, up to the limit', () => {
    const raw = JSON.stringify([
      london,
      { name: 42 },
      { name: 'Oslo' },
      ...Array.from({ length: MAX_FAVOURITES }, (_, index) =>
        cityNumber(index)
      ),
    ]);

    const parsed = parseFavourites(raw);

    expect(parsed[0]).toEqual(london);
    expect(parsed[1]).toEqual({ name: 'Oslo', country: null });
    expect(parsed).toHaveLength(MAX_FAVOURITES);
  });
});

describe('favouriteCities store', () => {
  let fakeWindow: FakeWindow;

  beforeEach(() => {
    fakeWindow = installFakeWindow();
  });

  afterEach(() => {
    fakeWindow.uninstall();
  });

  test('starts empty and persists saved cities', () => {
    expect(favouriteCities.read()).toEqual([]);

    favouriteCities.write([london]);

    expect(
      JSON.parse(fakeWindow.storage.get(FAVOURITES_STORAGE_KEY) ?? '')
    ).toEqual([london]);
    expect(favouriteCities.read()).toEqual([london]);
  });
});
