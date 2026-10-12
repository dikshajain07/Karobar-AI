import React from 'react';

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: React.ReactNode;
  /** e.g. a "Forgot password?" link next to the label */
  labelAction?: React.ReactNode;
  /** e.g. a show/hide password button inside the input */
  trailing?: React.ReactNode;
}

/** Labelled input with inline error/hint, used by all auth forms. */
export function AuthField({ id, label, error, hint, labelAction, trailing, className = '', ...inputProps }: AuthFieldProps) {
  const describedBy = error || hint ? `${id}-message` : undefined;
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative mt-1.5">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-11 w-full rounded-lg border px-3.5 text-sm text-ink placeholder:text-ink-muted transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
          trailing ? 'pr-11' : ''} ${
          error ? 'border-danger-600 bg-danger-50' : 'border-line bg-surface hover:border-ink-muted/50'}`}
          {...inputProps} />
        
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">{trailing}</div>}
      </div>
      {(error || hint) &&
      <div id={describedBy} className={`mt-1.5 text-xs ${error ? 'text-danger-700' : 'text-ink-muted'}`}>
          {error ?? hint}
        </div>
      }
    </div>);

}