import { useTheme } from '../contexts/ThemeContext';

/** Chart colours for each theme (Recharts needs real colour values, not CSS variables). */
const LIGHT = {
  primary: '#16904A',
  muted: '#98A2B3',
  danger: '#D92D20',
  navy: '#13284D',
  grid: '#EEF0F3',
  axis: '#667085',
  cursor: '#F5F6F8'
};

const DARK: typeof LIGHT = {
  primary: '#22B35E',
  muted: '#5B6B86',
  danger: '#F04438',
  navy: '#8FB0FF',
  grid: '#222C42',
  axis: '#8B97AD',
  cursor: '#1A2338'
};

export type ChartColors = typeof LIGHT;

export function useChartColors(): ChartColors {
  const { theme } = useTheme();
  return theme === 'dark' ? DARK : LIGHT;
}