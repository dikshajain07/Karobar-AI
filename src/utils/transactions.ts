import { Customer, OrderLine, PaymentMethod, Product, Transaction } from '../types/data';
import { WALK_IN_ID } from '../data/customers';

/**
 * DEMO DATA GENERATOR
 * Sample history always ends "today" and uses a seeded random generator,
 * so the same story appears on every visit.
 */
const now = new Date();
export const DEMO_TODAY = new Date(now.getFullYear(), now.getMonth(), now.getDate());
export const HISTORY_DAYS = 180;

/** Small deterministic pseudo-random generator (mulberry32). */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function dateForDaysAgo(daysAgo: number): Date {
  const d = new Date(DEMO_TODAY);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

export function toIsoDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Whole days between an ISO date and today (0 = today). */
export function daysAgoFromIso(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round((DEMO_TODAY.getTime() - new Date(y, m - 1, d).getTime()) / 86400000);
}

export function makeInvoiceId(seq: number): string {
  return `INV-${toIsoDate(DEMO_TODAY).replace(/-/g, '').slice(2)}-${String(seq).padStart(4, '0')}`;
}

/**
 * The demo "story" baked into the data. The analysis code does NOT know about
 * these rules — it has to discover them from the transactions.
 *  - Sunflower oil ran low ~16 days ago and has been out of stock for 12 days.
 *  - Basmati rice got a supplier price hike 35 days ago and demand halved.
 *  - Maggi has been trending up for the last 3 weeks.
 */
function demandMultiplier(productId: string, daysAgo: number): number {
  if (productId === 'oil') {
    if (daysAgo <= 11) return 0;
    if (daysAgo <= 16) return 0.55;
  }
  if (productId === 'rice' && daysAgo <= 35) return 0.5;
  if (productId === 'maggi' && daysAgo <= 20) return 1.3;
  return 1;
}

function historicalPricing(product: Product, daysAgo: number) {
  if (product.id === 'rice' && daysAgo > 35) return { price: 640, cost: 540 };
  return { price: product.price, cost: product.cost };
}

/** Combine duplicate products inside one order. */
function mergeLines(lines: OrderLine[]): OrderLine[] {
  const merged = new Map<string, OrderLine>();
  lines.forEach((line) => {
    const existing = merged.get(line.productId);
    if (existing) existing.qty += line.qty;else
    merged.set(line.productId, { ...line });
  });
  return Array.from(merged.values());
}

export function generateTransactions(products: Product[], customers: Customer[]): Transaction[] {
  const rand = seededRandom(20261009);
  const regulars = customers.filter((c) => c.id !== WALK_IN_ID);
  const walkIn = customers.find((c) => c.id === WALK_IN_ID) ?? { id: WALK_IN_ID, name: 'Walk-in customer' };
  const all: Transaction[] = [];
  let counter = 0;

  for (let daysAgo = HISTORY_DAYS - 1; daysAgo >= 0; daysAgo--) {
    const day = dateForDaysAgo(daysAgo);
    const iso = toIsoDate(day);
    const weekday = day.getDay();
    // Weekends are busier, Mondays a little quieter.
    const dayFactor = weekday === 0 || weekday === 6 ? 1.25 : weekday === 1 ? 0.9 : 1;

    // 1. Decide how many units of each product sell today.
    const lines: OrderLine[] = [];
    products.forEach((p) => {
      const expected = p.baseDailyDemand * dayFactor * demandMultiplier(p.id, daysAgo);
      let units = Math.round(expected * (0.7 + rand() * 0.6));
      const { price, cost } = historicalPricing(p, daysAgo);
      while (units > 0) {
        const qty = Math.min(units, rand() < 0.7 ? 1 : 2);
        lines.push({ productId: p.id, qty, unitPrice: price, unitCost: cost });
        units -= qty;
      }
    });

    // 2. Shuffle the lines and group them into customer orders of 1–3 lines.
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }

    const dayOrders: Transaction[] = [];
    let i = 0;
    while (i < lines.length) {
      const size = 1 + Math.floor(rand() * 3);
      const orderLines = mergeLines(lines.slice(i, i + size));
      i += size;
      const minutes = 8 * 60 + Math.floor(rand() * 13 * 60);
      const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
      const r = rand();
      const payment: PaymentMethod = r < 0.6 ? 'UPI' : r < 0.9 ? 'Cash' : 'Card';
      const customer = rand() < 0.45 || regulars.length === 0 ? walkIn : regulars[Math.floor(rand() * regulars.length)];
      const total = orderLines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
      dayOrders.push({
        id: '',
        date: iso,
        daysAgo,
        time,
        customerId: customer.id,
        customer: customer.name,
        payment,
        lines: orderLines,
        subtotal: total,
        discount: 0,
        total,
        source: 'demo'
      });
    }

    dayOrders.sort((a, b) => a.time.localeCompare(b.time));
    dayOrders.forEach((order) => {
      counter += 1;
      order.id = `KB-${String(counter).padStart(5, '0')}`;
      all.push(order);
    });
  }

  return all;
}