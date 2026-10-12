import React, { createContext, useCallback, useContext, useState } from 'react';
import { Toaster } from 'sonner';
import { THEME_KEY, Theme, applyTheme, getStoredTheme } from '../utils/theme';

interface ThemeValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: {children: React.ReactNode;}) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;
      root.classList.add('theme-switching');
      applyTheme(next);
      window.setTimeout(() => root.classList.remove('theme-switching'), 250);
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {

        // Preference just won't persist.
      }return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      {/* App-wide notifications (dashboard and sign-in pages), themed to match */}
      <Toaster position="bottom-right" theme={theme} richColors closeButton />
    </ThemeContext.Provider>);

}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}