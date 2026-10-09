import { Category, PeriodDays, Product, Transaction } from '../types/data';
import { dateForDaysAgo, toIsoDate } from './transactions';
import { changePct, formatShortDate } from './format';

export interface Kpis {
  revenue: number;
  profit: number;
  orders: number;
  units: number;
  aov: number;
}

export interface ProductStat {
  product: Product;
  units: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  avgPrice: number;
  prevUnits: number;
  prevRevenue: number;
  prevAvgPrice: number;
  revenueChangePct: number | null;
  unitsChangePct: number | null;
}

export interface DailyPoint {
  date: string;
  label: string;
  revenue: number;
  profit: number;
  orders: number;
  prevRevenue: number;
  prevProfit: number;
  prevOrders: number;
}

/** Orders where startDaysAgo <= daysAgo < startDaysAgo + length */
export function txnsInWindow(txns: Transaction[], startDaysAgo: number, length: number) {
  return txns.filter((t) => t.daysAgo >= startDaysAgo && t.daysAgo < startDaysAgo + length);
}

export const currentPeriod = (txns: Transaction[], period: PeriodDays) => txnsInWindow(txns, 0, period);
export const previousPeriod = (txns: Transaction[], period: PeriodDays) => txnsInWindow(txns, period, period);

export function computeKpis(txns: Transaction[]): Kpis {
  let revenue = 0;
  let cost = 0;
  let units = 0;
  txns.forEach((t) =>
  t.lines.forEach((l) => {
    revenue += l.qty * l.unitPrice;
    cost += l.qty * l.unitCost;
    units += l.qty;
  })
  );
  const orders = txns.length;
  return { revenue, profit: revenue - cost, orders, units, aov: orders ? revenue / orders : 0 };
}

/** Revenue / profit / orders grouped by day (keyed by daysAgo). */
function dailyBuckets(txns: Transaction[]) {
  const buckets = new Map<number, {revenue: number;profit: number;orders: number;}>();
  txns.forEach((t) => {
    const b = buckets.get(t.daysAgo) ?? { revenue: 0, profit: 0, orders: 0 };
    t.lines.forEach((l) => {
      b.revenue += l.qty * l.unitPrice;
      b.profit += l.qty * (l.unitPrice - l.unitCost);
    });
    b.orders += 1;
    buckets.set(t.daysAgo, b);
  });
  return buckets;
}

/** One point per day of the selected period, paired with the same day of the previous period. */
export function dailySeries(txns: Transaction[], period: PeriodDays): DailyPoint[] {
  const buckets = dailyBuckets(txns);
  const points: DailyPoint[] = [];
  for (let d = period - 1; d >= 0; d--) {
    const cur = buckets.get(d);
    const prev = buckets.get(d + period);
    const iso = toIsoDate(dateForDaysAgo(d));
    points.push({
      date: iso,
      label: formatShortDate(iso),
      revenue: cur?.revenue ?? 0,
      profit: cur?.profit ?? 0,
      orders: cur?.orders ?? 0,
      prevRevenue: prev?.revenue ?? 0,
      prevProfit: prev?.profit ?? 0,
      prevOrders: prev?.orders ?? 0
    });
  }
  return points;
}

interface Totals {
  units: number;
  revenue: number;
  cost: number;
}

function totalsByProduct(txns: Transaction[]) {
  const map = new Map<string, Totals>();
  txns.forEach((t) =>
  t.lines.forEach((l) => {
    const row = map.get(l.productId) ?? { units: 0, revenue: 0, cost: 0 };
    row.units += l.qty;
    row.revenue += l.qty * l.unitPrice;
    row.cost += l.qty * l.unitCost;
    map.set(l.productId, row);
  })
  );
  return map;
}

export function productStats(products: Product[], txns: Transaction[], period: PeriodDays): ProductStat[] {
  const cur = totalsByProduct(currentPeriod(txns, period));
  const prev = totalsByProduct(previousPeriod(txns, period));
  const empty: Totals = { units: 0, revenue: 0, cost: 0 };

  return products.map((product) => {
    const c = cur.get(product.id) ?? empty;
    const p = prev.get(product.id) ?? empty;
    const profit = c.revenue - c.cost;
    return {
      product,
      units: c.units,
      revenue: c.revenue,
      cost: c.cost,
      profit,
      margin: c.revenue > 0 ? profit / c.revenue * 100 : 0,
      avgPrice: c.units > 0 ? c.revenue / c.units : product.price,
      prevUnits: p.units,
      prevRevenue: p.revenue,
      prevAvgPrice: p.units > 0 ? p.revenue / p.units : product.price,
      revenueChangePct: changePct(c.revenue, p.revenue),
      unitsChangePct: changePct(c.units, p.units)
    };
  });
}

export function categoryStats(stats: ProductStat[]) {
  const map = new Map<Category, {category: Category;revenue: number;profit: number;}>();
  stats.forEach((s) => {
    const row = map.get(s.product.category) ?? { category: s.product.category, revenue: 0, profit: 0 };
    row.revenue += s.revenue;
    row.profit += s.profit;
    map.set(s.product.category, row);
  });
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Average revenue per weekday inside the selected period. */
export function weekdayStats(txns: Transaction[], period: PeriodDays) {
  const buckets = dailyBuckets(currentPeriod(txns, period));
  const acc = WEEKDAY_NAMES.map(() => ({ revenue: 0, orders: 0, days: 0 }));
  for (let d = 0; d < period; d++) {
    const wd = dateForDaysAgo(d).getDay();
    const b = buckets.get(d);
    acc[wd].days += 1;
    acc[wd].revenue += b?.revenue ?? 0;
    acc[wd].orders += b?.orders ?? 0;
  }
  return [1, 2, 3, 4, 5, 6, 0].
  filter((i) => acc[i].days > 0).
  map((i) => ({
    day: WEEKDAY_NAMES[i],
    avgRevenue: acc[i].revenue / acc[i].days,
    avgOrders: acc[i].orders / acc[i].days
  }));
}

/** Units sold per day for one product, this period vs previous period. */
export function productDailyUnits(txns: Transaction[], productId: string, period: PeriodDays) {
  const units = new Map<number, number>();
  txns.forEach((t) => {
    if (t.daysAgo >= period * 2) return;
    t.lines.forEach((l) => {
      if (l.productId === productId) units.set(t.daysAgo, (units.get(t.daysAgo) ?? 0) + l.qty);
    });
  });
  return Array.from({ length: period }, (_, i) => {
    const d = period - 1 - i;
    const iso = toIsoDate(dateForDaysAgo(d));
    return { label: formatShortDate(iso), units: units.get(d) ?? 0, prevUnits: units.get(d + period) ?? 0 };
  });
}

/** How many consecutive days (counting back from the last day) a product has had zero sales. */
export function zeroSaleStreak(txns: Transaction[], productId: string, maxDays = 60): number {
  const daysWithSales = new Set<number>();
  txns.forEach((t) => {
    if (t.daysAgo < maxDays && t.lines.some((l) => l.productId === productId)) daysWithSales.add(t.daysAgo);
  });
  let streak = 0;
  while (streak < maxDays && !daysWithSales.has(streak)) streak++;
  return streak;
}