import React, { useState } from 'react';
import { PackageOpenIcon } from 'lucide-react';
import { ProductStat } from '../../utils/analytics';
import { formatNumber, inr } from '../../utils/format';
import { useT } from '../../contexts/LanguageContext';
import { Panel } from '../Panel';
import { SegmentedControl } from '../SegmentedControl';
import { EmptyState } from '../EmptyState';

type SortKey = 'revenue' | 'profit' | 'units';

export function TopProducts({ stats, className = '' }: {stats: ProductStat[];className?: string;}) {
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const t = useT();
  const ranked = [...stats].filter((s) => s.units > 0).sort((a, b) => b[sortKey] - a[sortKey]).slice(0, 6);
  const max = ranked[0]?.[sortKey] || 1;
  const format = (v: number) => sortKey === 'units' ? t('common.units', { count: formatNumber(v) }) : inr(v);

  return (
    <Panel
      title={t('top.title')}
      className={className}
      action={
      <SegmentedControl
        label={t('top.rankBy')}
        value={sortKey}
        onChange={setSortKey}
        options={[
        { value: 'revenue', label: t('metric.revenue') },
        { value: 'profit', label: t('metric.profit') },
        { value: 'units', label: t('metric.units') }]
        } />

      }>
      
      {ranked.length === 0 ?
      <EmptyState icon={PackageOpenIcon} title={t('top.empty')} /> :

      <ol className="space-y-4">
          {ranked.map((s, i) =>
        <li key={s.product.id}>
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    <span className="mr-2 tabular-nums text-ink-muted">{i + 1}</span>
                    {s.product.name}
                  </p>
                  <p className="ml-5 text-xs text-ink-muted">{t('top.meta', { units: formatNumber(s.units), margin: s.margin.toFixed(1) })}</p>
                </div>
                <p className="whitespace-nowrap text-sm font-semibold tabular-nums text-ink">{format(s[sortKey])}</p>
              </div>
              <div className="ml-5 mt-2 h-1.5 overflow-hidden rounded-full bg-canvas" aria-hidden="true">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${s[sortKey] / max * 100}%` }} />
              </div>
            </li>
        )}
        </ol>
      }
    </Panel>);

}