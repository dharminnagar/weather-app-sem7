import { createStoredPreference } from './stored-preference';
import { THEME_PREFERENCES, THEME_STORAGE_KEY } from './theme';

export const themePreference = createStoredPreference(
  THEME_STORAGE_KEY,
  THEME_PREFERENCES,
  'system'
);
