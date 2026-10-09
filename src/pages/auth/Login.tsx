import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_CREDENTIALS } from '../../utils/mockAuth';
import { isValidEmail } from '../../utils/password';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthField } from '../../components/auth/AuthField';
import { PasswordField } from '../../components/auth/PasswordField';
import { FormAlert } from '../../components/auth/FormAlert';
import { MockAuthNotice } from '../../components/auth/MockAuthNotice';
import { SubmitButton } from '../../components/auth/SubmitButton';

type Errors = {email?: string;password?: string;};
interface LocationState {
  from?: string;
  email?: string;
  notice?: string;
}

export function Login() {
  const { logIn } = useAuth();
  const navigate = useNavigate();
  const state = (useLocation().state ?? {}) as LocationState;

  const [email, setEmail] = useState(state.email ?? '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!email.trim()) e.email = 'Enter your email address';else
    if (!isValidEmail(email)) e.email = 'Enter a valid email, e.g. name@shop.in';
    if (!password) e.password = 'Enter your password';
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError(null);
    if (found.email || found.password) {
      document.getElementById(found.email ? 'login-email' : 'login-password')?.focus();
      return;
    }
    setLoading(true);
    const result = await logIn(email, password, remember);
    setLoading(false);
    if (!result.ok) {
      setFormError(result.error);
      document.getElementById(result.field === 'email' ? 'login-email' : 'login-password')?.focus();
      return;
    }
    toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`, { description: `Here's the latest for ${result.user.shopName}.` });
    navigate(state.from && state.from !== '/login' ? state.from : '/', { replace: true });
  };

  const fillDemoAccount = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrors({});
    setFormError(null);
  };

  return (
    <AuthLayout
      title="Log in to Karobar AI"
      subtitle={
      <>
          New here?{' '}
          <Link to="/signup" className="font-medium text-brand-700 hover:text-brand-600">
            Create an account
          </Link>
        </>
      }>
      
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormAlert message={state.notice && !formError ? state.notice : null} tone="success" />
        <FormAlert message={formError} />

        <AuthField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@shop.in"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((er) => ({ ...er, email: undefined }));
          }}
          error={errors.email}
          autoFocus />
        

        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((er) => ({ ...er, password: undefined }));
          }}
          error={errors.password}
          labelAction={
          <Link to="/forgot-password" state={{ email }} className="text-xs font-medium text-brand-700 hover:text-brand-600">
              Forgot password?
            </Link>
          } />
        

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-line accent-brand-600" />
          Remember me on this device
        </label>

        <SubmitButton loading={loading} loadingLabel="Logging in…">
          Log in
        </SubmitButton>
      </form>

      <div className="mt-6 rounded-lg border border-dashed border-line px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-ink-muted">
            <p className="font-medium text-ink-soft">Try the sample account</p>
            <p className="tabular-nums">
              {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
            </p>
          </div>
          <button type="button" onClick={fillDemoAccount} className="text-sm font-medium text-brand-700 hover:text-brand-600">
            Fill in
          </button>
        </div>
      </div>

      <div className="mt-4">
        <MockAuthNotice />
      </div>
    </AuthLayout>);

}
