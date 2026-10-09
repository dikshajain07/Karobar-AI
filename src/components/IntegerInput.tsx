import React, { useEffect, useState } from 'react';

interface IntegerInputProps {
  value: number;
  min: number;
  max: number;
  label: string;
  onCommit: (value: number) => void;
  className?: string;
}

/**
 * Small numeric field that only saves valid whole numbers.
 * It commits on blur or Enter, shows an inline error otherwise, and Escape reverts.
 */
export function IntegerInput({ value, min, max, label, onCommit, className = 'w-20' }: IntegerInputProps) {
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(String(value));
    setError(null);
  }, [value]);

  const commit = () => {
    const trimmed = draft.trim();
    if (!/^\d+$/.test(trimmed)) {
      setError('Whole numbers only');
      return;
    }
    const n = Number(trimmed);
    if (n < min || n > max) {
      setError(`Use ${min}–${max}`);
      return;
    }
    setError(null);
    if (n !== value) onCommit(n);
  };

  return (
    <div className="inline-flex flex-col items-end">
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        aria-invalid={error ? true : undefined}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(String(value));
            setError(null);
          }
        }}
        className={`${className} rounded-md border px-2 py-1 text-right text-sm tabular-nums text-ink focus:outline-none focus:ring-2 focus:ring-brand-500 ${
        error ? 'border-danger-600 bg-danger-50' : 'border-line bg-surface'}`
        } />
      
      {error &&
      <span role="alert" className="mt-1 whitespace-nowrap text-[11px] text-danger-700">
          {error}
        </span>
      }
    </div>);

}