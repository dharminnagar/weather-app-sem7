/** Server-safe theme logic; the React-bound preference lives in `theme-preference.ts`. */
export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

export const THEME_STORAGE_KEY = 'weather:theme';

export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/** The subset of `<html>` that theming touches, so it can be faked in tests. */
export type ThemeTarget = {
  dataset: { theme?: string };
  style: { colorScheme: string };
};

export const resolveTheme = (
  preference: ThemePreference,
  systemPrefersDark: boolean
): ResolvedTheme =>
  preference === 'system' ? (systemPrefersDark ? 'dark' : 'light') : preference;

export function applyTheme(root: ThemeTarget, theme: ResolvedTheme): void {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

/**
 * Runs in `<head>` before first paint so a saved dark theme never flashes
 * light. It must stay self-contained ES5: it runs before any bundle loads.
 */
export const THEME_INIT_SCRIPT = `(function () {
  var preference = 'system';
  try {
    var saved = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch (error) {}
  var dark = preference === 'dark' ||
    (preference === 'system' && window.matchMedia(${JSON.stringify(DARK_SCHEME_QUERY)}).matches);
  var theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();`;
