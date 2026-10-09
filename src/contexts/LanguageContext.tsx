import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Language, TVars } from '../types/i18n';
import { TKey } from '../data/i18n';
import { languages } from '../data/languages';
import { LANGUAGE_KEY, getStoredLanguage, setCurrentLanguage, translateIn } from '../utils/i18n';

export type TFunction = (key: TKey, vars?: TVars) => string;

interface LanguageValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TFunction;
}

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: {children: React.ReactNode;}) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = getStoredLanguage();
    setCurrentLanguage(stored);
    return stored;
  });

  useEffect(() => {
    document.documentElement.lang = languages.find((l) => l.id === language)?.htmlLang ?? 'en';
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    // Update the shared value first so helpers translate correctly during the re-render.
    setCurrentLanguage(lang);
    try {
      window.localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {

      // Preference just won't persist.
    }setLanguageState(lang);
  }, []);

  const value = useMemo<LanguageValue>(
    () => ({ language, setLanguage, t: (key, vars) => translateIn(language, key, vars) }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

/** Shorthand for components that only need the translate function. */
export function useT(): TFunction {
  return useLanguage().t;
}