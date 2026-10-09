import { PeriodDays, ShopSettings } from '../types/data';
import { SectionId } from '../types/navigation';
import { Kpis, ProductStat } from './analytics';
import { InventoryRow, STATUS_ORDER, URGENT_STATUSES } from './inventory';
import { RootCauseResult } from './rootCause';
import { Alert } from './alerts';
import { changePct, formatDaysLeft, formatNumber, inr, signedPct } from './format';

export type Intent =
'greeting' |
'sales_drop' |
'focus_today' |
'slow_moving' |
'restock' |
'top_profit' |
'top_sellers' |
'summary' |
'unknown';

export interface AssistantReply {
  intent: Intent;
  text: string;
  bullets?: string[];
  footnote?: string;
  link?: {label: string;section: SectionId;};
}

export interface AssistantContext {
  period: PeriodDays;
  settings: ShopSettings;
  merchantName: string;
  shopName: string;
  kpis: Kpis;
  prevKpis: Kpis;
  stats: ProductStat[];
  inventory: InventoryRow[];
  rootCause: RootCauseResult;
  openAlerts: Alert[];
}

/** Keyword rules, checked in order — the first match wins. */
const INTENT_PATTERNS: Array<[Intent, RegExp]> = [
['greeting', /^\s*(hi|hello|hey|namaste|namaskar)\b/i],
['sales_drop', /(why|reason|cause|explain).*(drop|fall|fell|down|declin|low|less)|(sales|revenue|business).*(drop|fall|fell|down|declin)/i],
['focus_today', /(focus|priorit|today|urgent|what should i do|first)/i],
['slow_moving', /(slow|dead stock|not selling|overstock|excess)/i],
['restock', /(restock|re-stock|reorder|re-order|stock|inventory|run(ning)? out|order more)/i],
['top_profit', /(profit|margin|earn|most money)/i],
['top_sellers', /(best|top|popular|most sold|sell(s|ing)? (the )?most|bestseller)/i],
['summary', /(revenue|sales|orders|aov|summary|overview|how (is|am|are)|performance)/i]];


export function detectIntent(question: string): Intent {
  const match = INTENT_PATTERNS.find(([, pattern]) => pattern.test(question));
  return match ? match[0] : 'unknown';
}

export function answerQuestion(question: string, ctx: AssistantContext): AssistantReply {
  const intent = detectIntent(question);
  switch (intent) {
    case 'greeting':
      return {
        intent,
        text: `Namaste ${ctx.merchantName.split(' ')[0]}! In the last ${ctx.period} days ${ctx.shopName} made ${inr(ctx.kpis.revenue)} from ${formatNumber(ctx.kpis.orders)} orders. Ask me about sales drops, profit, restocking or today's priorities.`
      };
    case 'sales_drop':
      return answerSalesDrop(ctx);
    case 'focus_today':
      return answerFocus(ctx);
    case 'slow_moving':
      return answerSlowMoving(ctx);
    case 'restock':
      return answerRestock(ctx);
    case 'top_profit':
      return answerTopProfit(ctx);
    case 'top_sellers':
      return answerTopSellers(ctx);
    case 'summary':
      return answerSummary(ctx);
    default:
      return {
        intent,
        text: `I couldn't match "${question.slice(0, 60)}" to a question I can answer from your data. I'm a rule-based demo assistant, so I understand questions about:`,
        bullets: [
        'Why sales went up or down',
        'Which products make the most profit',
        'What needs restocking and what is slow-moving',
        'Best sellers and overall performance',
        'What to focus on today']

      };
  }
}

function answerSalesDrop(ctx: AssistantContext): AssistantReply {
  const rc = ctx.rootCause;
  const link = { label: 'Open Root Cause Detective', section: 'rootcause' as SectionId };
  const footnote = `Confidence: ${rc.confidence}. Last ${ctx.period} days vs the previous ${ctx.period} days of demo data.`;

  if (rc.status === 'decline') {
    return {
      intent: 'sales_drop',
      text: rc.summary,
      bullets: [
      rc.ordersInsight,
      ...rc.drivers.slice(0, 2).map((d) => `${d.stat.product.name}: ${d.evidence[0]}`),
      ...(rc.actions[0] ? [`Next step: ${rc.actions[0]}`] : [])],

      footnote,
      link
    };
  }
  if (rc.status === 'growth') {
    return { intent: 'sales_drop', text: `Good news — sales didn't drop. ${rc.summary}`, footnote, link };
  }
  return { intent: 'sales_drop', text: rc.summary, bullets: rc.actions, footnote, link };
}

function answerTopProfit(ctx: AssistantContext): AssistantReply {
  const sold = ctx.stats.filter((s) => s.units > 0);
  if (sold.length === 0) {
    return { intent: 'top_profit', text: `There are no sales in the last ${ctx.period} days, so I can't rank profit yet.` };
  }
  const byProfit = [...sold].sort((a, b) => b.profit - a.profit);
  const top = byProfit[0];
  const byMargin = [...sold].sort((a, b) => b.margin - a.margin)[0];
  const bullets = byProfit.
  slice(1, 4).
  map((s, i) => `#${i + 2} ${s.product.name} — ${inr(s.profit)} profit (${s.margin.toFixed(1)}% margin)`);
  if (byMargin.product.id !== top.product.id) {
    bullets.push(`Highest margin per sale: ${byMargin.product.name} at ${byMargin.margin.toFixed(1)}%, but on only ${byMargin.units} units.`);
  }
  return {
    intent: 'top_profit',
    text: `${top.product.name} made the most gross profit in the last ${ctx.period} days: ${inr(top.profit)} from ${inr(top.revenue)} in sales (${top.margin.toFixed(1)}% margin).`,
    bullets,
    footnote: 'Gross profit = selling price − purchase cost. Rent, salaries and electricity are not included.',
    link: { label: 'View product performance', section: 'analytics' }
  };
}

