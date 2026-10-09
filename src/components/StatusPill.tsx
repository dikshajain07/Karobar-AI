import React from 'react';
import { StockStatus } from '../utils/inventory';
import { Severity } from '../utils/alerts';

export type Tone = 'danger' | 'warn' | 'success' | 'neutral' | 'info';

const toneClasses: Record<Tone, string> = {
  danger: 'bg-danger-50 text-danger-700 ring-danger-600/20',
  warn: 'bg-warn-50 text-warn-700 ring-warn-600/20',
  success: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  neutral: 'bg-canvas text-ink-soft ring-line',
  info: 'bg-info-50 text-info-700 ring-info-600/20'
};

export function StatusPill({ tone, children }: {tone: Tone;children: React.ReactNode;}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]}`}>
      
      {children}
    </span>);

}

export function stockTone(status: StockStatus): Tone {
  switch (status) {
    case 'Out of stock':
      return 'danger';
    case 'Reorder now':
      return 'warn';
    case 'Low stock':
      return 'info';
    case 'Slow-moving':
      return 'neutral';
    default:
      return 'success';
  }
}

export function severityTone(severity: Severity): Tone {
  return severity === 'critical' ? 'danger' : severity === 'high' ? 'warn' : severity === 'medium' ? 'info' : 'neutral';
}