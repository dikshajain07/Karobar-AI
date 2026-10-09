import { Customer, Transaction } from '../types/data';
import { translate } from './i18n';

export interface CustomerSummary {
  customer: Customer;
  orders: number;
  spent: number;
  firstDate: string | null;
  lastDate: string | null;
  lastTime: string | null;
  /** Newest first */
  transactions: Transaction[];
}

export interface CustomerErrors {
  name?: string;
  phone?: string;
}

export const newestFirst = (a: Transaction, b: Transaction) => a.daysAgo - b.daysAgo || b.time.localeCompare(a.time);

/** Totals and history for every customer, computed from the shared transaction list. */
export function buildCustomerSummaries(customers: Customer[], txns: Transaction[]): CustomerSummary[] {
  const map = new Map<string, CustomerSummary>();
  customers.forEach((c) =>
  map.set(c.id, { customer: c, orders: 0, spent: 0, firstDate: null, lastDate: null, lastTime: null, transactions: [] })
  );
  txns.forEach((t) => {
    const summary = map.get(t.customerId);
    if (!summary) return;
    summary.orders += 1;
    summary.spent += t.total;
    summary.transactions.push(t);
  });
  map.forEach((s) => {
    s.transactions.sort(newestFirst);
    const latest = s.transactions[0];
    s.lastDate = latest?.date ?? null;
    s.lastTime = latest?.time ?? null;
    s.firstDate = s.transactions[s.transactions.length - 1]?.date ?? null;
  });
  return Array.from(map.values());
}

/** Strip spaces, +91 and leading 0 so numbers can be compared. */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

export function validateCustomer(name: string, phone: string, existing: Customer[]): CustomerErrors {
  const errors: CustomerErrors = {};
  const n = name.trim();
  // \p{M} allows Devanagari vowel signs, so Hindi names are accepted too.
  if (n.length < 2) errors.name = translate('customerErr.nameShort');else
  if (n.length > 40) errors.name = translate('customerErr.nameLong');else
  if (!/^[\p{L}\p{M} .'-]+$/u.test(n)) errors.name = translate('customerErr.nameChars');

  if (phone.trim()) {
    const p = normalizePhone(phone);
    if (!/^[6-9]\d{9}$/.test(p)) errors.phone = translate('customerErr.phone');else
    if (existing.some((c) => c.phone === p)) errors.phone = translate('customerErr.phoneTaken');
  }
  return errors;
}

export function formatPhone(phone?: string): string {
  return phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : translate('customer.noPhone');
}

export function initials(name: string): string {
  return name.
  split(/\s+/).
  filter(Boolean).
  slice(0, 2).
  map((w) => w[0]?.toUpperCase() ?? '').
  join('');
}