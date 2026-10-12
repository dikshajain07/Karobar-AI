import React, { useMemo, useState } from 'react';
import { CheckIcon, SearchIcon, UserPlusIcon } from 'lucide-react';
import { useDemoData } from '../../contexts/DemoDataContext';
import { WALK_IN_ID } from '../../data/customers';
import { formatPhone, initials, normalizePhone } from '../../utils/customers';
import { useT } from '../../contexts/LanguageContext';
import { CustomerForm } from '../customers/CustomerForm';

type Mode = 'view' | 'search' | 'create';

export function CustomerPicker({ value, onChange }: {value: string;onChange: (id: string) => void;}) {
  const { customers } = useDemoData();
  const t = useT();
  const [mode, setMode] = useState<Mode>('view');
  const [query, setQuery] = useState('');
  const selected = customers.find((c) => c.id === value) ?? customers[0];

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = normalizePhone(query);
    return customers.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || digits.length >= 3 && (c.phone ?? '').includes(digits)
    );
  }, [customers, query]);

  if (mode === 'create') {
    return (
      <div>
        <p className="mb-2 text-sm font-medium text-ink">{t('customer.new')}</p>
        <CustomerForm
          initialName={/\d/.test(query) ? '' : query.trim()}
          submitLabel={t('customer.addSelect')}
          onCancel={() => setMode('search')}
          onSaved={(c) => {
            onChange(c.id);
            setQuery('');
            setMode('view');
          }} />
        
      </div>);

  }

  if (mode === 'search') {
    return (
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink">{t('customer.select')}</p>
          <button type="button" onClick={() => setMode('view')} className="text-xs font-medium text-ink-muted hover:text-ink">
            {t('common.cancel')}
          </button>
        </div>
        <label className="relative mt-2 block">
          <span className="sr-only">{t('customer.searchLabel')}</span>
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('customer.searchShort')}
            className="h-9 w-full rounded-lg border border-line bg-surface pl-8 pr-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500" />
          
        </label>
        <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-line bg-surface" role="listbox" aria-label={t('nav.customers')}>
          {matches.length === 0 && <li className="px-3 py-3 text-sm text-ink-muted">{t('customer.noMatch', { query })}</li>}
          {matches.map((c) =>
          <li key={c.id} role="option" aria-selected={c.id === value}>
              <button
              type="button"
              onClick={() => {
                onChange(c.id);
                setQuery('');
                setMode('view');
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-canvas focus:bg-canvas focus:outline-none">
              
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{c.name}</span>
                  <span className="block text-xs text-ink-muted">{c.id === WALK_IN_ID ? t('customer.noDetails') : formatPhone(c.phone)}</span>
                </span>
                {c.id === value && <CheckIcon className="h-4 w-4 text-brand-700" aria-hidden="true" />}
              </button>
            </li>
          )}
        </ul>
        <button
          type="button"
          onClick={() => setMode('create')}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-600">
          
          <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
          {t('customer.addNew')}
        </button>
      </div>);

  }

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700" aria-hidden="true">
        {initials(selected.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-muted">{t('col.customer')}</p>
        <p className="truncate text-sm font-medium text-ink">{selected.name}</p>
        {selected.id !== WALK_IN_ID && <p className="text-xs text-ink-muted">{formatPhone(selected.phone)}</p>}
      </div>
      <button
        type="button"
        onClick={() => setMode('search')}
        className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors duration-150 hover:bg-canvas hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        
        {t('customer.change')}
      </button>
    </div>);

}