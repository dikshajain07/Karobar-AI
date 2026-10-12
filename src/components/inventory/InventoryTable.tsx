import React, { useMemo, useState } from 'react';
import { SearchIcon, SearchXIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useDemoData } from '../../contexts/DemoDataContext';
import { useT } from '../../contexts/LanguageContext';
import { InventoryRow, STATUS_ORDER, StockStatus, stockStatusKey } from '../../utils/inventory';
import { formatDaysLeft } from '../../utils/format';
import { Panel } from '../Panel';
import { StatusPill, stockTone } from '../StatusPill';
import { IntegerInput } from '../IntegerInput';
import { EmptyState } from '../EmptyState';

const FILTERS: Array<'All' | StockStatus> = ['All', 'Out of stock', 'Reorder now', 'Low stock', 'Healthy', 'Slow-moving'];

const BAR_COLOR: Record<StockStatus, string> = {
  'Out of stock': 'bg-danger-600',
  'Reorder now': 'bg-warn-600',
  'Low stock': 'bg-info-600',
  Healthy: 'bg-brand-500',
  'Slow-moving': 'bg-ink-muted'
};

export function InventoryTable({ rows }: {rows: InventoryRow[];}) {
  const { updateProduct } = useDemoData();
  const t = useT();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | StockStatus>('All');

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: rows.length };
    rows.forEach((r) => c[r.status] = (c[r.status] ?? 0) + 1);
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.
    filter((r) => filter === 'All' || r.status === filter).
    filter((r) => !q || r.product.name.toLowerCase().includes(q) || r.product.supplier.toLowerCase().includes(q)).
    sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || (a.daysOfStock ?? 999) - (b.daysOfStock ?? 999));
  }, [rows, filter, query]);

  return (
    <Panel
      title={t('inv.tableTitle')}
      description={t('inv.tableDesc')}
      bodyClassName="pb-2"
      action={
      <label className="relative block w-56">
          <span className="sr-only">{t('inv.searchLabel')}</span>
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('inv.searchPlaceholder')}
          className="w-full rounded-lg border border-line py-1.5 pl-8 pr-3 text-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500" />
        
        </label>
      }>
      
      <div className="flex flex-wrap gap-2 px-5 pt-4" role="group" aria-label={t('inv.filterStatus')}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 ${
              active ? 'border-contrast bg-contrast text-contrast-on' : 'border-line bg-surface text-ink-soft hover:bg-canvas'}`
              }>
              
              {f === 'All' ? t('common.all') : t(stockStatusKey(f))}{' '}
              <span className={active ? 'text-contrast-on/70' : 'text-ink-muted'}>{counts[f] ?? 0}</span>
            </button>);

        })}
      </div>

      {visible.length === 0 ?
      <EmptyState icon={SearchXIcon} title={t('inv.empty')} description={t('inv.emptyDesc')} /> :

      <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-ink-muted">
                <th scope="col" className="px-5 py-2 font-medium">{t('inv.colProduct')}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{t('inv.colInStock')}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{t('inv.colSold')}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{t('inv.colAvg')}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t('inv.colDaysLeft')}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{t('inv.colLead')}</th>
                <th scope="col" className="px-5 py-2 font-medium">{t('inv.colStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((r) => {
              const pct = r.daysOfStock === null ? 100 : Math.min(100, r.daysOfStock / 60 * 100);
              return (
                <tr key={r.product.id} className="align-top">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{r.product.name}</p>
                      <p className="text-xs text-ink-muted">{r.product.supplier}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <IntegerInput
                      label={t('inv.stockFor', { name: r.product.name })}
                      value={r.product.stock}
                      min={0}
                      max={10000}
                      onCommit={(v) => {
                        updateProduct(r.product.id, { stock: v });
                        toast.success(t('inv.toastStock', { name: r.product.name, count: v }));
                      }} />
                    
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink-soft">{r.unitsSold}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink-soft">{r.avgDailyDemand.toFixed(1)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-canvas" aria-hidden="true">
                          <div className={`h-full rounded-full ${BAR_COLOR[r.status]}`} style={{ width: `${r.status === 'Out of stock' ? 0 : pct}%` }} />
                        </div>
                        <span className="whitespace-nowrap tabular-nums text-ink-soft">
                          {r.product.stock <= 0 ? t('days.count', { count: 0 }) : formatDaysLeft(r.daysOfStock)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink-soft">{t('days.count', { count: r.product.leadTimeDays })}</td>
                    <td className="px-5 py-3">
                      <StatusPill tone={stockTone(r.status)}>{t(stockStatusKey(r.status))}</StatusPill>
                    </td>
                  </tr>);

            })}
            </tbody>
          </table>
        </div>
      }
    </Panel>);

}