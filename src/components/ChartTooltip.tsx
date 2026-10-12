import React from 'react';

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatter?: (value: number) => string;
}

/** Shared tooltip for all Recharts charts. */
export function ChartTooltip({ active, payload, label, formatter = (v) => String(v) }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-ink">{label}</p>
      {payload.map((entry) =>
      <div key={String(entry.dataKey)} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden="true" />
          <span className="text-ink-muted">{entry.name}</span>
          <span className="ml-auto pl-3 font-medium tabular-nums text-ink">{formatter(Number(entry.value))}</span>
        </div>
      )}
    </div>);

}