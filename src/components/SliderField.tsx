import React, { useEffect, useState } from 'react';

interface SliderFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  help?: string;
  onChange: (value: number) => void;
}

/** Range slider paired with a typed number input. Invalid typed values are flagged and ignored. */
export function SliderField({ id, label, value, min, max, step = 1, unit, help, onChange }: SliderFieldProps) {
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(String(value));
    setError(null);
  }, [value]);

  const handleTyped = (raw: string) => {
    setDraft(raw);
    const n = Number(raw);
    if (raw.trim() === '' || !Number.isFinite(n)) {
      setError('Enter a number');
      return;
    }
    if (n < min || n > max) {
      setError(`Must be between ${min} and ${max}`);
      return;
    }
    setError(null);
    onChange(n);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            aria-label={`${label} value`}
            aria-invalid={error ? true : undefined}
            value={draft}
            min={min}
            max={max}
            step={step}
            onChange={(e) => handleTyped(e.target.value)}
            className={`w-20 rounded-md border px-2 py-1 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            error ? 'border-danger-600 bg-danger-50' : 'border-line'}`
            } />
          
          <span className="w-10 text-xs text-ink-muted">{unit}</span>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-brand-600" />
      
      {error ?
      <p role="alert" className="mt-1 text-xs text-danger-700">
          {error}
        </p> :

      help && <p className="mt-1 text-xs text-ink-muted">{help}</p>
      }
    </div>);

}