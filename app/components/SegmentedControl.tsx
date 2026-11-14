'use client';

import type { ReactNode } from 'react';

export type SegmentedOption<Value extends string> = {
  value: Value;
  content: ReactNode;
  /** Accessible name when `content` is an icon. */
  label?: string;
};

export type SegmentedControlProps<Value extends string> = {
  label: string;
  options: readonly SegmentedOption<Value>[];
  value: Value;
  onChange: (next: Value) => void;
};

/** A row of toggle buttons where exactly one is pressed. */
export function SegmentedControl<Value extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<Value>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex h-9 shrink-0 rounded-lg border border-zinc-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          aria-label={option.label}
          title={option.label}
          onClick={() => onChange(option.value)}
          className="min-w-10 rounded-md px-2 text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none aria-pressed:bg-sky-600 aria-pressed:text-white dark:text-zinc-400 dark:hover:text-zinc-100 dark:aria-pressed:text-white"
        >
          {option.content}
        </button>
      ))}
    </div>
  );
}
