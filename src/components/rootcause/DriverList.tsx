import React from 'react';
import { ScaleIcon } from 'lucide-react';
import { TKey } from '../../data/i18n';
import { useT } from '../../contexts/LanguageContext';
import { CauseType, Driver, RootCauseStatus } from '../../utils/rootCause';
import { inr, signedInr } from '../../utils/format';
import { StatusPill, Tone } from '../StatusPill';
import { EmptyState } from '../EmptyState';

const CAUSE_META: Record<CauseType, {labelKey: TKey;tone: Tone;}> = {
  stockout: { labelKey: 'rc.causeLabel.stockout', tone: 'danger' },
  price: { labelKey: 'rc.causeLabel.price', tone: 'warn' },
  demand: { labelKey: 'rc.causeLabel.demand', tone: 'info' },
  growth: { labelKey: 'rc.causeLabel.growth', tone: 'success' }
};

export function DriverList({ drivers, status }: {drivers: Driver[];status: RootCauseStatus;}) {
  const t = useT();
  if (drivers.length === 0) {
    return (
      <EmptyState
        icon={ScaleIcon}
        title={t('rc.noDriver')}
        description={status === 'stable' || status === 'insufficient' ? t('rc.noDriverSmall') : t('rc.noDriverSpread')} />);


  }

  return (
    <ol className="divide-y divide-line">
      {drivers.map((d) => {
        const meta = CAUSE_META[d.cause];
        const share = Math.round(d.share * 100);
        return (
          <li key={d.stat.product.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">{d.stat.product.name}</h3>
                  <StatusPill tone={meta.tone}>{t(meta.labelKey)}</StatusPill>
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">{t('rc.revenueMove', { prev: inr(d.stat.prevRevenue), curr: inr(d.stat.revenue) })}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold tabular-nums ${d.delta < 0 ? 'text-danger-700' : 'text-brand-700'}`}>{signedInr(d.delta)}</p>
                <p className="text-xs text-ink-muted">{status === 'growth' ? t('rc.shareIncrease', { share }) : t('rc.shareDecline', { share })}</p>
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas" aria-hidden="true">
              <div className={`h-full rounded-full ${d.delta < 0 ? 'bg-danger-600' : 'bg-brand-500'}`} style={{ width: `${Math.min(100, d.share * 100)}%` }} />
            </div>
            <ul className="mt-3 space-y-1">
              {d.evidence.map((e) =>
              <li key={e} className="flex gap-2 text-sm text-ink-soft">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted" aria-hidden="true" />
                  {e}
                </li>
              )}
            </ul>
          </li>);

      })}
    </ol>);

}