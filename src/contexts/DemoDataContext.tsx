import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Customer, OrderLine, PeriodDays, Product, SaleDraft, ShopSettings, Transaction } from '../types/data';
import { initialProducts } from '../data/products';
import { seedCustomers } from '../data/customers';
import { defaultSettings } from '../data/defaultSettings';
import {
  DEMO_TODAY,
  HISTORY_DAYS,
  daysAgoFromIso,
  generateTransactions,
  makeInvoiceId,
  toIsoDate } from
'../utils/transactions';
import { Kpis, ProductStat, computeKpis, currentPeriod, previousPeriod, productStats } from '../utils/analytics';
import { InventoryRow, buildInventory } from '../utils/inventory';
import { RootCauseResult, analyseRootCause } from '../utils/rootCause';
import { Alert, buildAlerts } from '../utils/alerts';
import { CustomerErrors, normalizePhone, validateCustomer } from '../utils/customers';
import { useLanguage } from './LanguageContext';
import { translate } from '../utils/i18n';


/** Everything the merchant can change, saved to localStorage. */
interface PersistedState {
  products: Product[];
  settings: ShopSettings;
  /** alertId → ISO timestamp when it was marked done */
  completed: Record<string, string>;
  customers: Customer[];
  /** Bills created with the New sale (POS) flow */
  sales: Transaction[];
  invoiceSeq: number;
}

export interface Insights {
  current: Kpis;
  previous: Kpis;
  stats: ProductStat[];
  inventory: InventoryRow[];
  rootCause: RootCauseResult;
  alerts: Alert[];
}

export type AddSaleResult = {ok: true;transaction: Transaction;} | {ok: false;error: string;};
export type AddCustomerResult = {ok: true;customer: Customer;} | {ok: false;errors: CustomerErrors;};

interface DemoDataValue {
  products: Product[];
  customers: Customer[];
  /** Sample history + every completed POS sale — the single source for all pages */
  transactions: Transaction[];
  settings: ShopSettings;
  period: PeriodDays;
  setPeriod: (p: PeriodDays) => void;
  updateProduct: (id: string, patch: Partial<Pick<Product, 'stock' | 'leadTimeDays'>>) => void;
  updateSettings: (patch: Partial<ShopSettings>) => void;
  completed: Record<string, string>;
  toggleComplete: (alertId: string) => void;
  addSale: (draft: SaleDraft) => AddSaleResult;
  addCustomer: (name: string, phone: string) => AddCustomerResult;
  salesCount: number;
  nextInvoiceId: string;
  resetDemo: () => void;
  /** Changes on every reset so pages can remount and clear local state */
  resetToken: number;
  insights: Insights;
}

const DemoDataContext = createContext<DemoDataValue | null>(null);

function defaultState(): PersistedState {
  return {
    products: initialProducts.map((p) => ({ ...p })),
    settings: { ...defaultSettings },
    completed: {},
    customers: seedCustomers.map((c) => ({ ...c })),
    sales: [],
    invoiceSeq: 0
  };
}

/** Load saved data, falling back to the original sample data on first launch. */
function loadState(storageKey: string, legacyKey?: string): PersistedState {
  try {
    const raw = window.localStorage.getItem(storageKey) ?? (legacyKey ? window.localStorage.getItem(legacyKey) : null);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (!Array.isArray(parsed.products) || parsed.products.length !== initialProducts.length) return defaultState();
    // Recalculate "days ago" because the saved bills may be from an earlier day.
    const sales = (Array.isArray(parsed.sales) ? parsed.sales : []).
    map((t) => ({ ...t, daysAgo: daysAgoFromIso(t.date) })).
    filter((t) => t.daysAgo >= 0 && t.daysAgo < HISTORY_DAYS);
    return {
      products: parsed.products,
      settings: { ...defaultSettings, ...parsed.settings },
      completed: parsed.completed ?? {},
      customers: Array.isArray(parsed.customers) && parsed.customers.length > 0 ? parsed.customers : seedCustomers.map((c) => ({ ...c })),
      sales,
      invoiceSeq: typeof parsed.invoiceSeq === 'number' ? parsed.invoiceSeq : sales.length
    };
  } catch {
    return defaultState();
  }
}

interface DemoDataProviderProps {
  /** Per-user key, so each account keeps its own sales, stock and customers */
  storageKey: string;
  /** Older single-user key to migrate from (demo account only) */
  legacyKey?: string;
  children: React.ReactNode;
}

