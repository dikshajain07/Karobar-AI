import React, { useMemo, useState } from 'react';
import { PlusIcon, SearchIcon, ShoppingBagIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import { Transaction } from '../types/data';
import { useDemoData } from '../contexts/DemoDataContext';
import { useT } from '../contexts/LanguageContext';
import { WALK_IN_ID } from '../data/customers';
import { buildCustomerSummaries, formatPhone, initials } from '../utils/customers';
import { formatLongDate, formatNumber, inr } from '../utils/format';
import { buttonClass } from '../utils/ui';
import { Panel } from '../components/Panel';
import { EmptyState } from '../components/EmptyState';
import { Dialog } from '../components/Dialog';
import { CustomerForm } from '../components/customers/CustomerForm';
import { ReceiptDialog } from '../components/sales/ReceiptDialog';

type SortKey = 'spent' | 'recent' | 'orders' | 'name';
const HISTORY_PAGE = 10;

export function Customers({ onNewSale }: {onNewSale: (customerId?: string) => void;}) {
  const { customers, transactions } = useDemoData();
  const t = useT();
  const all = useMemo(() => buildCustomerSummaries(customers, transactions), [customers, transactions]);
  const walkIn = all.find((s) => s.customer.id === WALK_IN_ID);
  const named = useMemo(() => all.filter((s) => s.customer.id !== WALK_IN_ID), [all]);

  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('spent');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(HISTORY_PAGE);
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    return named.
    filter((s) => !q || s.customer.name.toLowerCase().includes(q) || digits.length >= 3 && (s.customer.phone ?? '').includes(digits)).
    sort((a, b) => {
      if (sortKey === 'name') return a.customer.name.localeCompare(b.customer.name);
      if (sortKey === 'orders') return b.orders - a.orders;
      if (sortKey === 'recent') return (b.lastDate ?? '').localeCompare(a.lastDate ?? '') || (b.lastTime ?? '').localeCompare(a.lastTime ?? '');
      return b.spent - a.spent;
    });
  }, [named, query, sortKey]);

  const selected = named.find((s) => s.customer.id === selectedId) ?? rows[0] ?? null;
  const totalSpent = named.reduce((s, c) => s + c.spent, 0);

  const select = (id: string) => {
    setSelectedId(id);
    setHistoryLimit(HISTORY_PAGE);
  };

  const description =
  t('cust.summary', { count: named.length, amount: inr(totalSpent) }) + (walkIn ? t('cust.summaryWalkIn', { count: formatNumber(walkIn.orders) }) : '');

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
      <Panel
        title={t('nav.customers')}
        description={description}
        bodyClassName="pb-2"
        action={
        <button type="button" onClick={() => setAddOpen(true)} className={buttonClass('secondary', 'md', 'whitespace-nowrap')}>
            <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
            {t('cust.add')}
          </button>
        }>
        
        <div className="flex flex-wrap gap-2 px-5 pt-4">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">{t('cust.searchLabel')}</span>
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('cust.searchPlaceholder')}
              className="h-9 w-full rounded-lg border border-line bg-surface pl-8 pr-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500" />
            
          </label>
          <label className="sr-only" htmlFor="customer-sort">{t('cust.sortLabel')}</label>
          <select
            id="customer-sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="h-9 rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500">
            
            <option value="spent">{t('cust.sortSpent')}</option>
            <option value="recent">{t('cust.sortRecent')}</option>
            <option value="orders">{t('cust.sortOrders')}</option>
            <option value="name">{t('cust.sortName')}</option>
          </select>
        </div>

        {rows.length === 0 ?
        <EmptyState
          icon={UsersIcon}
          title={t('cust.empty')}
          description={query ? t('cust.emptyQuery', { query }) : t('cust.emptyNone')}
          action={
          <button type="button" onClick={() => setAddOpen(true)} className={buttonClass('primary', 'sm')}>
                <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
                {t('cust.add')}
              </button>
          } /> :


        <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-muted">
                  <th scope="col" className="px-5 py-2 font-medium">{t('col.customer')}</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">{t('cust.purchases')}</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">{t('cust.spent')}</th>
                  <th scope="col" className="px-5 py-2 font-medium">{t('cust.lastPurchase')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((s) => {
                const active = selected?.customer.id === s.customer.id;
                return (
                  <tr
                    key={s.customer.id}
                    onClick={() => select(s.customer.id)}
                    className={`cursor-pointer transition-colors duration-150 ${active ? 'bg-brand-50' : 'hover:bg-canvas'}`}>
                    
                      <td className="px-5 py-2.5">
                        <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          select(s.customer.id);
                        }}
                        aria-pressed={active}
                        className="flex items-center gap-3 text-left focus:outline-none focus-visible:underline">
                        
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-xs font-semibold text-ink-soft ring-1 ring-line" aria-hidden="true">
                            {initials(s.customer.name)}
                          </span>
                          <span>
                            <span className="block font-medium text-ink">{s.customer.name}</span>
                            <span className="block text-xs text-ink-muted">{formatPhone(s.customer.phone)}</span>
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">{formatNumber(s.orders)}</td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums text-ink">{inr(s.spent)}</td>
                      <td className="whitespace-nowrap px-5 py-2.5 text-ink-muted">{s.lastDate ? formatLongDate(s.lastDate) : t('cust.noPurchases')}</td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </Panel>

      {/* Customer detail */}
      <aside className="xl:sticky xl:top-24 xl:self-start">
        {selected ?
        <section className="rounded-xl border border-line bg-surface" aria-label={t('cust.detailsAria', { name: selected.customer.name })}>
            <div className="flex items-start gap-3 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700" aria-hidden="true">
                {initials(selected.customer.name)}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold text-ink">{selected.customer.name}</h2>
                <p className="text-sm text-ink-muted">{formatPhone(selected.customer.phone)}</p>
                <p className="text-xs text-ink-muted">
                  {selected.firstDate ?
                t('cust.since', { date: formatLongDate(selected.firstDate) }) :
                selected.customer.createdAt ?
                t('cust.addedOn', { date: formatLongDate(selected.customer.createdAt) }) :
                ''}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-3 border-y border-line">
              <div className="p-4">
                <dt className="text-xs text-ink-muted">{t('cust.spentShort')}</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-ink">{inr(selected.spent)}</dd>
              </div>
              <div className="border-l border-line p-4">
                <dt className="text-xs text-ink-muted">{t('cust.purchases')}</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-ink">{formatNumber(selected.orders)}</dd>
              </div>
              <div className="border-l border-line p-4">
                <dt className="text-xs text-ink-muted">{t('cust.avgBill')}</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-ink">{inr(selected.orders ? selected.spent / selected.orders : 0)}</dd>
              </div>
            </dl>
            <div className="p-5">
              <button type="button" onClick={() => onNewSale(selected.customer.id)} className={buttonClass('primary', 'md', 'w-full')}>
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                {t('cust.newSaleFor', { name: selected.customer.name.split(' ')[0] })}
              </button>

              <h3 className="mt-6 text-sm font-semibold text-ink">{t('cust.history')}</h3>
              {selected.transactions.length === 0 ?
            <EmptyState icon={ShoppingBagIcon} title={t('cust.noPurchases')} description={t('cust.historyEmptyDesc')} /> :

            <>
                  <ul className="mt-2 divide-y divide-line">
                    {selected.transactions.slice(0, historyLimit).map((tx) =>
                <li key={tx.id}>
                        <button
                    type="button"
                    onClick={() => setReceipt(tx)}
                    className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left transition-colors duration-150 hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    
                          <span className="min-w-0">
                            <span className="block text-sm font-medium tabular-nums text-ink">{tx.id}</span>
                            <span className="block text-xs text-ink-muted">
                              {formatLongDate(tx.date)}, {tx.time} · {t('cust.itemsCount', { count: tx.lines.reduce((s, l) => s + l.qty, 0) })} · {t(`payment.${tx.payment}`)}
                            </span>
                          </span>
                          <span className="text-sm font-semibold tabular-nums text-ink">{inr(tx.total)}</span>
                        </button>
                      </li>
                )}
                  </ul>
                  {selected.transactions.length > historyLimit &&
              <button type="button" onClick={() => setHistoryLimit((l) => l + HISTORY_PAGE)} className="mt-2 text-sm font-medium text-brand-700 hover:text-brand-600">
                      {t('common.showMore', { count: Math.min(HISTORY_PAGE, selected.transactions.length - historyLimit) })}
                    </button>
              }
                </>
            }
            </div>
          </section> :

        <Panel>
            <EmptyState icon={UsersIcon} title={t('cust.selectTitle')} description={t('cust.selectDesc')} />
          </Panel>
        }
      </aside>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title={t('cust.add')} description={t('cust.addDesc')} size="sm">
        <div className="p-5">
          <CustomerForm
            onCancel={() => setAddOpen(false)}
            onSaved={(c) => {
              setAddOpen(false);
              setQuery('');
              select(c.id);
            }} />
          
        </div>
      </Dialog>

      <ReceiptDialog transaction={receipt} onClose={() => setReceipt(null)} />
    </div>);

}