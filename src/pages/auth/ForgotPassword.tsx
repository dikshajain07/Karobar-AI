import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail, newPasswordError } from '../../utils/password';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthField } from '../../components/auth/AuthField';
import { PasswordField } from '../../components/auth/PasswordField';
import { PasswordStrength } from '../../components/auth/PasswordStrength';
import { FormAlert } from '../../components/auth/FormAlert';
import { SubmitButton } from '../../components/auth/SubmitButton';

type Step = 'email' | 'reset';

/**
 * Prototype reset: a real provider would email a reset link.
 * Here the merchant confirms the email and sets a new password directly.
 */
export function ForgotPassword() {
  const { accountExists, resetPassword } = useAuth();
  const navigate = useNavigate();
  const initialEmail = ((useLocation().state ?? {}) as {email?: string;}).email ?? '';

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{email?: string;password?: string;confirm?: string;}>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submitEmail = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    if (!isValidEmail(email)) {
      setErrors({ email: email.trim() ? 'Enter a valid email, e.g. name@shop.in' : 'Enter your account email' });
      return;
    }
    setLoading(true);
    const exists = await accountExists(email);
    setLoading(false);
    if (!exists) {
      setFormError('No account found with this email. Check it or create a new account.');
      return;
    }
    setStep('reset');
  };

  const submitReset = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    const e = {
      password: newPasswordError(password),
      confirm: !confirm ? 'Re-enter the new password' : confirm !== password ? "Passwords don't match" : undefined
    };
    setErrors(e);
    if (e.password || e.confirm) return;
    setLoading(true);
    const result = await resetPassword(email, password);
    setLoading(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    toast.success('Password updated', { description: 'Log in with your new password.' });
    navigate('/login', { replace: true, state: { email, notice: 'Password updated. Log in with your new password.' } });
  };

  return (
    <AuthLayout
      title={step === 'email' ? 'Reset your password' : 'Choose a new password'}
      subtitle={
      step === 'email' ?
      "Enter the email you signed up with and we'll help you set a new password." :

      <>
            For <span className="font-medium text-ink">{email.trim().toLowerCase()}</span>
          </>

      }>
      
      {step === 'email' ?
      <form onSubmit={submitEmail} noValidate className="space-y-5">
          <FormAlert message={formError} />
          <AuthField
          id="reset-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@shop.in"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors({});
          }}
          error={errors.email}
          autoFocus />
        
          <SubmitButton loading={loading} loadingLabel="Checking…">
            Continue
          </SubmitButton>
        </form> :

      <form onSubmit={submitReset} noValidate className="space-y-5">
          <FormAlert message={formError} />
          <div>
            <PasswordField
            id="reset-password"
            label="New password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((er) => ({ ...er, password: undefined }));
            }}
            error={errors.password}
            autoFocus />
          
            <PasswordStrength password={password} />
          </div>
          <PasswordField
          id="reset-confirm"
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setErrors((er) => ({ ...er, confirm: undefined }));
          }}
          error={errors.confirm} />
        
          <SubmitButton loading={loading} loadingLabel="Updating…">
            Update password
          </SubmitButton>
          <button type="button" onClick={() => setStep('email')} className="w-full text-center text-sm font-medium text-ink-muted hover:text-ink">
            Use a different email
          </button>
        </form>
      }

      <p className="mt-6 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
        Prototype only: a real app would send a reset link to your email. Here you set the new password directly.
      </p>

      <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-600">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        Back to log in
      </Link>
    </AuthLayout>);

}