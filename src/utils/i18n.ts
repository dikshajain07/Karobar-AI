import { Language, TVars } from '../types/i18n';
import { TKey, dictionaries } from '../data/i18n';
import { languages } from '../data/languages';

export const LANGUAGE_KEY = 'karobar-language';

/**
 * The active language is also kept here (outside React) so plain helper functions —
 * alerts, root-cause explanations, assistant replies, date formatting — can translate
 * without a hook. LanguageProvider keeps it in sync and re-renders the app on change.
 */
let currentLanguage: Language = 'en';

export function getStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_KEY);
    if (stored === 'en' || stored === 'hi' || stored === 'hinglish') return stored;
  } catch {

    // ignore
  }return 'en';
}

export function setCurrentLanguage(lang: Language) {
  currentLanguage = lang;
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

/** Locale used for dates (numbers always use en-IN digits so prices read the same everywhere). */
export function dateLocale(): string {
  return languages.find((l) => l.id === currentLanguage)?.dateLocale ?? 'en-IN';
}

/** Translate a key in a specific language, replacing {placeholders}. Falls back to English. */
export function translateIn(lang: Language, key: TKey, vars?: TVars): string {
  const template = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => name in vars ? String(vars[name]) : match);
}

/** Translate in the current language — for use outside components. */
export function translate(key: TKey, vars?: TVars): string {
  return translateIn(currentLanguage, key, vars);
}