import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SearchIcon, SearchXIcon } from 'lucide-react';
import { Category } from '../types/data';
import { TKey } from '../data/i18n';
import { useDemoData } from '../contexts/DemoDataContext';
import { useT } from '../contexts/LanguageContext';
import { ProductStat, categoryStats, weekdayStats } from '../utils/analytics';
import { useChartColors } from '../hooks/useChartColors';
import { formatNumber, inr, inrCompact, signedPct } from '../utils/format';
import { Panel } from '../components/Panel';
import { ChartTooltip } from '../components/ChartTooltip';
import { EmptyState } from '../components/EmptyState';

type SortKey = 'revenue' | 'profit' | 'margin' | 'units' | 'change';

const SORT_OPTIONS: {value: SortKey;labelKey: TKey;}[] = [
{ value: 'revenue', labelKey: 'metric.revenue' },
{ value: 'profit', labelKey: 'an.grossProfit' },
{ value: 'margin', labelKey: 'an.marginPct' },
{ value: 'units', labelKey: 'an.unitsSold' },
{ value: 'change', labelKey: 'an.change' }];


function sortValue(s: ProductStat, key: SortKey): number {
  if (key === 'change') return s.revenueChangePct ?? -Infinity;
  return s[key];
}

export function SmartAnalytics() {
  const { insights, transactions, period, products } = useDemoData();
  const t = useT();
  const CHART_COLORS = useChartColors();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | Category>('All');
  const [sortKey, setSortKey] = useState<SortKey>('revenue');

  const categories = useMemo(() => categoryStats(insights.stats), [insights.stats]);
  const weekdays = useMemo(() => weekdayStats(transactions, period), [transactions, period]);
  const allCategories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);

  // Chart labels in the selected language; the underlying data keys stay unchanged.
  const categoryData = categories.map((c) => ({ ...c, label: t(`category.${c.category}` as TKey) }));
  const weekdayData = weekdays.map((w) => ({ ...w, label: t(`weekday.${w.day}` as TKey) }));

  const best = weekdays.reduce((a, b) => b.avgRevenue > a.avgRevenue ? b : a, weekdays[0]);
  const worst = weekdays.reduce((a, b) => b.avgRevenue < a.avgRevenue ? b : a, weekdays[0]);
  const topCategory = categories[0];
  const totalRevenue = categories.reduce((s, c) => s + c.revenue, 0);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return insights.stats.
    filter((s) => category === 'All' || s.product.category === category).
    filter((s) => !q || s.product.name.toLowerCase().includes(q)).
    sort((a, b) => sortValue(b, sortKey) - sortValue(a, sortKey));
  }, [insights.stats, query, category, sortKey]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-5">
        <Panel
          title={t('an.categoryTitle')}
          description={
          topCategory && totalRevenue > 0 ?
          t('an.categoryDesc', {
            category: t(`category.${topCategory.category}` as TKey),
            pct: (topCategory.revenue / totalRevenue * 100).toFixed(0)
          }) :
          t('top.empty')
          }
          className="xl:col-span-3">
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} interval={0} />
                <YAxis tickLine={false} axisLine={false} width={56} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} tickFormatter={inrCompact} />
                <Tooltip content={<ChartTooltip formatter={inr} />} cursor={{ fill: CHART_COLORS.cursor }} />
                <Bar dataKey="revenue" name={t('metric.revenue')} fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="profit" name={t('an.grossProfit')} fill={CHART_COLORS.navy} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title={t('an.weekdayTitle')}
          description={
          best && worst ?
          t('an.weekdayDesc', {
            best: t(`weekday.${best.day}` as TKey),
            amount: inr(best.avgRevenue),
            worst: t(`weekday.${worst.day}` as TKey)
          }) :
          undefined
          }
          className="xl:col-span-2">
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} />
                <YAxis tickLine={false} axisLine={false} width={56} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} tickFormatter={inrCompact} />
                <Tooltip content={<ChartTooltip formatter={inr} />} cursor={{ fill: CHART_COLORS.cursor }} />
                <Bar dataKey="avgRevenue" name={t('an.avgSales')} radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {weekdayData.map((w) =>
                  <Cell key={w.day} fill={w.day === best?.day ? CHART_COLORS.primary : CHART_COLORS.muted} />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title={t('an.productTitle')} description={t('an.productDesc', { period })} bodyClassName="pb-2">
        <div className="flex flex-wrap gap-2 px-5 pt-4">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">{t('pos.searchLabel')}</span>
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('pos.searchLabel')}
              className="w-full rounded-lg border border-line py-1.5 pl-8 pr-3 text-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500" />
            
          </label>
          <label className="sr-only" htmlFor="category-filter">{t('an.category')}</label>
          <select
            id="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value as 'All' | Category)}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            
            <option value="All">{t('an.allCategories')}</option>
            {allCategories.map((c) =>
            <option key={c} value={c}>{t(`category.${c}` as TKey)}</option>
            )}
          </select>
          <label className="sr-only" htmlFor="sort-select">{t('an.sortBy')}</label>
          <select
            id="sort-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            
            {SORT_OPTIONS.map((o) =>
            <option key={o.value} value={o.value}>{t('an.sortOption', { label: t(o.labelKey) })}</option>
            )}
          </select>
        </div>

        {rows.length === 0 ?
        <EmptyState
          icon={SearchXIcon}
          title={t('pos.noProducts')}
          description={t('an.emptyDesc')}
          action={
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('All');
            }}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-canvas">
            
                {t('txn.clearFilters')}
              </button>
          } /> :


        <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-muted">
                  <th scope="col" className="px-5 py-2 font-medium">{t('inv.colProduct')}</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">{t('metric.units')}</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">{t('metric.revenue')}</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">{t('an.grossProfit')}</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">{t('an.margin')}</th>
                  <th scope="col" className="px-5 py-2 text-right font-medium">{t('an.change')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((s) => {
                const change = s.revenueChangePct;
                return (
                  <tr key={s.product.id}>
                      <td className="px-5 py-2.5">
                        <p className="font-medium text-ink">{s.product.name}</p>
                        <p className="text-xs text-ink-muted">{t(`category.${s.product.category}` as TKey)}</p>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">{formatNumber(s.units)}</td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums text-ink">{inr(s.revenue)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">{inr(s.profit)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">{s.margin.toFixed(1)}%</td>
                      <td
                      className={`px-5 py-2.5 text-right font-medium tabular-nums ${
                      change === null ? 'text-ink-muted' : change >= 0 ? 'text-brand-700' : 'text-danger-700'}`
                      }>
                      
                        {signedPct(change)}
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </Panel>
    </div>);

}