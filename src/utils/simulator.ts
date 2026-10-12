import { ProductStat } from './analytics';

export interface SimulatorInputs {
  productId: string;
  discountPct: number;
  priceChangePct: number;
  extraInventory: number;
  /** Assumed price sensitivity (elasticity). 0 = units unchanged. */
  sensitivity: number;
  sellThroughPct: number;
}

export interface SimOutcome {
  avgPrice: number;
  units: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  investment: number;
}

export interface SimulationResult {
  hasBaseline: boolean;
  baseline: SimOutcome;
  simulated: SimOutcome;
  priceFactor: number;
  /** % change in units needed to keep profit at baseline; null if selling at/below cost */
  breakEvenVolumePct: number | null;
}

export const ALL_PRODUCTS = 'all';

function outcome(units: number, revenue: number, cost: number, investment = 0): SimOutcome {
  const profit = revenue - cost;
  return {
    avgPrice: units > 0 ? revenue / units : 0,
    units,
    revenue,
    cost,
    profit,
    margin: revenue > 0 ? profit / revenue * 100 : 0,
    investment
  };
}

/**
 * Simple, transparent simulation:
 *  new price   = baseline avg price × (1 + price change) × (1 − discount)
 *  new units   = baseline units × (1 + sensitivity × (price factor − 1))
 *              + extra inventory × sell-through   (single product only)
 *  profit      = revenue − units × unit cost
 */
export function simulate(stats: ProductStat[], inputs: SimulatorInputs): SimulationResult {
  const single = inputs.productId !== ALL_PRODUCTS;
  const selected = single ? stats.filter((s) => s.product.id === inputs.productId) : stats;
  const priceFactor = (1 + inputs.priceChangePct / 100) * (1 - inputs.discountPct / 100);
  const demandFactor = Math.max(0, 1 + inputs.sensitivity * (priceFactor - 1));

  let bUnits = 0,bRevenue = 0,bCost = 0;
  let sUnits = 0,sRevenue = 0,sCost = 0,investment = 0;
  let marginAtSameUnits = 0;

  selected.forEach((s) => {
    const unitCost = s.units > 0 ? s.cost / s.units : s.product.cost;
    const newPrice = s.avgPrice * priceFactor;
    bUnits += s.units;
    bRevenue += s.revenue;
    bCost += s.cost;

    let units = s.units * demandFactor;
    if (single) {
      units += inputs.extraInventory * inputs.sellThroughPct / 100;
      investment += inputs.extraInventory * s.product.cost;
    }
    sUnits += units;
    sRevenue += units * newPrice;
    sCost += units * unitCost;
    marginAtSameUnits += s.units * (newPrice - unitCost);
  });

  const baseline = outcome(bUnits, bRevenue, bCost);
  const baselineProfit = bRevenue - bCost;
  const breakEvenVolumePct =
  marginAtSameUnits > 0 && bUnits > 0 ? (baselineProfit / marginAtSameUnits - 1) * 100 : null;

  return {
    hasBaseline: bUnits > 0,
    baseline,
    simulated: outcome(sUnits, sRevenue, sCost, investment),
    priceFactor,
    breakEvenVolumePct
  };
}