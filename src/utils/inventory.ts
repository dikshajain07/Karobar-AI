import { Product, ShopSettings, Transaction } from '../types/data';
import { TKey } from '../data/i18n';

export type StockStatus = 'Out of stock' | 'Reorder now' | 'Low stock' | 'Healthy' | 'Slow-moving';

export const DEMAND_WINDOW_DAYS = 30;
export const URGENT_STATUSES: StockStatus[] = ['Out of stock', 'Reorder now', 'Low stock'];
export const STATUS_ORDER: Record<StockStatus, number> = {
  'Out of stock': 0,
  'Reorder now': 1,
  'Low stock': 2,
  Healthy: 3,
  'Slow-moving': 4
};

/** Translation key for a stock status (the status value itself stays in English for logic). */
export function stockStatusKey(status: StockStatus): TKey {
  return `stockStatus.${status}` as TKey;
}

export interface InventoryRow {
  product: Product;
  unitsSold: number;
  sellingDays: number;
  avgDailyDemand: number;
  /** null when there were no recent sales */
  daysOfStock: number | null;
  status: StockStatus;
  recommendedQty: number;
  orderCost: number;
  stockValue: number;
}

/**
 * Restock formula:
 *   target stock = average daily demand × (lead time + coverage days) × (1 + safety buffer)
 *   order quantity = target stock − current stock (never below zero)
 */
export function recommendRestockQty(
avgDaily: number,
leadTimeDays: number,
coverageDays: number,
bufferPct: number,
stock: number)
: number {
  const target = avgDaily * (leadTimeDays + coverageDays) * (1 + bufferPct / 100);
  return Math.max(0, Math.ceil(target - stock));
}

export function buildInventory(
products: Product[],
txns: Transaction[],
settings: ShopSettings)
: InventoryRow[] {
  const recent = txns.filter((t) => t.daysAgo < DEMAND_WINDOW_DAYS);

  return products.map((product) => {
    let unitsSold = 0;
    const days = new Set<number>();
    recent.forEach((t) =>
    t.lines.forEach((l) => {
      if (l.productId === product.id) {
        unitsSold += l.qty;
        days.add(t.daysAgo);
      }
    })
    );
    const sellingDays = days.size;

    // If an item is out of stock, days with no sales were lost sales, not zero demand.
    // So we average over the days it actually sold to avoid under-ordering.
    const avgDailyDemand =
    product.stock <= 0 && sellingDays > 0 ? unitsSold / sellingDays : unitsSold / DEMAND_WINDOW_DAYS;

    const daysOfStock = avgDailyDemand > 0 ? product.stock / avgDailyDemand : null;

    let status: StockStatus;
    if (product.stock <= 0) status = 'Out of stock';else
    if (daysOfStock !== null && daysOfStock <= product.leadTimeDays) status = 'Reorder now';else
    if (daysOfStock !== null && daysOfStock <= product.leadTimeDays + 7) status = 'Low stock';else
    if (daysOfStock === null || daysOfStock > settings.slowMovingDays) status = 'Slow-moving';else
    status = 'Healthy';

    const recommendedQty =
    status === 'Slow-moving' ?
    0 :
    recommendRestockQty(
      avgDailyDemand,
      product.leadTimeDays,
      settings.targetCoverageDays,
      settings.safetyBufferPct,
      product.stock
    );

    return {
      product,
      unitsSold,
      sellingDays,
      avgDailyDemand,
      daysOfStock,
      status,
      recommendedQty,
      orderCost: recommendedQty * product.cost,
      stockValue: Math.max(0, product.stock) * product.cost
    };
  });
}