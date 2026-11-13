'use client';

import { useState, type FormEvent } from 'react';

export type SearchBarProps = {
  onSearch: (city: string) => void;
  disabled?: boolean;
};

export function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const trimmedQuery = query.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmedQuery === '') return;
    onSearch(trimmedQuery);
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="flex flex-1 gap-2">
      <label htmlFor="city-search" className="sr-only">
        City
      </label>
      <input
        id="city-search"
        type="search"
        name="city"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search a city…"
        autoComplete="off"
        maxLength={100}
        disabled={disabled}
        className="h-11 min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 text-base text-zinc-900 placeholder:text-zinc-500 focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
      />
      <button
        type="submit"
        disabled={disabled || trimmedQuery === ''}
        className="h-11 shrink-0 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-sky-700 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        Search
      </button>
    </form>
  );
}
