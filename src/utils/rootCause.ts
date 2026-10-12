import { PeriodDays, Transaction } from '../types/data';
import {
  Kpis,
  ProductStat,
  computeKpis,
  currentPeriod,
  dailySeries,
  previousPeriod,
  zeroSaleStreak } from
'./analytics';
import { changePct, inr, signedInr, signedPct } from './format';
import { translate as t } from './i18n';

export type RootCauseStatus = 'decline' | 'growth' | 'stable' | 'insufficient';
export type CauseType = 'stockout' | 'price' | 'demand' | 'growth';
export type Confidence = 'High' | 'Medium' | 'Low';

export interface Driver {
  stat: ProductStat;
  delta: number;
  /** Share of the total decline (or growth) this product explains, 0–1 */
  share: number;
  cause: CauseType;
  streakDays: number;
  evidence: string[];
  action: string;
}

export interface ProductDelta {
  id: string;
  name: string;
  delta: number;
}

export interface RootCauseResult {
  status: RootCauseStatus;
  period: PeriodDays;
  current: Kpis;
  previous: Kpis;
  revenueChangePct: number | null;
  ordersChangePct: number | null;
  aovChangePct: number | null;
  ordersEffect: number;
  aovEffect: number;
  threshold: number;
  headline: string;
  summary: string;
  ordersInsight: string;
  confidence: Confidence;
  drivers: Driver[];
  productDeltas: ProductDelta[];
  actions: string[];
  notes: string[];
}

const MIN_ORDERS = 30;

/*
 * All explanations are written in the selected language via translate().
 * Numbers, rupee amounts and product names are inserted unchanged.
 */

/** Explain whether the change came from fewer/more orders or from basket size. */
function describeOrdersVsBasket(
ordersEffect: number,
aovEffect: number,
ordersChange: number | null,
aovChange: number | null)
{
  const vars = {
    ordersPct: signedPct(ordersChange),
    ordersAmt: signedInr(ordersEffect),
    aovPct: signedPct(aovChange),
    aovAmt: signedInr(aovEffect)
  };
  return Math.abs(ordersEffect) >= Math.abs(aovEffect) ? t('rc.ordersDriven', vars) : t('rc.basketDriven', vars);
}

/** Look at the evidence for one declining product and decide the most likely cause. */
function diagnoseDecline(
stat: ProductStat,
delta: number,
share: number,
txns: Transaction[],
period: PeriodDays)
: Driver {
  const { product } = stat;
  const streakDays = zeroSaleStreak(txns, product.id);
  const priceChange = changePct(stat.avgPrice, stat.prevAvgPrice);
  const unitsText = t('rc.unitsText', { prev: stat.prevUnits, curr: stat.units, pct: signedPct(stat.unitsChangePct, 0) });
  const base = { stat, delta, share, streakDays };

  // Evidence 1: no stock + recent zero-sale days → stock-out
  if (product.stock <= 0) {
    const lostPerDay = stat.prevRevenue / period;
    return {
      ...base,
      cause: 'stockout',
      evidence: [
      streakDays > 0 ? t('rc.ev.noSalesDays', { count: streakDays }) : t('rc.ev.soldRecently'),
      t('rc.ev.stockZero'),
      unitsText],

      action: t('rc.act.restock', { name: product.name, days: product.leadTimeDays, amount: inr(lostPerDay) })
    };
  }

  // Evidence 2: selling price went up while units fell → price effect
  if (priceChange !== null && priceChange >= 3) {
    return {
      ...base,
      cause: 'price',
      evidence: [
      t('rc.ev.price', { prev: inr(stat.prevAvgPrice), curr: inr(stat.avgPrice), pct: signedPct(priceChange) }),
      unitsText,
      t('rc.ev.inStock', { stock: product.stock })],

      action: t('rc.act.price', { name: product.name })
    };
  }

  // Otherwise: fewer units at a steady price → lower demand
  const evidence = [unitsText, t('rc.ev.priceSteady', { amount: inr(stat.avgPrice) })];
  if (streakDays >= 3) evidence.push(t('rc.ev.verifyShelf', { count: streakDays, stock: product.stock }));
  return {
    ...base,
    cause: 'demand',
    evidence,
    action: t('rc.act.demand', { name: product.name })
  };
}

