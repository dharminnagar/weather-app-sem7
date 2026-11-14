'use client';

import {
  favouriteCities,
  formatFavourite,
  isFavourite,
  toggleFavourite,
  type FavouriteCity,
} from '@/lib/weather/favourites';

export type FavouriteButtonProps = {
  city: FavouriteCity;
};

export function FavouriteButton({ city }: FavouriteButtonProps) {
  const [favourites, setFavourites] = favouriteCities.use();
  const saved = isFavourite(favourites, city);
  const label = `${saved ? 'Remove' : 'Save'} ${formatFavourite(city)} ${
    saved ? 'from' : 'to'
  } favourites`;

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      title={label}
      onClick={() => setFavourites(toggleFavourite(favourites, city))}
      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xl transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none dark:hover:bg-zinc-800 ${
        saved ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-500'
      }`}
    >
      <span aria-hidden="true">{saved ? '★' : '☆'}</span>
    </button>
  );
}
