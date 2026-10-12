import React from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useT } from '../contexts/LanguageContext';
import { IconButton } from './IconButton';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useT();
  return (
    <IconButton label={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')} onClick={toggleTheme}>
      {theme === 'dark' ? <SunIcon className="h-4 w-4" aria-hidden="true" /> : <MoonIcon className="h-4 w-4" aria-hidden="true" />}
    </IconButton>);

}