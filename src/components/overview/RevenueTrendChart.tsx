import React, { useState } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DailyPoint } from '../../utils/analytics';
import { useChartColors } from '../../hooks/useChartColors';
import { useT } from '../../contexts/LanguageContext';
import { formatNumber, formatShortDate, inr, inrCompact } from '../../utils/format';
import { Panel } from '../Panel';
import { SegmentedControl } from '../SegmentedControl';
import { ChartTooltip } from '../ChartTooltip';

type Metric = 'revenue' | 'profit' | 'orders';

const PREV_KEY: Record<Metric, keyof DailyPoint> = {
  revenue: 'prevRevenue',
  profit: 'prevProfit',
  orders: 'prevOrders'
};

export function RevenueTrendChart({ series, className = '' }: {series: DailyPoint[];className?: string;}) {
  const [metric, setMetric] = useState<Metric>('revenue');
  const t = useT();
  const CHART_COLORS = useChartColors();
  const format = (v: number) => metric === 'orders' ? formatNumber(v) : inr(v);
  const total = series.reduce((s, p) => s + p[metric], 0);
  const prevTotal = series.reduce((s, p) => s + Number(p[PREV_KEY[metric]]), 0);
  // Axis labels follow the selected language's month names.
  const data = series.map((p) => ({ ...p, label: formatShortDate(p.date) }));

  return (
    <Panel
      title={t('trend.title')}
      description={t('trend.desc')}
      className={className}
      action={
      <SegmentedControl
        label={t('trend.metric')}
        value={metric}
        onChange={setMetric}
        options={[
        { value: 'revenue', label: t('metric.revenue') },
        { value: 'profit', label: t('metric.profit') },
        { value: 'orders', label: t('metric.orders') }]
        } />

      }>
      
      <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className="text-2xl font-semibold tabular-nums text-ink">{format(total)}</p>
          <p className="text-xs text-ink-muted">{t('trend.previousTotal', { value: format(prevTotal) })}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-brand-600" aria-hidden="true" /> {t('trend.thisPeriod')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-ink-muted/60" aria-hidden="true" /> {t('trend.prevPeriod')}
          </span>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} minTickGap={28} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
              tickFormatter={(v: number) => metric === 'orders' ? String(v) : inrCompact(v)} />
            
            <Tooltip content={<ChartTooltip formatter={format} />} />
            <Area type="monotone" dataKey={metric} name={t('trend.thisPeriod')} stroke={CHART_COLORS.primary} strokeWidth={2} fill={CHART_COLORS.primary} fillOpacity={0.08} />
            <Line type="monotone" dataKey={PREV_KEY[metric]} name={t('trend.prevPeriod')} stroke={CHART_COLORS.muted} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Panel>);

}