export function DemoDataProvider({ storageKey, legacyKey, children }: DemoDataProviderProps) {
  // Sample history is generated once and never changes.
  const history = useMemo(() => generateTransactions(initialProducts, seedCustomers), []);
  const [state, setState] = useState<PersistedState>(() => loadState(storageKey, legacyKey));
  const [period, setPeriod] = useState<PeriodDays>(30);
  const [resetToken, setResetToken] = useState(0);

  // Always-current copy of state for actions that must validate before saving.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {

      // Storage may be unavailable (private mode) — the demo still works in memory.
    }}, [state, storageKey]);

  const commit = (next: PersistedState) => {
    stateRef.current = next;
    setState(next);
  };

  const updateProduct = useCallback<DemoDataValue['updateProduct']>((id, patch) => {
    setState((s) => ({ ...s, products: s.products.map((p) => p.id === id ? { ...p, ...patch } : p) }));
  }, []);

  const updateSettings = useCallback((patch: Partial<ShopSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const toggleComplete = useCallback((alertId: string) => {
    setState((s) => {
      const completed = { ...s.completed };
      if (completed[alertId]) delete completed[alertId];else
      completed[alertId] = new Date().toISOString();
      return { ...s, completed };
    });
  }, []);

  /** Validate and record a bill, then reduce stock for every item sold. */
  const addSale = useCallback((draft: SaleDraft): AddSaleResult => {
    const current = stateRef.current;
    if (draft.items.length === 0) return { ok: false, error: translate('saleErr.empty') };
    const customer = current.customers.find((c) => c.id === draft.customerId);
    if (!customer) return { ok: false, error: translate('saleErr.customer') };

    const lines: OrderLine[] = [];
    for (const item of draft.items) {
      const product = current.products.find((p) => p.id === item.productId);
      if (!product) return { ok: false, error: translate('saleErr.missingProduct') };
      if (!Number.isInteger(item.qty) || item.qty <= 0) return { ok: false, error: translate('saleErr.qty', { name: product.name }) };
      if (item.qty > product.stock) {
        return { ok: false, error: translate('saleErr.stock', { stock: product.stock, name: product.name }) };
      }
      lines.push({ productId: product.id, qty: item.qty, listPrice: product.price, unitPrice: product.price, unitCost: product.cost });
    }

    const subtotal = lines.reduce((s, l) => s + l.qty * (l.listPrice ?? l.unitPrice), 0);
    const discount = Math.min(Math.max(0, Math.round(draft.discount)), subtotal);
    const total = subtotal - discount;
    // Spread the bill discount across lines so product revenue and profit stay accurate.
    const factor = subtotal > 0 ? total / subtotal : 0;
    lines.forEach((l) => {
      l.unitPrice = (l.listPrice ?? l.unitPrice) * factor;
    });

    const now = new Date();
    const seq = current.invoiceSeq + 1;
    const transaction: Transaction = {
      id: makeInvoiceId(seq),
      date: toIsoDate(DEMO_TODAY),
      daysAgo: 0,
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      customerId: customer.id,
      customer: customer.name,
      payment: draft.payment,
      lines,
      subtotal,
      discount,
      total,
      source: 'pos'
    };

    commit({
      ...current,
      invoiceSeq: seq,
      sales: [...current.sales, transaction],
      products: current.products.map((p) => {
        const sold = draft.items.find((i) => i.productId === p.id);
        return sold ? { ...p, stock: p.stock - sold.qty } : p;
      })
    });
    return { ok: true, transaction };
  }, []);

  const addCustomer = useCallback((name: string, phone: string): AddCustomerResult => {
    const current = stateRef.current;
    const errors = validateCustomer(name, phone, current.customers);
    if (errors.name || errors.phone) return { ok: false, errors };
    const customer: Customer = {
      id: `cust-${Date.now().toString(36)}`,
      name: name.trim().replace(/\s+/g, ' '),
      phone: phone.trim() ? normalizePhone(phone) : undefined,
      createdAt: toIsoDate(DEMO_TODAY)
    };
    commit({ ...current, customers: [...current.customers, customer] });
    return { ok: true, customer };
  }, []);

  const resetDemo = useCallback(() => {
    commit(defaultState());
    setPeriod(30);
    setResetToken((t) => t + 1);
  }, []);

  const transactions = useMemo(() => [...history, ...state.sales], [history, state.sales]);

  // All derived numbers come from the same transactions + products, recomputed after every change.
  const { language } = useLanguage();
  const insights = useMemo<Insights>(() => {
    const stats = productStats(state.products, transactions, period);
    const inventory = buildInventory(state.products, transactions, state.settings);
    const rootCause = analyseRootCause(transactions, period, stats);
    return {
      current: computeKpis(currentPeriod(transactions, period)),
      previous: computeKpis(previousPeriod(transactions, period)),
      stats,
      inventory,
      rootCause,
      alerts: buildAlerts(inventory, rootCause, stats, period)
    };
    // `language` is a dependency so generated alerts and explanations re-render in the chosen language.
  }, [state.products, state.settings, transactions, period, language]);

  const value: DemoDataValue = {
    products: state.products,
    customers: state.customers,
    transactions,
    settings: state.settings,
    period,
    setPeriod,
    updateProduct,
    updateSettings,
    completed: state.completed,
    toggleComplete,
    addSale,
    addCustomer,
    salesCount: state.sales.length,
    nextInvoiceId: makeInvoiceId(state.invoiceSeq + 1),
    resetDemo,
    resetToken,
    insights
  };

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData(): DemoDataValue {
  const ctx = useContext(DemoDataContext);
  if (!ctx) throw new Error('useDemoData must be used inside DemoDataProvider');
  return ctx;
}