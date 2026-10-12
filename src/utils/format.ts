import { dateLocale, translate } from './i18n';

/** Format a number as Indian Rupees, e.g. ₹1,23,456 */
export function inr(value: number): string {
  const sign = value < 0 ? '−' : '';
  return `${sign}₹${Math.round(Math.abs(value)).toLocaleString('en-IN')}`;
}

/** Signed rupee value, e.g. +₹1,200 or −₹800 */
export function signedInr(value: number): string {
  return `${value > 0 ? '+' : ''}${inr(value)}`;
}

/** Compact rupees for chart axes, e.g. ₹1.2L */
export function inrCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(1)}Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(1)}L`;
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(0)}k`;
  return `${sign}₹${Math.round(abs)}`;
}

/** Percentage change; null when there is nothing to compare against. */
export function changePct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / previous * 100;
}

export function signedPct(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) return '—';
  const rounded = Number(value.toFixed(digits));
  const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : '';
  return `${sign}${Math.abs(rounded).toFixed(digits)}%`;
}

export function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

/** Month names follow the selected language (e.g. "9 अक्टू॰" in Hindi); digits stay the same. */
export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return formatDate(new Date(y, m - 1, d), { day: 'numeric', month: 'short' });
}

/** e.g. 9 Oct 2026 — used for bills, receipts and customer records */
export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return formatDate(new Date(y, m - 1, d), { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Any date in the selected language, with Latin digits. */
export function formatDate(date: Date, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString(dateLocale(), { ...options, numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(dateLocale(), { hour: '2-digit', minute: '2-digit', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
}

export function formatDaysLeft(days: number | null): string {
  if (days === null) return translate('days.none');
  if (days < 1) return translate('days.underOne');
  return translate('days.count', { count: Math.round(days) });
}