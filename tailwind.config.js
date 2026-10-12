/** Theme colors are CSS variables (see index.css) so light and dark mode share one set of class names. */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#08142A',
          900: '#0C1D3A',
          800: '#13284D',
          700: '#1E3A66',
          300: '#9FB0CC',
          200: '#C9D3E4',
        },
        canvas: v('canvas'),
        surface: { DEFAULT: v('surface'), 2: v('surface-2') },
        line: v('line'),
        sidebar: v('sidebar'),
        contrast: { DEFAULT: v('contrast'), on: v('on-contrast') },
        ink: { DEFAULT: v('ink'), soft: v('ink-soft'), muted: v('ink-muted') },
        brand: { 50: v('brand-50'), 100: v('brand-100'), 500: v('brand-500'), 600: v('brand-600'), 700: v('brand-700') },
        danger: { 50: v('danger-50'), 600: v('danger-600'), 700: v('danger-700') },
        warn: { 50: v('warn-50'), 600: v('warn-600'), 700: v('warn-700') },
        info: { 50: v('info-50'), 600: v('info-600'), 700: v('info-700') },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
    },
  },
};
