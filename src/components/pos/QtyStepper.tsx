import React, { useEffect, useState } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { useT } from '../../contexts/LanguageContext';

interface QtyStepperProps {
  value: number;
  max: number;
  label: string;
  onChange: (qty: number) => void;
}

/** − [qty] + control. Typed values outside 1…stock show an inline error and are not applied. */
export function QtyStepper({ value, max, label, onChange }: QtyStepperProps) {
  const t = useT();
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(String(value));
    setError(null);
  }, [value]);

  const handleTyped = (raw: string) => {
    setDraft(raw);
    if (!/^\d+$/.test(raw.trim())) return setError(t('qty.enter'));
    const n = Number(raw);
    if (n < 1) return setError(t('qty.min'));
    if (n > max) return setError(t('qty.max', { count: max }));
    setError(null);
    onChange(n);
  };

  const btn =
  'flex h-8 w-8 items-center justify-center text-ink-soft transition-colors duration-150 hover:bg-canvas hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 disabled:opacity-40';

  return (
    <div className="flex flex-col items-start">
      <div className={`inline-flex overflow-hidden rounded-lg border ${error ? 'border-danger-600' : 'border-line'} bg-surface`}>
        <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={t('qty.decrease', { name: label })}>
          <MinusIcon className="h-3.5 w-3.5" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(e) => handleTyped(e.target.value)}
          onBlur={() => {
            setDraft(String(value));
            setError(null);
          }}
          aria-label={t('qty.of', { name: label })}
          aria-invalid={error ? true : undefined}
          className="w-10 border-x border-line bg-surface text-center text-sm font-medium tabular-nums text-ink focus:outline-none" />
        
        <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={t('qty.increase', { name: label })}>
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      {error &&
      <span role="alert" className="mt-1 text-[11px] text-danger-700">
          {error}
        </span>
      }
    </div>);

}