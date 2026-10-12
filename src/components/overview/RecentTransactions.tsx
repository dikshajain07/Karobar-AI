import React, { useMemo, useState } from 'react';
import { ReceiptTextIcon, SearchIcon } from 'lucide-react';
import { PaymentMethod } from '../../types/data';
import { useDemoData } from '../../contexts/DemoDataContext';
import { useT } from '../../contexts/LanguageContext';
import { formatNumber, formatShortDate, inr } from '../../utils/format';
import { Panel } from '../Panel';
import { EmptyState } from '../EmptyState';

const PAGE_SIZE = 8;
const PAYMENTS: PaymentMethod[] = ['UPI', 'Cash', 'Card'];

export function RecentTransactions({ className = '', onViewAll }: {className?: string;onViewAll: () => void;}) {
  const { transactions, products, period } = useDemoData();
  const t = useT();
  const [query, setQuery] = useState('');
  const [payment, setPayment] = useState<'All' | PaymentMethod>('All');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const names = useMemo(() => new Map(products.map((p) => [p.id, p.name])), [products]);

  // Search matches order ID, customer name or any product in the order.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.
    filter((tx) => tx.daysAgo < period).
    filter((tx) => payment === 'All' || tx.payment === payment).
    filter(
      (tx) =>
      !q ||
      tx.id.toLowerCase().includes(q) ||
      tx.customer.toLowerCase().includes(q) ||
      tx.lines.some((l) => (names.get(l.productId) ?? '').toLowerCase().includes(q))
    ).
    sort((a, b) => a.daysAgo - b.daysAgo || b.time.localeCompare(a.time));
  }, [transactions, period, payment, query, names]);

  const visible = filtered.slice(0, limit);

  return (
    <Panel
      title={t('recent.title')}
      description={t('recent.desc', { count: formatNumber(filtered.length), period })}
      className={className}
      bodyClassName="pb-2"
      action={
      <button type="button" onClick={onViewAll} className="whitespace-nowrap text-sm font-medium text-brand-700 hover:text-brand-600">
          {t('common.viewAll')}
        </button>
      }>
      
      <div className="flex flex-wrap gap-2 px-5 pt-4">
        <label className="relative min-w-[200px] flex-1">
          <span className="sr-only">{t('recent.searchLabel')}</span>
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            placeholder={t('recent.searchPlaceholder')}
            className="w-full rounded-lg border border-line py-1.5 pl-8 pr-3 text-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500" />
          
        </label>
        <label className="sr-only" htmlFor="payment-filter">
          {t('filter.paymentMethod')}
        </label>
        <select
          id="payment-filter"
          value={payment}
          onChange={(e) => {
            setPayment(e.target.value as 'All' | PaymentMethod);
            setLimit(PAGE_SIZE);
          }}
          className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500">
          
          <option value="All">{t('filter.allPayments')}</option>
          {PAYMENTS.map((p) =>
          <option key={p} value={p}>
              {t(`payment.${p}`)}
            </option>
          )}
        </select>
      </div>

      {visible.length === 0 ?
      <EmptyState icon={ReceiptTextIcon} title={t('recent.empty')} description={t('recent.emptyDesc')} /> :

      <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-ink-muted">
                <th scope="col" className="px-5 py-2 font-medium">{t('col.order')}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t('col.when')}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t('col.customer')}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t('col.items')}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t('col.payment')}</th>
                <th scope="col" className="px-5 py-2 text-right font-medium">{t('col.amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((tx) => {
              const first = names.get(tx.lines[0].productId) ?? t('common.item');
              return (
                <tr key={tx.id}>
                    <td className="whitespace-nowrap px-5 py-2.5 font-medium tabular-nums text-ink">{tx.id}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-ink-muted">
                      {formatShortDate(tx.date)}, {tx.time}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{tx.customer}</td>
                    <td className="px-3 py-2.5 text-ink-soft">
                      <span className="line-clamp-1">
                        {first} ×{tx.lines[0].qty}
                        {tx.lines.length > 1 && <span className="text-ink-muted"> {t('common.moreItems', { count: tx.lines.length - 1 })}</span>}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-ink-muted">{t(`payment.${tx.payment}`)}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right font-medium tabular-nums text-ink">{inr(tx.total)}</td>
                  </tr>);

            })}
            </tbody>
          </table>
        </div>
      }

      {filtered.length > limit &&
      <div className="border-t border-line px-5 py-2.5">
          <button type="button" onClick={() => setLimit((l) => l + PAGE_SIZE)} className="text-sm font-medium text-brand-700 hover:text-brand-600">
            {t('common.showMore', { count: Math.min(PAGE_SIZE, filtered.length - limit) })}
          </button>
        </div>
      }
    </Panel>);

}