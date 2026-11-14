'use client';

import { useEffect } from 'react';
import {
  applyTheme,
  DARK_SCHEME_QUERY,
  resolveTheme,
  type ThemePreference,
} from '@/lib/preferences/theme';
import { themePreference } from '@/lib/preferences/theme-preference';
import { SegmentedControl, type SegmentedOption } from './SegmentedControl';

const THEME_OPTIONS: SegmentedOption<ThemePreference>[] = [
  {
    value: 'light',
    content: <span aria-hidden="true">☀️</span>,
    label: 'Light theme',
  },
  {
    value: 'dark',
    content: <span aria-hidden="true">🌙</span>,
    label: 'Dark theme',
  },
  {
    value: 'system',
    content: <span aria-hidden="true">💻</span>,
    label: 'Match system theme',
  },
];

/** Keeps `<html data-theme>` in sync with the saved choice and, for "system", the OS. */
function useAppliedTheme(preference: ThemePreference): void {
  useEffect(() => {
    // The hydration render reports the server default ("system"); reading
    // storage directly stops that first effect from undoing the head script.
    const stored = themePreference.read();
    const media = window.matchMedia(DARK_SCHEME_QUERY);
    const apply = (): void =>
      applyTheme(document.documentElement, resolveTheme(stored, media.matches));

    apply();
    if (stored !== 'system') return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [preference]);
}

export function ThemeToggle() {
  const [preference, setPreference] = themePreference.use();
  useAppliedTheme(preference);

  return (
    <SegmentedControl
      label="Color theme"
      options={THEME_OPTIONS}
      value={preference}
      onChange={setPreference}
    />
  );
}