function causePhrase(d: Driver): string {
  if (d.cause === 'stockout') {
    return d.streakDays > 0 ? t('rc.cause.stockoutStreak', { count: d.streakDays }) : t('rc.cause.stockout');
  }
  if (d.cause === 'price') return t('rc.cause.price', { pct: signedPct(changePct(d.stat.avgPrice, d.stat.prevAvgPrice)) });
  return t('rc.cause.demand');
}

export function analyseRootCause(
txns: Transaction[],
period: PeriodDays,
stats: ProductStat[])
: RootCauseResult {
  const current = computeKpis(currentPeriod(txns, period));
  const previous = computeKpis(previousPeriod(txns, period));
  const revenueChangePct = changePct(current.revenue, previous.revenue);
  const ordersChangePct = changePct(current.orders, previous.orders);
  const aovChangePct = changePct(current.aov, previous.aov);

  // Revenue = orders × average order value, so the change splits exactly into two parts.
  const ordersEffect = (current.orders - previous.orders) * previous.aov;
  const aovEffect = (current.aov - previous.aov) * current.orders;

  const productDeltas: ProductDelta[] = stats.
  map((s) => ({ id: s.product.id, name: s.product.name, delta: s.revenue - s.prevRevenue })).
  sort((a, b) => a.delta - b.delta);

  const notes = [t('rc.note1', { period }), t('rc.note2'), t('rc.note3')];
  const amounts = { period, current: inr(current.revenue), previous: inr(previous.revenue) };

  const base = {
    period,
    current,
    previous,
    revenueChangePct,
    ordersChangePct,
    aovChangePct,
    ordersEffect,
    aovEffect,
    productDeltas,
    notes,
    ordersInsight: describeOrdersVsBasket(ordersEffect, aovEffect, ordersChangePct, aovChangePct)
  };

  // 1. Not enough data to compare
  if (current.orders < MIN_ORDERS || previous.orders < MIN_ORDERS || revenueChangePct === null) {
    return {
      ...base,
      status: 'insufficient',
      threshold: 0,
      headline: t('rc.insufficient.headline'),
      summary: t('rc.insufficient.summary', { min: MIN_ORDERS, current: current.orders, previous: previous.orders }),
      confidence: 'Low',
      drivers: [],
      actions: [t('rc.insufficient.action')]
    };
  }

  // 2. Noise threshold: ~2 standard errors of the previous period's daily revenue.
  const prevDaily = dailySeries(txns, period).map((p) => p.prevRevenue);
  const mean = prevDaily.reduce((s, v) => s + v, 0) / prevDaily.length;
  const variance = prevDaily.reduce((s, v) => s + (v - mean) ** 2, 0) / prevDaily.length;
  const threshold = Math.max(5, mean > 0 ? 2 * Math.sqrt(variance) / Math.sqrt(period) / mean * 100 : 5);

  if (Math.abs(revenueChangePct) < threshold) {
    const biggestDrop = productDeltas[0];
    return {
      ...base,
      status: 'stable',
      threshold,
      headline: t('rc.stable.headline', { pct: signedPct(revenueChangePct) }),
      summary: t('rc.stable.summary', { ...amounts, pct: signedPct(revenueChangePct), threshold: threshold.toFixed(1) }),
      confidence: 'Low',
      drivers: [],
      actions: [
      period < 30 ? t('rc.stable.act30') : t('rc.stable.actMonitor'),
      ...(biggestDrop && biggestDrop.delta < 0 ? [t('rc.stable.watch', { name: biggestDrop.name, amount: signedInr(biggestDrop.delta) })] : [])]

    };
  }

  // 3. Revenue declined: find which products explain it.
  if (revenueChangePct < 0) {
    const grossDecline = productDeltas.filter((d) => d.delta < 0).reduce((s, d) => s + Math.abs(d.delta), 0);
    const drivers = stats.
    map((s) => ({ s, delta: s.revenue - s.prevRevenue })).
    filter(({ s, delta }) => delta < 0 && Math.abs(delta) / grossDecline >= 0.1 && (s.revenueChangePct ?? 0) <= -15).
    sort((a, b) => a.delta - b.delta).
    slice(0, 4).
    map(({ s, delta }) => diagnoseDecline(s, delta, Math.abs(delta) / grossDecline, txns, period));

    const coverage = drivers.reduce((s, d) => s + d.share, 0);
    const strongEvidence = drivers[0] && drivers[0].cause !== 'demand';
    const confidence: Confidence =
    drivers.length === 0 ? 'Low' : coverage >= 0.6 && strongEvidence ? 'High' : coverage >= 0.4 ? 'Medium' : 'Low';

    const pct = Math.abs(revenueChangePct).toFixed(1);
    const top = drivers[0];
    let summary = t('rc.decline.summary', { ...amounts, pct });
    if (top) summary += ` ${t('rc.decline.top', { name: top.stat.product.name, share: Math.round(top.share * 100), cause: causePhrase(top) })}`;
    if (drivers[1]) summary += ` ${t('rc.decline.second', { name: drivers[1].stat.product.name, share: Math.round(drivers[1].share * 100), cause: causePhrase(drivers[1]) })}`;
    if (!top) summary += ` ${t('rc.decline.spread')}`;

    const grower = stats.
    filter((s) => s.revenue - s.prevRevenue > 0 && (s.revenueChangePct ?? 0) >= 10).
    sort((a, b) => b.revenue - b.prevRevenue - (a.revenue - a.prevRevenue))[0];

    return {
      ...base,
      status: 'decline',
      threshold,
      headline: top ? t('rc.decline.headlineTop', { pct, name: top.stat.product.name }) : t('rc.decline.headlineNone', { pct }),
      summary,
      confidence,
      drivers,
      actions: [
      ...drivers.map((d) => d.action),
      ...(grower ? [t('rc.act.protect', { name: grower.product.name, pct: signedPct(grower.revenueChangePct, 0) })] : []),
      ...(drivers.length === 0 ? [t('rc.act.footfall')] : [])]

    };
  }

  // 4. Revenue grew: show which products drove the increase.
  const grossGain = productDeltas.filter((d) => d.delta > 0).reduce((s, d) => s + d.delta, 0);
  const growers: Driver[] = stats.
  map((s) => ({ s, delta: s.revenue - s.prevRevenue })).
  filter(({ s, delta }) => delta > 0 && delta / grossGain >= 0.1 && (s.revenueChangePct ?? 100) >= 10).
  sort((a, b) => b.delta - a.delta).
  slice(0, 3).
  map(({ s, delta }) => ({
    stat: s,
    delta,
    share: delta / grossGain,
    cause: 'growth' as const,
    streakDays: 0,
    evidence: [
    t('rc.unitsText', { prev: s.prevUnits, curr: s.units, pct: signedPct(s.unitsChangePct, 0) }),
    t('rc.ev.growthPrice', { amount: inr(s.avgPrice), margin: s.margin.toFixed(1) })],

    action: t('rc.act.growth', { name: s.product.name, stock: s.product.stock })
  }));

  const topGrower = growers[0];
  const pct = revenueChangePct.toFixed(1);
  return {
    ...base,
    status: 'growth',
    threshold,
    headline: t('rc.growth.headline', { pct }),
    summary: `${t('rc.growth.summary', { ...amounts, pct })} ${
    topGrower ? t('rc.growth.top', { name: topGrower.stat.product.name, share: Math.round(topGrower.share * 100) }) : t('rc.growth.even')}`,

    confidence: growers.length > 0 ? 'Medium' : 'Low',
    drivers: growers,
    actions: growers.length > 0 ? growers.map((g) => g.action) : [t('rc.act.broad')]
  };
}