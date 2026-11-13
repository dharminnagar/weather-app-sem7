'use client';

export type LocationButtonProps = {
  onLocate: () => void;
  disabled?: boolean;
};

export function LocationButton({
  onLocate,
  disabled = false,
}: LocationButtonProps) {
  return (
    <button
      type="button"
      onClick={onLocate}
      disabled={disabled}
      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    >
      <span aria-hidden="true">📍</span>
      Use my location
    </button>
  );
}
