import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { buttonClass } from '../../utils/ui';

export function SubmitButton({ loading, loadingLabel, children }: {loading: boolean;loadingLabel: string;children: React.ReactNode;}) {
  return (
    <button type="submit" disabled={loading} aria-busy={loading} className={buttonClass('primary', 'lg', 'w-full text-[15px] font-semibold disabled:opacity-80')}>
      {loading && <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {loading ? loadingLabel : children}
    </button>);

}