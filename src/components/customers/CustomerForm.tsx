import React, { useState } from 'react';
import { toast } from 'sonner';
import { Customer } from '../../types/data';
import { useDemoData } from '../../contexts/DemoDataContext';
import { useT } from '../../contexts/LanguageContext';
import { CustomerErrors } from '../../utils/customers';
import { buttonClass } from '../../utils/ui';

interface CustomerFormProps {
  initialName?: string;
  onSaved: (customer: Customer) => void;
  onCancel: () => void;
  submitLabel?: string;
}

/** Name + optional phone, validated inline. Used in billing and on the Customers page. */
export function CustomerForm({ initialName = '', onSaved, onCancel, submitLabel }: CustomerFormProps) {
  const { addCustomer } = useDemoData();
  const t = useT();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<CustomerErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addCustomer(name, phone);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    toast.success(t('customer.toastAdded'), { description: result.customer.name });
    onSaved(result.customer);
  };

  const field = (hasError: boolean) =>
  `mt-1 h-9 w-full rounded-lg border px-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500 ${
  hasError ? 'border-danger-600 bg-danger-50' : 'border-line bg-surface'}`;


  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div>
        <label htmlFor="customer-name" className="text-xs font-medium text-ink-soft">
          {t('customer.fullName')} <span className="text-danger-700">*</span>
        </label>
        <input
          id="customer-name"
          data-autofocus
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((er) => ({ ...er, name: undefined }));
          }}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'customer-name-error' : undefined}
          placeholder={t('customer.namePlaceholder')}
          className={field(Boolean(errors.name))} />
        
        {errors.name &&
        <p id="customer-name-error" className="mt-1 text-xs text-danger-700">
            {errors.name}
          </p>
        }
      </div>
      <div>
        <label htmlFor="customer-phone" className="text-xs font-medium text-ink-soft">
          {t('customer.mobile')} <span className="font-normal text-ink-muted">{t('common.optional')}</span>
        </label>
        <input
          id="customer-phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) setErrors((er) => ({ ...er, phone: undefined }));
          }}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby="customer-phone-hint"
          placeholder="98220 12345"
          className={field(Boolean(errors.phone))} />
        
        <p id="customer-phone-hint" className={`mt-1 text-xs ${errors.phone ? 'text-danger-700' : 'text-ink-muted'}`}>
          {errors.phone ?? t('customer.mobileHint')}
        </p>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className={buttonClass('ghost', 'sm')}>
          {t('common.cancel')}
        </button>
        <button type="submit" className={buttonClass('primary', 'sm')}>
          {submitLabel ?? t('customer.save')}
        </button>
      </div>
    </form>);

}