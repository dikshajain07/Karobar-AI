import React, { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDemoData } from '../../contexts/DemoDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { productDailyUnits } from '../../utils/analytics';
import { useChartColors } from '../../hooks/useChartColors';
import { formatNumber } from '../../utils/format';
import { Panel } from '../Panel';
import { ChartTooltip } from '../ChartTooltip';

/** Day-by-day units for one product, so the merchant can see *when* the change happened. */
export function DriverTrendChart({ defaultProductId }: {defaultProductId: string;}) {
  const { transactions, products, period } = useDemoData();
  const { t, language } = useLanguage();
  const CHART_COLORS = useChartColors();
  const [productId, setProductId] = useState(defaultProductId);
  // `language` refreshes the date labels on the axis.
  const data = useMemo(() => productDailyUnits(transactions, productId, period), [transactions, productId, period, language]);

  return (
    <Panel
      title={t('rc.dailyTitle')}
      description={t('rc.dailyDesc')}
      action={
      <>
          <label htmlFor="driver-product" className="sr-only">{t('inv.colProduct')}</label>
          <select
          id="driver-product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="max-w-[220px] rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          
            {products.map((p) =>
          <option key={p.id} value={p.id}>{p.name}</option>
          )}
          </select>
        </>
      }>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} minTickGap={28} />
            <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} />
            <Tooltip content={<ChartTooltip formatter={(v) => t('common.units', { count: formatNumber(v) })} />} />
            <Line type="monotone" dataKey="units" name={t('trend.thisPeriod')} stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="prevUnits" name={t('trend.prevPeriod')} stroke={CHART_COLORS.muted} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>);

}