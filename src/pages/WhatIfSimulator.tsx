import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RotateCcwIcon, TriangleAlertIcon } from 'lucide-react';
import { useDemoData } from '../contexts/DemoDataContext';
import { ALL_PRODUCTS, SimulatorInputs, simulate } from '../utils/simulator';
import { useChartColors } from '../hooks/useChartColors';
import { changePct, formatNumber, inr, inrCompact, signedInr, signedPct } from '../utils/format';
import { Panel } from '../components/Panel';
import { SliderField } from '../components/SliderField';
import { ChartTooltip } from '../components/ChartTooltip';
import { EmptyState } from '../components/EmptyState';

const DEFAULT_INPUTS: SimulatorInputs = {
  productId: ALL_PRODUCTS,
  discountPct: 0,
  priceChangePct: 0,
  extraInventory: 0,
  sensitivity: 0,
  sellThroughPct: 50
};

const SENSITIVITY_OPTIONS = [
{ value: 0, label: 'None — units stay the same' },
{ value: -0.5, label: 'Low (−0.5)' },
{ value: -1, label: 'Medium (−1.0)' },
{ value: -1.5, label: 'High (−1.5)' }];


export function WhatIfSimulator() {
  const { insights, period, products } = useDemoData();
  const CHART_COLORS = useChartColors();
  const [inputs, setInputs] = useState<SimulatorInputs>(DEFAULT_INPUTS);

  function update<K extends keyof SimulatorInputs>(key: K, value: SimulatorInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  // Recalculated on every input change.
  const result = useMemo(() => simulate(insights.stats, inputs), [insights.stats, inputs]);
  const single = inputs.productId !== ALL_PRODUCTS;
  const selectedName = single ? products.find((p) => p.id === inputs.productId)?.name ?? 'Product' : 'All products';
  const { baseline: b, simulated: s } = result;
  const profitDiff = s.profit - b.profit;

  const rows = [
  { label: 'Average selling price', base: inr(b.avgPrice), sim: inr(s.avgPrice), change: signedPct(changePct(s.avgPrice, b.avgPrice)) },
  { label: 'Units sold', base: formatNumber(b.units), sim: formatNumber(s.units), change: signedPct(changePct(s.units, b.units)) },
  { label: 'Revenue', base: inr(b.revenue), sim: inr(s.revenue), change: signedInr(s.revenue - b.revenue) },
  { label: 'Cost of goods sold', base: inr(b.cost), sim: inr(s.cost), change: signedInr(s.cost - b.cost) },
  { label: 'Gross profit', base: inr(b.profit), sim: inr(s.profit), change: signedInr(profitDiff), strong: true },
  { label: 'Gross margin', base: `${b.margin.toFixed(1)}%`, sim: `${s.margin.toFixed(1)}%`, change: `${s.margin - b.margin >= 0 ? '+' : '−'}${Math.abs(s.margin - b.margin).toFixed(1)} pts` }];


  const chartData = [
  { name: 'Revenue', baseline: b.revenue, simulated: s.revenue },
  { name: 'Cost of goods', baseline: b.cost, simulated: s.cost },
  { name: 'Gross profit', baseline: b.profit, simulated: s.profit }];


  const isUnchanged = JSON.stringify({ ...inputs, productId: DEFAULT_INPUTS.productId }) === JSON.stringify(DEFAULT_INPUTS);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <Panel
        title="Scenario inputs"
        description={`Baseline: last ${period} days of demo sales`}
        className="self-start"
        action={
        <button
          type="button"
          onClick={() => setInputs({ ...DEFAULT_INPUTS, productId: inputs.productId })}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink-soft hover:bg-canvas">
          
            <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>
        }>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="sim-product" className="text-sm font-medium text-ink">Apply to</label>
            <select
              id="sim-product"
              value={inputs.productId}
              onChange={(e) => update('productId', e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              
              <option value={ALL_PRODUCTS}>All products</option>
              {products.map((p) =>
              <option key={p.id} value={p.id}>{p.name}</option>
              )}
            </select>
          </div>

          <SliderField id="sim-discount" label="Discount" unit="%" min={0} max={50} value={inputs.discountPct} onChange={(v) => update('discountPct', v)} help="Applied at the billing counter on top of the price." />
          <SliderField id="sim-price" label="Price change" unit="%" min={-20} max={30} value={inputs.priceChangePct} onChange={(v) => update('priceChangePct', v)} help="Change to the shelf price before any discount." />

          {single ?
          <>
              <SliderField id="sim-extra" label="Additional inventory" unit="units" min={0} max={500} step={5} value={inputs.extraInventory} onChange={(v) => update('extraInventory', v)} help="Extra units bought for this period." />
              {inputs.extraInventory > 0 &&
            <SliderField id="sim-sell" label="Sell-through of extra stock" unit="%" min={0} max={100} step={5} value={inputs.sellThroughPct} onChange={(v) => update('sellThroughPct', v)} help="Your assumption — how much of the extra stock actually sells." />
            }
            </> :

          <p className="rounded-lg bg-canvas px-3 py-2.5 text-xs text-ink-muted">Select a single product to simulate buying additional inventory.</p>
          }

          <div>
            <label htmlFor="sim-sensitivity" className="text-sm font-medium text-ink">Assumed price sensitivity</label>
            <select
              id="sim-sensitivity"
              value={inputs.sensitivity}
              onChange={(e) => update('sensitivity', Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              
              {SENSITIVITY_OPTIONS.map((o) =>
              <option key={o.value} value={o.value}>{o.label}</option>
              )}
            </select>
            <p className="mt-1 text-xs text-ink-muted">Medium means a 10% lower price brings ~10% more units. This is your assumption, not a forecast.</p>
          </div>
        </div>
      </Panel>

      <div className="min-w-0 space-y-6">
        {!result.hasBaseline ?
        <Panel>
            <EmptyState
            icon={TriangleAlertIcon}
            title={`No sales for ${selectedName} in the last ${period} days`}
            description="There is no baseline to simulate from. Pick another product or a longer period." />
          
          </Panel> :

        <>
            <section className="rounded-xl border border-line bg-surface p-6">
              <p className="text-sm text-ink-muted">Estimated gross profit · {selectedName}</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-ink">{inr(s.profit)}</p>
                <p className={`text-base font-medium tabular-nums ${profitDiff >= 0 ? 'text-brand-700' : 'text-danger-700'}`}>
                  {signedInr(profitDiff)} vs baseline {inr(b.profit)}
                </p>
              </div>
              <p className="mt-3 max-w-2xl text-sm text-ink-soft">
                {isUnchanged ?
              'Move a slider to compare a scenario against your actual results.' :
              result.breakEvenVolumePct === null ?
              'At this price you would be selling at or below purchase cost — every extra sale loses money.' :
              Math.abs(result.breakEvenVolumePct) < 0.5 ?
              'This price keeps profit per unit roughly unchanged.' :
              result.breakEvenVolumePct > 0 ?
              `To keep profit at the baseline, unit sales would need to rise by ${result.breakEvenVolumePct.toFixed(0)}% at this price.` :
              `At this price, you could sell ${Math.abs(result.breakEvenVolumePct).toFixed(0)}% fewer units and still match baseline profit.`}
              </p>
              {s.investment > 0 &&
            <p className="mt-2 text-sm text-ink-soft">
                  Extra stock needs <span className="font-medium text-ink">{inr(s.investment)}</span> upfront; unsold units stay on the shelf as inventory.
                </p>
            }
            </section>

            <div className="grid gap-6 xl:grid-cols-5">
              <Panel title="Baseline vs simulated" className="xl:col-span-3" bodyClassName="pb-2">
                <div className="overflow-x-auto">
                  <table className="mt-3 w-full min-w-[440px] text-sm">
                    <thead>
                      <tr className="border-b border-line text-left text-xs text-ink-muted">
                        <th scope="col" className="px-5 py-2 font-medium">Metric</th>
                        <th scope="col" className="px-3 py-2 text-right font-medium">Baseline</th>
                        <th scope="col" className="px-3 py-2 text-right font-medium">Simulated</th>
                        <th scope="col" className="px-5 py-2 text-right font-medium">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {rows.map((r) =>
                    <tr key={r.label} className={r.strong ? 'font-semibold text-ink' : 'text-ink-soft'}>
                          <td className="px-5 py-2.5">{r.label}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{r.base}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-ink">{r.sim}</td>
                          <td className="px-5 py-2.5 text-right tabular-nums">{r.change}</td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="At a glance" className="xl:col-span-2">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: CHART_COLORS.axis }} interval={0} />
                      <YAxis tickLine={false} axisLine={false} width={52} tick={{ fontSize: 11, fill: CHART_COLORS.axis }} tickFormatter={inrCompact} />
                      <Tooltip content={<ChartTooltip formatter={inr} />} cursor={{ fill: CHART_COLORS.cursor }} />
                      <Bar dataKey="baseline" name="Baseline" fill={CHART_COLORS.muted} radius={[3, 3, 0, 0]} maxBarSize={28} />
                      <Bar dataKey="simulated" name="Simulated" fill={CHART_COLORS.primary} radius={[3, 3, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>
          </>
        }

        <Panel title="Assumptions">
          <ul className="grid gap-x-8 gap-y-1.5 text-sm text-ink-soft md:grid-cols-2">
            <li>• Baseline = actual demo sales, prices and costs from the last {period} days.</li>
            <li>• Purchase cost per unit stays the same; discounts reduce only the selling price.</li>
            <li>• Unit sales change only through the price sensitivity you choose — there is no demand model.</li>
            <li>• Extra inventory adds sales only at the sell-through rate you set.</li>
            <li>• Profit is gross profit: rent, wages and other overheads are excluded.</li>
            <li>• Treat results as a what-if comparison, not a prediction of customer behaviour.</li>
          </ul>
        </Panel>
      </div>
    </div>);

}