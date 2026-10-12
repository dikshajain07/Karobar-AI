import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail, newPasswordError } from '../../utils/password';
import { buttonClass } from '../../utils/ui';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthField } from '../../components/auth/AuthField';
import { PasswordField } from '../../components/auth/PasswordField';
import { PasswordStrength } from '../../components/auth/PasswordStrength';
import { FormAlert } from '../../components/auth/FormAlert';
import { MockAuthNotice } from '../../components/auth/MockAuthNotice';
import { SubmitButton } from '../../components/auth/SubmitButton';
import { Dialog } from '../../components/Dialog';

type FieldKey = 'name' | 'shopName' | 'email' | 'password' | 'confirm' | 'terms';
type Errors = Partial<Record<FieldKey, string>>;

const FIELD_ORDER: FieldKey[] = ['name', 'shopName', 'email', 'password', 'confirm', 'terms'];

export function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', shopName: '', email: '', password: '', confirm: '' });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    const name = form.name.trim();
    if (name.length < 2) e.name = 'Enter your full name';else
    if (name.length > 40) e.name = 'Keep the name under 40 characters';
    const shop = form.shopName.trim();
    if (shop.length < 2) e.shopName = 'Enter your shop or business name';else
    if (shop.length > 60) e.shopName = 'Keep the shop name under 60 characters';
    if (!form.email.trim()) e.email = 'Enter your email address';else
    if (!isValidEmail(form.email)) e.email = 'Enter a valid email, e.g. name@shop.in';
    e.password = newPasswordError(form.password);
    if (!form.confirm) e.confirm = 'Re-enter your password';else
    if (form.confirm !== form.password) e.confirm = "Passwords don't match";
    if (!terms) e.terms = 'Please accept the Terms & Conditions to continue';
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError(null);
    const firstInvalid = FIELD_ORDER.find((k) => found[k]);
    if (firstInvalid) {
      document.getElementById(`signup-${firstInvalid}`)?.focus();
      return;
    }
    setLoading(true);
    const result = await signUp({ name: form.name, shopName: form.shopName, email: form.email, password: form.password });
    setLoading(false);
    if (!result.ok) {
      setFormError(result.error);
      if (result.field) {
        setErrors({ [result.field]: result.error });
        document.getElementById(`signup-${result.field}`)?.focus();
      }
      return;
    }
    toast.success(`Welcome to Karobar AI, ${result.user.name.split(' ')[0]}!`, {
      description: `${result.user.shopName} is ready, loaded with sample data to explore.`
    });
    navigate('/', { replace: true });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
      <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-600">
            Log in
          </Link>
        </>
      }>
      
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormAlert message={formError} />

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField id="signup-name" label="Full name" autoComplete="name" placeholder="Rakesh Sharma" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} autoFocus />
          <AuthField id="signup-shopName" label="Shop name" autoComplete="organization" placeholder="Sharma General Store" value={form.shopName} onChange={(e) => set('shopName', e.target.value)} error={errors.shopName} />
        </div>
        <AuthField id="signup-email" label="Email" type="email" autoComplete="email" placeholder="name@shop.in" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />

        <div>
          <PasswordField
            id="signup-password"
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            error={errors.password} />
          
          <PasswordStrength password={form.password} />
        </div>

        <PasswordField
          id="signup-confirm"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={form.confirm}
          onChange={(e) => set('confirm', e.target.value)}
          error={errors.confirm}
          hint={form.confirm && form.confirm === form.password ? <span className="text-brand-700">Passwords match</span> : undefined} />
        

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-soft">
            <input
              id="signup-terms"
              type="checkbox"
              checked={terms}
              onChange={(e) => {
                setTerms(e.target.checked);
                if (errors.terms) setErrors((er) => ({ ...er, terms: undefined }));
              }}
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? 'signup-terms-error' : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-brand-600" />
            
            <span>
              I agree to the{' '}
              <button type="button" onClick={() => setTermsOpen(true)} className="font-medium text-brand-700 underline-offset-2 hover:underline">
                Terms & Conditions
              </button>
            </span>
          </label>
          {errors.terms &&
          <p id="signup-terms-error" className="mt-1.5 text-xs text-danger-700">
              {errors.terms}
            </p>
          }
        </div>

        <div className="pt-1">
          <SubmitButton loading={loading} loadingLabel="Creating account…">
            Create account
          </SubmitButton>
        </div>
      </form>

      <div className="mt-6">
        <MockAuthNotice />
      </div>

      <Dialog
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        title="Terms & Conditions"
        description="Prototype terms"
        size="md"
        footer={
        <button
          type="button"
          onClick={() => {
            setTerms(true);
            setErrors((er) => ({ ...er, terms: undefined }));
            setTermsOpen(false);
          }}
          className={buttonClass('primary')}
          data-autofocus>
          
            I agree
          </button>
        }>
        
        <div className="space-y-3 px-5 py-4 text-sm leading-relaxed text-ink-soft">
          <p>Karobar AI is a prototype for demonstration. By creating an account you understand that:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Your account, shop details, sales and customers are stored only in this browser's local storage.</li>
            <li>Sign-in is simulated and is not secure — don't use a password you use anywhere else.</li>
            <li>Insights are generated by rule-based logic from sample and entered data, not by a real AI service.</li>
            <li>Clearing your browser data removes your account and everything saved with it.</li>
          </ul>
        </div>
      </Dialog>
    </AuthLayout>);

}