'use client';

import {
  favouriteCities,
  formatFavourite,
  removeFavourite,
} from '@/lib/weather/favourites';

export type FavouriteCitiesProps = {
  onSelect: (city: string) => void;
  disabled?: boolean;
};

export function FavouriteCities({
  onSelect,
  disabled = false,
}: FavouriteCitiesProps) {
  const [favourites, setFavourites] = favouriteCities.use();

  if (favourites.length === 0) return null;

  return (
    <nav aria-label="Favourite cities">
      <ul className="flex flex-wrap gap-2">
        {favourites.map((city) => {
          const label = formatFavourite(city);
          return (
            <li
              key={label}
              className="flex items-center rounded-full border border-zinc-300 bg-white text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <button
                type="button"
                onClick={() => onSelect(city.name)}
                disabled={disabled}
                title={`Show weather for ${label}`}
                className="rounded-l-full py-1.5 pr-1 pl-3 font-medium text-zinc-800 hover:text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-200 dark:hover:text-sky-400"
              >
                <span aria-hidden="true" className="mr-1 text-amber-500">
                  ★
                </span>
                {city.name}
              </button>
              <button
                type="button"
                onClick={() => setFavourites(removeFavourite(favourites, city))}
                aria-label={`Remove ${label} from favourites`}
                title={`Remove ${label} from favourites`}
                className="rounded-r-full py-1.5 pr-3 pl-1 text-zinc-500 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none dark:text-zinc-400 dark:hover:text-red-400"
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
