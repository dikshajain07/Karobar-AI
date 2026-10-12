import React from 'react';
import { CheckIcon } from 'lucide-react';
import { passwordStrength } from '../../utils/password';

const BAR_COLORS = ['bg-line', 'bg-danger-600', 'bg-warn-600', 'bg-brand-500', 'bg-brand-600'];
const TEXT_COLORS = ['text-ink-muted', 'text-danger-700', 'text-warn-700', 'text-brand-700', 'text-brand-700'];

export function PasswordStrength({ password }: {password: string;}) {
  if (!password) return null;
  const { score, label, checks } = passwordStrength(password);

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden="true">
          {[1, 2, 3, 4].map((i) =>
          <span key={i} className={`h-1 rounded-full transition-colors duration-200 ${i <= score ? BAR_COLORS[score] : 'bg-line'}`} />
          )}
        </div>
        <span className={`w-16 text-right text-xs font-medium ${TEXT_COLORS[score]}`}>{label}</span>
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
        {checks.map((c) =>
        <li key={c.id} className={`flex items-center gap-1.5 text-xs ${c.met ? 'text-ink-soft' : 'text-ink-muted'}`}>
            <span
            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${c.met ? 'bg-brand-600 text-white' : 'border border-line'}`}
            aria-hidden="true">
            
              {c.met && <CheckIcon className="h-2.5 w-2.5" strokeWidth={3} />}
            </span>
            <span className="sr-only">{c.met ? 'Done:' : 'Missing:'}</span>
            {c.label}
          </li>
        )}
      </ul>
    </div>);

}