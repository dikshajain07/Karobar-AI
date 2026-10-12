import React from 'react';
import { CheckCircle2Icon } from 'lucide-react';
import { useDemoData } from '../contexts/DemoDataContext';
import { useT } from '../contexts/LanguageContext';
import { STATUS_ORDER, URGENT_STATUSES, stockStatusKey } from '../utils/inventory';
import { formatDaysLeft, inr } from '../utils/format';
import { Panel } from '../components/Panel';
import { StatusPill, stockTone } from '../components/StatusPill';
import { EmptyState } from '../components/EmptyState';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { RestockPlanner } from '../components/inventory/RestockPlanner';

export function InventoryIntelligence() {
  const { insights, settings } = useDemoData();
  const t = useT();
  const rows = insights.inventory;

  const lowStock = rows.
  filter((r) => URGENT_STATUSES.includes(r.status)).
  sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || (a.daysOfStock ?? 0) - (b.daysOfStock ?? 0));
  const slow = rows.filter((r) => r.status === 'Slow-moving');
  const tiedUp = slow.reduce((s, r) => s + r.stockValue, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title={t('inv.lowTitle')} description={t('inv.lowDesc')} className="lg:col-span-3">
          {lowStock.length === 0 ?
          <EmptyState icon={CheckCircle2Icon} title={t('inv.lowEmpty')} description={t('inv.lowEmptyDesc')} /> :

          <ul className="divide-y divide-line">
              {lowStock.map((r) =>
            <li key={r.product.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-ink">{r.product.name}</p>
                      <StatusPill tone={stockTone(r.status)}>{t(stockStatusKey(r.status))}</StatusPill>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {t('inv.lowMeta', {
                    stock: r.product.stock,
                    left: r.product.stock <= 0 ? t('inv.emptyShelf') : t('inv.left', { days: formatDaysLeft(r.daysOfStock) }),
                    lead: r.product.leadTimeDays
                  })}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-sm text-ink-soft">{t('inv.orderUnits', { count: r.recommendedQty })}</p>
                </li>
            )}
            </ul>
          }
        </Panel>

        <Panel title={t('inv.slowTitle')} description={t('inv.slowDesc', { days: settings.slowMovingDays })} className="lg:col-span-2">
          {slow.length === 0 ?
          <EmptyState icon={CheckCircle2Icon} title={t('inv.slowEmpty')} /> :

          <>
              <p className="text-2xl font-semibold tabular-nums text-ink">{inr(tiedUp)}</p>
              <p className="text-xs text-ink-muted">{t('inv.tiedUp')}</p>
              <ul className="mt-4 divide-y divide-line">
                {slow.map((r) =>
              <li key={r.product.id} className="py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-medium text-ink">{r.product.name}</p>
                      <p className="whitespace-nowrap text-sm tabular-nums text-ink-soft">{inr(r.stockValue)}</p>
                    </div>
                    <p className="text-xs text-ink-muted">{t('inv.slowMeta', { stock: r.product.stock, days: formatDaysLeft(r.daysOfStock) })}</p>
                  </li>
              )}
              </ul>
            </>
          }
        </Panel>
      </div>

      <InventoryTable rows={rows} />
      <RestockPlanner rows={rows} />
    </div>);

}