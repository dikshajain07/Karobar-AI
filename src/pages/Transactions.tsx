import React, { useMemo, useState } from 'react';
import { ReceiptTextIcon, SearchIcon } from 'lucide-react';
import { PaymentMethod, SaleSource, Transaction } from '../types/data';
import { TKey } from '../data/i18n';
import { useDemoData } from '../contexts/DemoDataContext';
import { useT } from '../contexts/LanguageContext';
import { HISTORY_DAYS, dateForDaysAgo, toIsoDate } from '../utils/transactions';
import { newestFirst } from '../utils/customers';
import { formatLongDate, formatNumber, inr } from '../utils/format';
import { buttonClass } from '../utils/ui';
import { Panel } from '../components/Panel';
import { EmptyState } from '../components/EmptyState';
import { StatusPill } from '../components/StatusPill';
import { ReceiptDialog } from '../components/sales/ReceiptDialog';

type Preset = 'today' | '7' | '30' | '90' | 'all' | 'custom';

const PRESETS: {value: Preset;labelKey: TKey;}[] = [
{ value: 'today', labelKey: 'txn.today' },
{ value: '7', labelKey: 'txn.last7' },
{ value: '30', labelKey: 'txn.last30' },
{ value: '90', labelKey: 'txn.last90' },
{ value: 'all', labelKey: 'txn.allDays' },
{ value: 'custom', labelKey: 'txn.custom' }];


const PAYMENTS: PaymentMethod[] = ['UPI', 'Cash', 'Card'];
const PAGE_SIZE = 25;
const control =
'h-9 rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500';

