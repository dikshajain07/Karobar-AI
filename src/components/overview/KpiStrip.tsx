import React from 'react';
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { Kpis } from '../../utils/analytics';
import { changePct, formatNumber, inr, signedPct } from '../../utils/format';
import { PeriodDays } from '../../types/data';
import { useT } from '../../contexts/LanguageContext';

interface KpiStripProps {
  current: Kpis;
  previous: Kpis;
  period: PeriodDays;
}

export function KpiStrip({ current, previous, period }: KpiStripProps) {
  const t = useT();
  const items = [
  {
    id: 'revenue',
    label: t('kpi.revenue'),
    value: inr(current.revenue),
    change: changePct(current.revenue, previous.revenue),
    hint: t('kpi.revenueHint', { amount: inr(previous.revenue), period })
  },
  {
    id: 'profit',
    label: t('kpi.profit'),
    value: inr(current.profit),
    change: changePct(current.profit, previous.profit),
    hint: t('kpi.profitHint', { pct: current.revenue > 0 ? (current.profit / current.revenue * 100).toFixed(1) : '0' })
  },
  {
    id: 'orders',
    label: t('kpi.orders'),
    value: formatNumber(current.orders),
    change: changePct(current.orders, previous.orders),
    hint: t('kpi.ordersHint', { count: formatNumber(current.orders / period) })
  },
  {
    id: 'aov',
    label: t('kpi.aov'),
    value: inr(current.aov),
    change: changePct(current.aov, previous.aov),
    hint: t('kpi.aovHint', { count: current.orders ? (current.units / current.orders).toFixed(1) : '0' })
  }];


  return (
    <section aria-label={t('kpi.aria')} className="grid grid-cols-1 overflow-hidden rounded-xl border border-line bg-surface sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, i) => {
        const up = (item.change ?? 0) >= 0;
        return (
          <div
            key={item.id}
            className={`border-line p-5 ${i > 0 ? 'border-t sm:border-t-0' : ''} ${i % 2 === 1 ? 'sm:border-l' : ''} ${i >= 2 ? 'sm:border-t xl:border-t-0' : ''} ${i === 2 ? 'xl:border-l' : ''}`}>
            
            <p className="text-sm text-ink-muted">{item.label}</p>
            <p className={`mt-1.5 font-semibold tabular-nums tracking-tight text-ink ${i === 0 ? 'text-3xl' : 'text-2xl'}`}>{item.value}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className={`inline-flex items-center gap-1 font-medium ${up ? 'text-brand-700' : 'text-danger-700'}`}>
                {up ? <TrendingUpIcon className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDownIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                {signedPct(item.change)}
              </span>
              <span className="text-ink-muted">{item.hint}</span>
            </div>
          </div>);

      })}
    </section>);

}