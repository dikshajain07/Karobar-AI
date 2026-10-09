import React, { useState } from 'react';
import { ArrowRightIcon, RotateCcwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ShopSettings } from '../types/data';
import { SectionId } from '../types/navigation';
import { useDemoData } from '../contexts/DemoDataContext';
import { useProfile } from '../contexts/ProfileContext';
import { HISTORY_DAYS, dateForDaysAgo } from '../utils/transactions';
import { formatNumber } from '../utils/format';
import { buttonClass } from '../utils/ui';
import { Panel } from '../components/Panel';
import { ResetDemoDialog } from '../components/ResetDemoDialog';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';

type Draft = Record<keyof ShopSettings, string>;
type Errors = Partial<Record<keyof ShopSettings, string>>;

const RULES: Record<keyof ShopSettings, {min: number;max: number;}> = {
  targetCoverageDays: { min: 1, max: 90 },
  safetyBufferPct: { min: 0, max: 100 },
  slowMovingDays: { min: 15, max: 180 }
};

function validate(draft: Draft): Errors {
  const errors: Errors = {};
  (Object.keys(RULES) as Array<keyof ShopSettings>).forEach((key) => {
    const v = draft[key].trim();
    if (!/^\d+$/.test(v)) errors[key] = 'Enter a whole number';else
    if (Number(v) < RULES[key].min || Number(v) > RULES[key].max) errors[key] = `Use a value from ${RULES[key].min} to ${RULES[key].max}`;
  });
  return errors;
}

export function Settings({ onNavigate }: {onNavigate: (s: SectionId) => void;}) {
  const { settings, updateSettings, transactions, products, customers, salesCount } = useDemoData();
  const { profile } = useProfile();
  const [draft, setDraft] = useState<Draft>({
    targetCoverageDays: String(settings.targetCoverageDays),
    safetyBufferPct: String(settings.safetyBufferPct),
    slowMovingDays: String(settings.slowMovingDays)
  });
  const [errors, setErrors] = useState<Errors>({});
  const [resetOpen, setResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error('Settings not saved', { description: 'Please fix the highlighted fields.' });
      return;
    }
    updateSettings({
      targetCoverageDays: Number(draft.targetCoverageDays),
      safetyBufferPct: Number(draft.safetyBufferPct),
      slowMovingDays: Number(draft.slowMovingDays)
    });
    toast.success('Business settings saved', { description: 'Inventory alerts and restock plans are updated.' });
  };

  const field = (key: keyof ShopSettings, label: string, hint: string) =>
  <div>
      <label htmlFor={`setting-${key}`} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
      id={`setting-${key}`}
      value={draft[key]}
      inputMode="numeric"
      onChange={(e) => {
        setDraft((d) => ({ ...d, [key]: e.target.value }));
        if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
      }}
      aria-invalid={errors[key] ? true : undefined}
      aria-describedby={`setting-${key}-hint`}
      className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm tabular-nums text-ink focus:outline-none focus:ring-2 focus:ring-brand-500 ${
      errors[key] ? 'border-danger-600 bg-danger-50' : 'border-line bg-surface'}`
      } />
    
      <p id={`setting-${key}-hint`} className={`mt-1 text-xs ${errors[key] ? 'text-danger-700' : 'text-ink-muted'}`}>
        {errors[key] ?? hint}
      </p>
    </div>;


  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <form onSubmit={handleSave} noValidate>
          <Panel title="Inventory rules" description="Used for stock status, alerts and the Restock Planner.">
            <div className="grid gap-5 md:grid-cols-3">
              {field('targetCoverageDays', 'Target coverage (days)', 'Days of demand each restock should cover')}
              {field('safetyBufferPct', 'Safety buffer (%)', 'Extra stock for demand spikes')}
              {field('slowMovingDays', 'Slow-moving threshold (days)', 'Flag items with more stock cover than this')}
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" className={buttonClass('primary')}>
                Save settings
              </button>
            </div>
          </Panel>
        </form>

        <Panel title="Shop details" description="Name, category, contact details and address are part of your merchant profile.">
          <div className="flex flex-wrap items-center gap-3">
            <ProfileAvatar profile={profile} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{profile.shopName}</p>
              <p className="truncate text-xs text-ink-muted">
                {profile.merchantName} · {profile.category}
              </p>
            </div>
            <button type="button" onClick={() => onNavigate('profile')} className={buttonClass('secondary')}>
              Open My Profile
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Demo dataset">
          <dl className="space-y-2.5 text-sm">
            {[
            ['Products', formatNumber(products.length)],
            ['Customers', formatNumber(customers.length - 1)],
            ['Transactions', formatNumber(transactions.length)],
            ['Sales recorded in billing', formatNumber(salesCount)],
            ['Date range', `${fmt(dateForDaysAgo(HISTORY_DAYS - 1))} – ${fmt(dateForDaysAgo(0))}`]].
            map(([label, value]) =>
            <div key={label} className="flex justify-between gap-3">
                <dt className="text-ink-muted">{label}</dt>
                <dd className="text-right font-medium tabular-nums text-ink">{value}</dd>
              </div>
            )}
          </dl>
          <p className="mt-4 text-xs text-ink-muted">
            Sample data for a kirana store. Insights come from rule-based logic in the browser — no real AI service or backend. Your sales and edits are saved in this browser only.
          </p>
        </Panel>

        <Panel title="Reset demo data" description="Restores sample data and removes recorded sales, added customers, stock edits and business settings. Your profile and theme are kept.">
          <button type="button" onClick={() => setResetOpen(true)} className={buttonClass('secondary')}>
            <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
            Reset demo data
          </button>
        </Panel>
      </div>

      <ResetDemoDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </div>);

}