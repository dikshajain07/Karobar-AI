import React, { useState } from 'react';
import { toast } from 'sonner';
import { BusinessCategory, MerchantProfile } from '../../types/profile';
import { useProfile } from '../../contexts/ProfileContext';
import { businessCategories, currencyOptions } from '../../data/defaultProfile';
import { ProfileErrors, cleanProfile, validateProfile } from '../../utils/profile';
import { ProfileAvatar } from './ProfileAvatar';

interface ProfileFormProps {
  formId: string;
  onSaved: () => void;
}

/** Pre-filled profile form with inline validation. Submit buttons live in the dialog footer (form={formId}). */
export function ProfileForm({ formId, onSaved }: ProfileFormProps) {
  const { profile, updateProfile } = useProfile();
  const [draft, setDraft] = useState<MerchantProfile>(profile);
  const [errors, setErrors] = useState<ProfileErrors>({});

  const set = (key: keyof MerchantProfile, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateProfile(draft);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      toast.error('Profile not saved', { description: 'Please fix the highlighted fields.' });
      return;
    }
    updateProfile(cleanProfile(draft));
    toast.success('Profile saved', { description: 'Your details are updated across the dashboard.' });
    onSaved();
  };

  const inputCls = (key: keyof MerchantProfile) =>
  `mt-1.5 w-full rounded-lg border px-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500 ${
  errors[key] ? 'border-danger-600 bg-danger-50' : 'border-line bg-surface'}`;


  const hint = (key: keyof MerchantProfile, text?: string) =>
  errors[key] || text ?
  <p id={`profile-${key}-hint`} className={`mt-1 text-xs ${errors[key] ? 'text-danger-700' : 'text-ink-muted'}`}>
        {errors[key] ?? text}
      </p> :
  null;

  const text = (key: keyof MerchantProfile, label: string, opts: {required?: boolean;placeholder?: string;help?: string;type?: string;autoFocus?: boolean;} = {}) =>
  <div>
      <label htmlFor={`profile-${key}`} className="text-sm font-medium text-ink">
        {label} {opts.required ? <span className="text-danger-700">*</span> : <span className="font-normal text-ink-muted">(optional)</span>}
      </label>
      <input
      id={`profile-${key}`}
      type={opts.type ?? 'text'}
      value={draft[key]}
      onChange={(e) => set(key, e.target.value)}
      placeholder={opts.placeholder}
      data-autofocus={opts.autoFocus ? true : undefined}
      aria-invalid={errors[key] ? true : undefined}
      aria-describedby={`profile-${key}-hint`}
      className={`${inputCls(key)} h-9`} />
    
      {hint(key, opts.help)}
    </div>;


  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-6 p-5">
      <section aria-labelledby="profile-avatar-heading" className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <ProfileAvatar profile={draft} size="xl" />
        <div className="grid flex-1 gap-4 sm:grid-cols-[120px_1fr]">
          <h3 id="profile-avatar-heading" className="sr-only">Avatar</h3>
          {text('avatarInitials', 'Initials', { placeholder: 'RS', help: 'Defaults to your name' })}
          {text('avatarUrl', 'Profile image URL', { placeholder: 'https://…', help: 'Falls back to initials if the image fails to load', type: 'url' })}
        </div>
      </section>

      <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
        {text('merchantName', 'Your name', { required: true, autoFocus: true })}
        {text('shopName', 'Shop / business name', { required: true })}
        <div>
          <label htmlFor="profile-category" className="text-sm font-medium text-ink">
            Business category <span className="text-danger-700">*</span>
          </label>
          <select
            id="profile-category"
            value={draft.category}
            onChange={(e) => set('category', e.target.value as BusinessCategory)}
            aria-invalid={errors.category ? true : undefined}
            className={`${inputCls('category')} h-9`}>
            
            {businessCategories.map((c) =>
            <option key={c} value={c}>{c}</option>
            )}
          </select>
          {hint('category')}
        </div>
        <div>
          <label htmlFor="profile-currency" className="text-sm font-medium text-ink">Currency</label>
          <select id="profile-currency" value={draft.currency} onChange={(e) => set('currency', e.target.value)} aria-describedby="profile-currency-hint" className={`${inputCls('currency')} h-9`}>
            {currencyOptions.map((c) =>
            <option key={c.value} value={c.value} disabled={!c.available}>
                {c.label}
                {c.available ? '' : ' — not available in demo'}
              </option>
            )}
          </select>
          {hint('currency', 'All demo amounts are in Indian Rupees')}
        </div>
      </div>

      <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
        {text('phone', 'Phone number', { placeholder: '98220 01234', type: 'tel', help: '10-digit mobile number' })}
        {text('email', 'Email', { placeholder: 'you@shop.in', type: 'email' })}
        <div className="sm:col-span-2">
          <label htmlFor="profile-address" className="text-sm font-medium text-ink">
            Shop address <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <textarea
            id="profile-address"
            rows={2}
            value={draft.address}
            onChange={(e) => set('address', e.target.value)}
            aria-invalid={errors.address ? true : undefined}
            aria-describedby="profile-address-hint"
            className={`${inputCls('address')} resize-none py-2`} />
          
          {hint('address', 'Printed on receipts')}
        </div>
      </div>
    </form>);

}