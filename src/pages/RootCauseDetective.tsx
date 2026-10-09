import React from 'react';
import { TKey } from '../data/i18n';
import { useDemoData } from '../contexts/DemoDataContext';
import { useT } from '../contexts/LanguageContext';
import { RootCauseStatus } from '../utils/rootCause';
import { dateForDaysAgo } from '../utils/transactions';
import { formatDate, formatNumber, inr, signedInr, signedPct } from '../utils/format';
import { Panel } from '../components/Panel';
import { StatusPill, Tone } from '../components/StatusPill';
import { DriverList } from '../components/rootcause/DriverList';
import { ContributionChart } from '../components/rootcause/ContributionChart';
import { DriverTrendChart } from '../components/rootcause/DriverTrendChart';

const STATUS_META: Record<RootCauseStatus, {labelKey: TKey;tone: Tone;}> = {
  decline: { labelKey: 'rc.status.decline', tone: 'danger' },
  growth: { labelKey: 'rc.status.growth', tone: 'success' },
  stable: { labelKey: 'rc.status.stable', tone: 'neutral' },
  insufficient: { labelKey: 'rc.status.insufficient', tone: 'warn' }
};

const fmtDate = (d: Date) => formatDate(d, { day: 'numeric', month: 'short' });

export function RootCauseDetective() {
  const { insights, period } = useDemoData();
  const t = useT();
  const rc = insights.rootCause;
  const meta = STATUS_META[rc.status];

  const currentRange = `${fmtDate(dateForDaysAgo(period - 1))} – ${fmtDate(dateForDaysAgo(0))}`;
  const previousRange = `${fmtDate(dateForDaysAgo(period * 2 - 1))} – ${fmtDate(dateForDaysAgo(period))}`;

  const metrics = [
  { id: 'revenue', label: t('metric.revenue'), prev: inr(rc.previous.revenue), cur: inr(rc.current.revenue), change: rc.revenueChangePct },
  { id: 'orders', label: t('metric.orders'), prev: formatNumber(rc.previous.orders), cur: formatNumber(rc.current.orders), change: rc.ordersChangePct },
  { id: 'aov', label: t('kpi.aov'), prev: inr(rc.previous.aov), cur: inr(rc.current.aov), change: rc.aovChangePct }];


  const defaultProduct = rc.drivers[0]?.stat.product.id ?? rc.productDeltas[0]?.id ?? 'atta';

  return (
    <div className="space-y-6">
      {/* Verdict: the one thing the merchant came here for */}
      <section className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="grid lg:grid-cols-[1.5fr_1fr]">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={meta.tone}>{t(meta.labelKey)}</StatusPill>
              <span className="text-xs text-ink-muted">{t('rc.confidence', { level: t(`rc.conf.${rc.confidence}` as TKey) })}</span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{rc.headline}</h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{rc.summary}</p>
            <p className="mt-4 text-xs text-ink-muted">{t('rc.comparing', { current: currentRange, previous: previousRange })}</p>
          </div>
          <dl className="grid grid-cols-3 border-t border-line bg-canvas/60 lg:border-l lg:border-t-0">
            {metrics.map((m, i) => {
              const down = (m.change ?? 0) < 0;
              return (
                <div key={m.id} className={`p-5 ${i > 0 ? 'border-l border-line' : ''} lg:border-l-0 ${i > 0 ? 'lg:border-t' : ''} lg:col-span-3 lg:flex lg:items-center lg:justify-between lg:gap-4`}>
                  <dt className="text-xs text-ink-muted">{m.label}</dt>
                  <dd className="mt-1 lg:mt-0 lg:text-right">
                    <p className="text-base font-semibold tabular-nums text-ink">{m.cur}</p>
                    <p className="text-xs tabular-nums text-ink-muted">
                      {t('rc.was', { value: m.prev })} ·{' '}
                      <span className={`font-medium ${down ? 'text-danger-700' : 'text-brand-700'}`}>{signedPct(m.change)}</span>
                    </p>
                  </dd>
                </div>);

            })}
          </dl>
        </div>
        {(rc.status === 'decline' || rc.status === 'growth') &&
        <div className="border-t border-line px-6 py-3.5 text-sm text-ink-soft">
            <span className="font-medium text-ink">{t('rc.ordersVsBasket')} </span>
            {rc.ordersInsight}
          </div>
        }
      </section>

      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title={t('rc.factorsTitle')} description={t('rc.factorsDesc')} className="xl:col-span-3">
          <DriverList drivers={rc.drivers} status={rc.status} />
        </Panel>

        <Panel title={t('rc.actionsTitle')} description={t('rc.actionsDesc')} className="xl:col-span-2">
          <ol className="space-y-3">
            {rc.actions.map((action, i) =>
            <li key={action} className="flex gap-3 text-sm text-ink-soft">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-contrast text-xs font-semibold text-contrast-on">
                  {i + 1}
                </span>
                <span className="pt-0.5">{action}</span>
              </li>
            )}
          </ol>
          {rc.status === 'decline' && rc.ordersEffect < 0 &&
          <p className="mt-5 border-t border-line pt-4 text-xs text-ink-muted">
              {t('rc.effects', { orders: signedInr(rc.ordersEffect), aov: signedInr(rc.aovEffect) })}
            </p>
          }
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ContributionChart deltas={rc.productDeltas} />
        <DriverTrendChart key={`${defaultProduct}-${period}`} defaultProductId={defaultProduct} />
      </div>

      <Panel title={t('rc.howTitle')}>
        <ul className="space-y-1.5">
          {rc.notes.map((note) =>
          <li key={note} className="flex gap-2 text-sm text-ink-soft">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted" aria-hidden="true" />
              {note}
            </li>
          )}
          {rc.threshold > 0 &&
          <li className="flex gap-2 text-sm text-ink-soft">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted" aria-hidden="true" />
              {t('rc.threshold', { pct: rc.threshold.toFixed(1) })}
            </li>
          }
        </ul>
      </Panel>
    </div>);

}