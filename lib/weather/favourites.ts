import { createStoredValue } from '@/lib/preferences/stored-value';
import type { Location } from './types';

export type FavouriteCity = Pick<Location, 'name' | 'country'>;

export type FavouriteList = readonly FavouriteCity[];

export const MAX_FAVOURITES = 8;

export const FAVOURITES_STORAGE_KEY = 'weather:favourite-cities';

const EMPTY_LIST: FavouriteList = [];

const sameText = (left: string | null, right: string | null): boolean =>
  (left ?? '').toLocaleLowerCase() === (right ?? '').toLocaleLowerCase();

const sameCity = (left: FavouriteCity, right: FavouriteCity): boolean =>
  sameText(left.name, right.name) && sameText(left.country, right.country);

export const isFavourite = (
  list: FavouriteList,
  city: FavouriteCity
): boolean => list.some((saved) => sameCity(saved, city));

export const removeFavourite = (
  list: FavouriteList,
  city: FavouriteCity
): FavouriteList => list.filter((saved) => !sameCity(saved, city));

/** Removes a saved city, or saves it first in line, keeping the newest `MAX_FAVOURITES`. */
export const toggleFavourite = (
  list: FavouriteList,
  city: FavouriteCity
): FavouriteList =>
  isFavourite(list, city)
    ? removeFavourite(list, city)
    : [{ name: city.name, country: city.country }, ...list].slice(
        0,
        MAX_FAVOURITES
      );

export const formatFavourite = ({ name, country }: FavouriteCity): string =>
  country ? `${name}, ${country}` : name;

const toFavourite = (entry: unknown): FavouriteCity | null => {
  if (typeof entry !== 'object' || entry === null) return null;
  const { name, country } = entry as Record<string, unknown>;
  if (typeof name !== 'string' || name.trim() === '') return null;
  return { name, country: typeof country === 'string' ? country : null };
};

/** Parses stored favourites, dropping anything malformed rather than failing. */
export function parseFavourites(raw: string | null): FavouriteList {
  if (raw === null) return EMPTY_LIST;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY_LIST;
  }
  if (!Array.isArray(parsed)) return EMPTY_LIST;
  return parsed
    .map(toFavourite)
    .filter((city): city is FavouriteCity => city !== null)
    .slice(0, MAX_FAVOURITES);
}

export const favouriteCities = createStoredValue<FavouriteList>({
  storageKey: FAVOURITES_STORAGE_KEY,
  parse: parseFavourites,
  serialize: (list) => JSON.stringify(list),
  fallback: EMPTY_LIST,
});
