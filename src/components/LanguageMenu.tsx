import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronDownIcon, LanguagesIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Language } from '../types/i18n';
import { languages } from '../data/languages';
import { useLanguage } from '../contexts/LanguageContext';
import { translateIn } from '../utils/i18n';

/** Top-bar language switcher. Language names are shown in their own script. */
export function LanguageMenu() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = languages.find((l) => l.id === language) ?? languages[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
      const index = items.indexOf(document.activeElement as HTMLButtonElement);
      const next = e.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
      items[next]?.focus();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    const frame = requestAnimationFrame(() => menuRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (lang: Language) => {
    setOpen(false);
    buttonRef.current?.focus();
    if (lang === language) return;
    setLanguage(lang);
    toast.success(translateIn(lang, 'language.changed'));
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('language.choose')}: ${current.nativeName}`}
        title={t('language.choose')}
        className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 text-sm font-medium text-ink-soft transition-colors duration-150 hover:bg-canvas hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        
        <LanguagesIcon className="h-4 w-4" aria-hidden="true" />
        <span>{current.nativeName}</span>
        <ChevronDownIcon className={`h-3.5 w-3.5 text-ink-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          ref={menuRef}
          role="menu"
          aria-label={t('language.choose')}
          initial={{ opacity: 0, scale: 0.97, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: 'top right' }}
          className="absolute right-0 top-full z-40 mt-2 w-60 rounded-xl border border-line bg-surface p-1.5 shadow-xl">
          
            <p className="px-2.5 pb-1.5 pt-1 text-xs font-medium text-ink-muted">{t('language.choose')}</p>
            {languages.map((l) => {
            const active = l.id === language;
            return (
              <button
                key={l.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                lang={l.htmlLang}
                onClick={() => choose(l.id)}
                className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors duration-150 focus:outline-none ${
                active ? 'bg-brand-50' : 'hover:bg-canvas focus:bg-canvas'}`
                }>
                
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-medium ${active ? 'text-brand-700' : 'text-ink'}`}>{l.nativeName}</span>
                    <span className="block text-xs text-ink-muted">{l.hint}</span>
                  </span>
                  {active && <CheckIcon className="h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />}
                </button>);

          })}
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}