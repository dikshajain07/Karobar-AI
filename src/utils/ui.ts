/** Shared button styles so every button has the same sizes, radius, hover and focus behaviour. */
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const BASE =
'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-600/90',
  secondary: 'border border-line bg-surface text-ink-soft hover:bg-canvas hover:text-ink',
  danger: 'bg-danger-600 text-white hover:bg-danger-600/90',
  ghost: 'text-ink-soft hover:bg-canvas hover:text-ink'
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-11 px-4 text-sm'
};

export function buttonClass(variant: Variant = 'secondary', size: Size = 'md', extra = ''): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

export const inputClass =
'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500';