function answerRestock(ctx: AssistantContext): AssistantReply {
  const need = ctx.inventory.
  filter((r) => URGENT_STATUSES.includes(r.status)).
  sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  const link = { label: 'Open Restock Planner', section: 'inventory' as SectionId };
  if (need.length === 0) {
    return {
      intent: 'restock',
      text: 'No items need restocking right now — every product has more stock than its supplier lead time plus a 7-day buffer.',
      link
    };
  }
  const total = need.reduce((s, r) => s + r.orderCost, 0);
  return {
    intent: 'restock',
    text: `${need.length} item${need.length === 1 ? ' needs' : 's need'} restocking. Quantities cover lead time plus ${ctx.settings.targetCoverageDays} days of demand with a ${ctx.settings.safetyBufferPct}% safety buffer:`,
    bullets: need.map(
      (r) => `${r.product.name} (${r.status}) — ${r.product.stock} in stock, ${formatDaysLeft(r.daysOfStock)} left. Order ${r.recommendedQty} units ≈ ${inr(r.orderCost)}.`
    ),
    footnote: `Estimated purchase cost: ${inr(total)}. Demand is based on the last 30 days of demo sales.`,
    link
  };
}

function answerFocus(ctx: AssistantContext): AssistantReply {
  const top = ctx.openAlerts.slice(0, 3);
  const link = { label: 'Open Action Center', section: 'overview' as SectionId };
  if (top.length === 0) {
    return { intent: 'focus_today', text: "You're all caught up — every action in the Action Center is marked done. A good day to review pricing in the What-If Simulator.", link };
  }
  const remaining = ctx.openAlerts.length - top.length;
  return {
    intent: 'focus_today',
    text: `Here ${top.length === 1 ? 'is your top priority' : `are your top ${top.length} priorities`} for today, ranked by urgency:`,
    bullets: top.map((a) => `${a.title}. ${a.recommendation}`),
    footnote: remaining > 0 ? `${remaining} more open action${remaining === 1 ? '' : 's'} in the Action Center.` : undefined,
    link
  };
}

function answerTopSellers(ctx: AssistantContext): AssistantReply {
  const byUnits = [...ctx.stats].filter((s) => s.units > 0).sort((a, b) => b.units - a.units);
  if (byUnits.length === 0) return { intent: 'top_sellers', text: `No sales recorded in the last ${ctx.period} days.` };
  const byRevenue = [...byUnits].sort((a, b) => b.revenue - a.revenue)[0];
  return {
    intent: 'top_sellers',
    text: `By units, ${byUnits[0].product.name} is your best seller (${formatNumber(byUnits[0].units)} units in ${ctx.period} days). By revenue, ${byRevenue.product.name} leads with ${inr(byRevenue.revenue)}.`,
    bullets: byUnits.slice(0, 5).map((s, i) => `#${i + 1} ${s.product.name} — ${formatNumber(s.units)} units, ${inr(s.revenue)} (${signedPct(s.revenueChangePct, 0)} vs previous)`),
    link: { label: 'View Smart Analytics', section: 'analytics' }
  };
}

function answerSlowMoving(ctx: AssistantContext): AssistantReply {
  const slow = ctx.inventory.filter((r) => r.status === 'Slow-moving');
  const link = { label: 'Open Inventory Intelligence', section: 'inventory' as SectionId };
  if (slow.length === 0) {
    return { intent: 'slow_moving', text: `Nothing is slow-moving — no product has more than ${ctx.settings.slowMovingDays} days of stock.`, link };
  }
  const tied = slow.reduce((s, r) => s + r.stockValue, 0);
  return {
    intent: 'slow_moving',
    text: `${slow.length} product${slow.length === 1 ? ' is' : 's are'} slow-moving, tying up ${inr(tied)} at cost:`,
    bullets: slow.map((r) => `${r.product.name} — ${r.product.stock} units, about ${formatDaysLeft(r.daysOfStock)} of stock (${inr(r.stockValue)})`),
    footnote: 'Suggestion: pause reorders and try a combo or counter-display offer.',
    link
  };
}

function answerSummary(ctx: AssistantContext): AssistantReply {
  const { kpis, prevKpis, period } = ctx;
  return {
    intent: 'summary',
    text: `In the last ${period} days you made ${inr(kpis.revenue)} in revenue (${signedPct(changePct(kpis.revenue, prevKpis.revenue))} vs previous ${period} days) and an estimated ${inr(kpis.profit)} gross profit.`,
    bullets: [
    `Orders: ${formatNumber(kpis.orders)} (${signedPct(changePct(kpis.orders, prevKpis.orders))})`,
    `Average order value: ${inr(kpis.aov)} (${signedPct(changePct(kpis.aov, prevKpis.aov))})`,
    `Gross margin: ${kpis.revenue > 0 ? (kpis.profit / kpis.revenue * 100).toFixed(1) : '0'}%`],

    link: { label: 'Open Overview', section: 'overview' }
  };
}