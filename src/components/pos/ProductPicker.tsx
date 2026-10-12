import React, { useMemo, useState } from 'react';
import { PlusIcon, SearchIcon, SearchXIcon } from 'lucide-react';
import { Category, Product } from '../../types/data';
import { inr } from '../../utils/format';
import { initials } from '../../utils/customers';
import { useT } from '../../contexts/LanguageContext';
import { EmptyState } from '../EmptyState';

interface ProductPickerProps {
  products: Product[];
  qtyInCart: (productId: string) => number;
  onAdd: (product: Product) => void;
}

/** Searchable product list for billing. Enter in the search box adds the first available match. */
export function ProductPicker({ products, qtyInCart, onAdd }: ProductPickerProps) {
  const t = useT();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | Category>('All');
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map((p) => p.category)))] as Array<'All' | Category>, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.
    filter((p) => category === 'All' || p.category === category).
    filter((p) => !q || p.name.toLowerCase().includes(q)).
    sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));
  }, [products, query, category]);

  return (
    <div className="flex flex-col border-b border-line lg:min-h-0 lg:border-b-0 lg:border-r">
      <div className="space-y-3 p-4">
        <label className="relative block">
          <span className="sr-only">{t('pos.searchLabel')}</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            type="search"
            data-autofocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const first = filtered.find((p) => p.stock > 0);
                if (first) onAdd(first);
              }
            }}
            placeholder={t('pos.searchPlaceholder')}
            className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500" />
          
        </label>
        <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label={t('pos.filterCategory')}>
          {categories.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                active ? 'border-contrast bg-contrast text-contrast-on' : 'border-line bg-surface text-ink-soft hover:bg-canvas'}`
                }>
                
                {c === 'All' ? t('common.all') : t(`category.${c}`)}
              </button>);

          })}
        </div>
      </div>

      {filtered.length === 0 ?
      <EmptyState icon={SearchXIcon} title={t('pos.noProducts')} description={t('pos.noProductsDesc')} /> :

      <ul className="max-h-[40vh] overflow-y-auto px-2 pb-2 lg:max-h-none lg:flex-1" aria-label={t('pos.products')}>
          {filtered.map((p) => {
          const inCart = qtyInCart(p.id);
          const remaining = p.stock - inCart;
          const out = p.stock <= 0;
          return (
            <li key={p.id}>
                <button
                type="button"
                onClick={() => onAdd(p)}
                disabled={out}
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-55">
                
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-xs font-semibold text-ink-soft" aria-hidden="true">
                    {initials(p.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                    <span className={`block text-xs ${out ? 'text-danger-700' : remaining <= 5 ? 'text-warn-700' : 'text-ink-muted'}`}>
                      {out ? t('stock.outOfStock') : t('pos.available', { count: remaining })} · {t(`category.${p.category}`)}
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-ink">{inr(p.price)}</span>
                  {inCart > 0 ?
                <span className="min-w-[32px] rounded-full bg-brand-600 px-2 py-0.5 text-center text-xs font-semibold text-white" aria-label={t('pos.inBill', { count: inCart })}>
                      ×{inCart}
                    </span> :

                <span className="flex w-8 justify-center" aria-hidden="true">
                      <PlusIcon className="h-4 w-4 text-ink-muted group-hover:text-brand-700" />
                    </span>
                }
                </button>
              </li>);

        })}
        </ul>
      }
    </div>);

}