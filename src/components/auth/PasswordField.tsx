import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { AuthField } from './AuthField';

type PasswordFieldProps = Omit<React.ComponentProps<typeof AuthField>, 'type' | 'trailing'>;

/** Password input with a show/hide toggle. */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <AuthField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-canvas hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        
          {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      } />);


}