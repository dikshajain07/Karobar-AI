import { PeriodDays } from '../types/data';
import { SectionId } from '../types/navigation';
import { ProductStat } from './analytics';
import { InventoryRow } from './inventory';
import { RootCauseResult } from './rootCause';
import { formatDaysLeft, inr, signedPct } from './format';
import { translate as t } from './i18n';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface Alert {
  id: string;
  severity: Severity;
  /** Higher = more urgent; used for ranking */
  score: number;
  title: string;
  detail: string;
  recommendation: string;
  section: SectionId;
}

/**
 * Turn inventory, root-cause and product data into a ranked list of actions.
 * Text is produced in the selected language; numbers and product names are inserted as-is.
 */
export function buildAlerts(
inventory: InventoryRow[],
rootCause: RootCauseResult,
stats: ProductStat[],
period: PeriodDays)
: Alert[] {
  const alerts: Alert[] = [];

  inventory.forEach((row) => {
    const p = row.product;
    const dailyRevenueAtRisk = row.avgDailyDemand * p.price;

    if (row.status === 'Out of stock') {
      alerts.push({
        id: `stockout-${p.id}`,
        severity: 'critical',
        score: 100 + Math.min(dailyRevenueAtRisk / 100, 40),
        title: t('alert.stockout.title', { name: p.name }),
        detail: t('alert.stockout.detail', { demand: row.avgDailyDemand.toFixed(1), amount: inr(dailyRevenueAtRisk) }),
        recommendation: t('alert.stockout.rec', { qty: row.recommendedQty, supplier: p.supplier, days: p.leadTimeDays }),
        section: 'inventory'
      });
    } else if (row.status === 'Reorder now') {
      alerts.push({
        id: `reorder-${p.id}`,
        severity: 'high',
        score: 80 + Math.min(dailyRevenueAtRisk / 200, 10),
        title: t('alert.reorder.title', { name: p.name }),
        detail: t('alert.reorder.detail', { stock: p.stock, days: formatDaysLeft(row.daysOfStock), lead: p.leadTimeDays }),
        recommendation: t('alert.reorder.rec', { qty: row.recommendedQty }),
        section: 'inventory'
      });
    } else if (row.status === 'Low stock') {
      alerts.push({
        id: `low-${p.id}`,
        severity: 'medium',
        score: 55 + Math.min(dailyRevenueAtRisk / 300, 10),
        title: t('alert.low.title', { name: p.name }),
        detail: t('alert.low.detail', { stock: p.stock, days: formatDaysLeft(row.daysOfStock) }),
        recommendation: t('alert.low.rec', { qty: row.recommendedQty }),
        section: 'inventory'
      });
    } else if (row.status === 'Slow-moving') {
      alerts.push({
        id: `slow-${p.id}`,
        severity: 'low',
        score: 30 + Math.min(row.stockValue / 2000, 10),
        title: t('alert.slow.title', { name: p.name }),
        detail: t('alert.slow.detail', { stock: p.stock, days: formatDaysLeft(row.daysOfStock), amount: inr(row.stockValue) }),
        recommendation: t('alert.slow.rec'),
        section: 'inventory'
      });
    }
  });

  if (rootCause.status === 'decline' && rootCause.revenueChangePct !== null) {
    const top = rootCause.drivers[0];
    alerts.push({
      id: `decline-${period}`,
      severity: 'high',
      score: 85,
      title: t('alert.decline.title', { pct: Math.abs(rootCause.revenueChangePct).toFixed(1), period }),
      detail: top ?
      t('alert.decline.detailTop', { name: top.stat.product.name, share: Math.round(top.share * 100) }) :
      t('alert.decline.detailSpread'),
      recommendation: t('alert.decline.rec'),
      section: 'rootcause'
    });
  }

  const grower = stats.
  filter((s) => s.revenueChangePct !== null && s.revenueChangePct >= 15 && s.revenue > 0).
  sort((a, b) => b.revenue - b.prevRevenue - (a.revenue - a.prevRevenue))[0];
  if (grower) {
    alerts.push({
      id: `growth-${grower.product.id}-${period}`,
      severity: 'low',
      score: 25,
      title: t('alert.growth.title', { name: grower.product.name, pct: signedPct(grower.revenueChangePct, 0) }),
      detail: t('alert.growth.detail', { prev: inr(grower.prevRevenue), curr: inr(grower.revenue), margin: grower.margin.toFixed(1) }),
      recommendation: t('alert.growth.rec'),
      section: 'analytics'
    });
  }

  return alerts.sort((a, b) => b.score - a.score);
}
