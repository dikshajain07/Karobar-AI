export type Theme = 'light' | 'dark';

export const THEME_KEY = 'karobar-theme';

/** Light mode is the default on first visit. */
export function getStoredTheme(): Theme {
  try {
    return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}