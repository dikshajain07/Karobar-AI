import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ProductDelta } from '../../utils/rootCause';
import { useChartColors } from '../../hooks/useChartColors';
import { inrCompact, signedInr } from '../../utils/format';
import { useT } from '../../contexts/LanguageContext';
import { Panel } from '../Panel';
import { ChartTooltip } from '../ChartTooltip';

/** Diverging bar chart: how much each product's revenue moved vs the previous period. */
export function ContributionChart({ deltas }: {deltas: ProductDelta[];}) {
  const CHART_COLORS = useChartColors();
  const t = useT();
  const data = [...deltas].
  sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).
  slice(0, 8).
  sort((a, b) => a.delta - b.delta);

  return (
    <Panel title={t('rc.contribTitle')} description={t('rc.contribDesc')}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} tickFormatter={inrCompact} />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={170} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} />
            <ReferenceLine x={0} stroke={CHART_COLORS.muted} />
            <Tooltip content={<ChartTooltip formatter={signedInr} />} cursor={{ fill: CHART_COLORS.cursor }} />
            <Bar dataKey="delta" name={t('rc.contribSeries')} radius={3} maxBarSize={20}>
              {data.map((d) =>
              <Cell key={d.id} fill={d.delta < 0 ? CHART_COLORS.danger : CHART_COLORS.primary} />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>);

}