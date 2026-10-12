import React from 'react';
import { ShieldAlertIcon } from 'lucide-react';

/** Required label: this prototype's sign-in is simulated and not secure. */
export function MockAuthNotice() {
  return (
    <p className="flex gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
      <ShieldAlertIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>
        Prototype sign-in: accounts are stored only in this browser and are <span className="font-medium text-ink-soft">not secure</span>. Don't use a real password.
      </span>
    </p>);

}