export function Transactions() {
  const { transactions, products } = useDemoData();
  const t = useT();
  const names = useMemo(() => new Map(products.map((p) => [p.id, p.name])), [products]);
  const minDate = toIsoDate(dateForDaysAgo(HISTORY_DAYS - 1));
  const maxDate = toIsoDate(dateForDaysAgo(0));

  const [query, setQuery] = useState('');
  const [preset, setPreset] = useState<Preset>('30');
  const [from, setFrom] = useState(toIsoDate(dateForDaysAgo(6)));
  const [to, setTo] = useState(maxDate);
  const [payment, setPayment] = useState<'All' | PaymentMethod>('All');
  const [source, setSource] = useState<'all' | SaleSource>('all');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Transaction | null>(null);

  // Inline validation for the custom date range.
  const dateError =
  preset !== 'custom' ?
  null :
  !from || !to ?
  t('txn.errBoth') :
  from > to ?
  t('txn.errOrder') :
  from < minDate || to > maxDate ?
  t('txn.errRange', { from: formatLongDate(minDate), to: formatLongDate(maxDate) }) :
  null;

  const filtered = useMemo(() => {
    if (dateError) return [];
    const q = query.trim().toLowerCase();
    return transactions.
    filter((tx) => {
      if (preset === 'today' && tx.daysAgo !== 0) return false;
      if ((preset === '7' || preset === '30' || preset === '90') && tx.daysAgo >= Number(preset)) return false;
      if (preset === 'custom' && (tx.date < from || tx.date > to)) return false;
      if (payment !== 'All' && tx.payment !== payment) return false;
      if (source !== 'all' && tx.source !== source) return false;
      if (!q) return true;
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.customer.toLowerCase().includes(q) ||
        tx.lines.some((l) => (names.get(l.productId) ?? '').toLowerCase().includes(q)));

    }).
    sort(newestFirst);
  }, [transactions, preset, from, to, payment, source, query, names, dateError]);

  const total = filtered.reduce((s, tx) => s + tx.total, 0);
  const visible = filtered.slice(0, limit);

  const resetPaging = () => setLimit(PAGE_SIZE);

  const clearFilters = () => {
    setQuery('');
    setPreset('30');
    setPayment('All');
    setSource('all');
    resetPaging();
  };

  return (
    <div className="space-y-6">
      <section aria-label={t('txn.totalsAria')} className="grid grid-cols-1 overflow-hidden rounded-xl border border-line bg-surface sm:grid-cols-3">
        <div className="p-5">
          <p className="text-sm text-ink-muted">{t('txn.bills')}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{formatNumber(filtered.length)}</p>
        </div>
        <div className="border-t border-line p-5 sm:border-l sm:border-t-0">
          <p className="text-sm text-ink-muted">{t('txn.salesValue')}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{inr(total)}</p>
        </div>
        <div className="border-t border-line p-5 sm:border-l sm:border-t-0">
          <p className="text-sm text-ink-muted">{t('kpi.aov')}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{inr(filtered.length ? total / filtered.length : 0)}</p>
        </div>
      </section>

      <Panel title={t('txn.allBills')} description={t('txn.allBillsDesc')} bodyClassName="pb-2">
        <div className="flex flex-wrap items-start gap-2 px-5 pt-4">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">{t('txn.searchLabel')}</span>
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetPaging();
              }}
              placeholder={t('txn.searchPlaceholder')}
              className={`${control} w-full pl-8 placeholder:text-ink-muted`} />
            
          </label>
          <label className="sr-only" htmlFor="txn-preset">{t('txn.dateRange')}</label>
          <select
            id="txn-preset"
            value={preset}
            onChange={(e) => {
              setPreset(e.target.value as Preset);
              resetPaging();
            }}
            className={control}>
            
            {PRESETS.map((p) =>
            <option key={p.value} value={p.value}>{t(p.labelKey, { count: HISTORY_DAYS })}</option>
            )}
          </select>
          <label className="sr-only" htmlFor="txn-payment">{t('filter.paymentMethod')}</label>
          <select
            id="txn-payment"
            value={payment}
            onChange={(e) => {
              setPayment(e.target.value as 'All' | PaymentMethod);
              resetPaging();
            }}
            className={control}>
            
            <option value="All">{t('filter.allPayments')}</option>
            {PAYMENTS.map((p) =>
            <option key={p} value={p}>{t(`payment.${p}`)}</option>
            )}
          </select>
          <label className="sr-only" htmlFor="txn-source">{t('txn.source')}</label>
          <select
            id="txn-source"
            value={source}
            onChange={(e) => {
              setSource(e.target.value as 'all' | SaleSource);
              resetPaging();
            }}
            className={control}>
            
            <option value="all">{t('txn.allSources')}</option>
            <option value="pos">{t('source.pos')}</option>
            <option value="demo">{t('source.demo')}</option>
          </select>
        </div>

        {preset === 'custom' &&
        <div className="px-5 pt-3">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="txn-from" className="text-xs font-medium text-ink-soft">{t('txn.from')}</label>
                <input
                id="txn-from"
                type="date"
                value={from}
                min={minDate}
                max={maxDate}
                onChange={(e) => {
                  setFrom(e.target.value);
                  resetPaging();
                }}
                aria-invalid={dateError ? true : undefined}
                className={`${control} mt-1 block`} />
              
              </div>
              <div>
                <label htmlFor="txn-to" className="text-xs font-medium text-ink-soft">{t('txn.to')}</label>
                <input
                id="txn-to"
                type="date"
                value={to}
                min={minDate}
                max={maxDate}
                onChange={(e) => {
                  setTo(e.target.value);
                  resetPaging();
                }}
                aria-invalid={dateError ? true : undefined}
                className={`${control} mt-1 block`} />
              
              </div>
            </div>
            {dateError &&
          <p role="alert" className="mt-2 text-xs text-danger-700">
                {dateError}
              </p>
          }
          </div>
        }

        {visible.length === 0 ?
        <EmptyState
          icon={ReceiptTextIcon}
          title={dateError ? t('txn.fixDates') : t('txn.empty')}
          description={dateError ? undefined : t('txn.emptyDesc')}
          action={
          !dateError &&
          <button type="button" onClick={clearFilters} className={buttonClass('secondary', 'sm')}>
                  {t('txn.clearFilters')}
                </button>

          } /> :


        <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-muted">
                  <th scope="col" className="px-5 py-2 font-medium">{t('col.order')}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t('txn.dateTime')}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t('col.customer')}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t('col.items')}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t('col.payment')}</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">{t('bill.discount')}</th>
                  <th scope="col" className="px-5 py-2 text-right font-medium">{t('col.amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((tx) => {
                const units = tx.lines.reduce((s, l) => s + l.qty, 0);
                const first = (tx.lines[0] && names.get(tx.lines[0].productId)) ?? t('common.item');
                return (
                  <tr key={tx.id} onClick={() => setSelected(tx)} className="cursor-pointer transition-colors duration-150 hover:bg-canvas">
                      <td className="whitespace-nowrap px-5 py-2.5">
                        <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(tx);
                        }}
                        className="font-medium tabular-nums text-ink hover:text-brand-700 focus:outline-none focus-visible:underline">
                        
                          {tx.id}
                        </button>
                        {tx.source === 'pos' &&
                      <span className="ml-2">
                            <StatusPill tone="success">{t('txn.new')}</StatusPill>
                          </span>
                      }
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-ink-muted">
                        {formatLongDate(tx.date)}, {tx.time}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{tx.customer}</td>
                      <td className="px-3 py-2.5 text-ink-soft">
                        <span className="line-clamp-1">
                          {first}
                          {tx.lines.length > 1 && <span className="text-ink-muted"> {t('common.moreItems', { count: tx.lines.length - 1 })}</span>}
                          <span className="text-ink-muted"> · {t('common.units', { count: units })}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted">{t(`payment.${tx.payment}`)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-ink-muted">{tx.discount > 0 ? `−${inr(tx.discount)}` : '—'}</td>
                      <td className="whitespace-nowrap px-5 py-2.5 text-right font-medium tabular-nums text-ink">{inr(tx.total)}</td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }

        {filtered.length > 0 &&
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-2.5 text-sm">
            <p className="text-ink-muted">{t('common.showing', { shown: formatNumber(visible.length), total: formatNumber(filtered.length) })}</p>
            {filtered.length > limit &&
          <button type="button" onClick={() => setLimit((l) => l + PAGE_SIZE)} className="font-medium text-brand-700 hover:text-brand-600">
                {t('common.loadMore', { count: Math.min(PAGE_SIZE, filtered.length - limit) })}
              </button>
          }
          </div>
        }
      </Panel>

      <ReceiptDialog transaction={selected} onClose={() => setSelected(null)} />
    </div>);

}