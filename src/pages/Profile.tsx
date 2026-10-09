import React, { useState } from 'react';
import { InfoIcon, MailIcon, MapPinIcon, PencilIcon, PhoneIcon, SlidersHorizontalIcon, StoreIcon } from 'lucide-react';
import { SectionId } from '../types/navigation';
import { useProfile } from '../contexts/ProfileContext';
import { currencyOptions } from '../data/defaultProfile';
import { formatPhone } from '../utils/customers';
import { buttonClass } from '../utils/ui';
import { Panel } from '../components/Panel';
import { Dialog } from '../components/Dialog';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { ProfileForm } from '../components/profile/ProfileForm';

const FORM_ID = 'merchant-profile-form';

export function Profile({ onNavigate }: {onNavigate: (s: SectionId) => void;}) {
  const { profile } = useProfile();
  const [editing, setEditing] = useState(false);
  const currency = currencyOptions.find((c) => c.value === profile.currency)?.label ?? profile.currency;

  const rows: {icon: typeof StoreIcon;label: string;value: string;empty?: boolean;}[] = [
  { icon: StoreIcon, label: 'Shop / business', value: `${profile.shopName} · ${profile.category}` },
  { icon: PhoneIcon, label: 'Phone', value: profile.phone ? formatPhone(profile.phone) : 'Not added', empty: !profile.phone },
  { icon: MailIcon, label: 'Email', value: profile.email || 'Not added', empty: !profile.email },
  { icon: MapPinIcon, label: 'Shop address', value: profile.address || 'Not added', empty: !profile.address }];


  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <section className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6 sm:flex-row sm:items-center">
          <ProfileAvatar profile={profile} size="xl" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-semibold tracking-tight text-ink">{profile.merchantName}</h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Owner, {profile.shopName}
            </p>
            <span className="mt-2 inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{profile.category}</span>
          </div>
          <button type="button" onClick={() => setEditing(true)} className={buttonClass('primary')}>
            <PencilIcon className="h-4 w-4" aria-hidden="true" />
            Edit Profile
          </button>
        </section>

        <Panel title="Business details">
          <dl className="divide-y divide-line">
            {rows.map(({ icon: Icon, label, value, empty }) =>
            <div key={label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                <dt className="w-32 shrink-0 text-sm text-ink-muted">{label}</dt>
                <dd className={`min-w-0 text-sm ${empty ? 'text-ink-muted' : 'text-ink'}`}>{value}</dd>
              </div>
            )}
            <div className="flex items-start gap-3 py-3 last:pb-0">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-sm font-semibold text-ink-muted" aria-hidden="true">
                ₹
              </span>
              <dt className="w-32 shrink-0 text-sm text-ink-muted">Currency</dt>
              <dd className="text-sm text-ink">{currency}</dd>
            </div>
          </dl>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Where this appears">
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>Dashboard welcome message</li>
            <li>Printed receipts (shop name, address, phone)</li>
            <li>Sidebar and account menu</li>
            <li>AI Business Assistant greeting</li>
          </ul>
          <button type="button" onClick={() => onNavigate('settings')} className={buttonClass('secondary', 'md', 'mt-5 w-full')}>
            <SlidersHorizontalIcon className="h-4 w-4" aria-hidden="true" />
            Business Settings
          </button>
        </Panel>
        <p className="flex gap-2 px-1 text-xs leading-relaxed text-ink-muted">
          <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Your profile is saved in this browser under your prototype account. Sign-in is simulated — there is no real account security or cloud sync. Resetting demo data does not change your profile.
        </p>
      </div>

      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit profile"
        description="Changes are saved in this browser."
        size="lg"
        footer={
        <>
            <button type="button" onClick={() => setEditing(false)} className={buttonClass('secondary')}>
              Cancel
            </button>
            <button type="submit" form={FORM_ID} className={buttonClass('primary')}>
              Save changes
            </button>
          </>
        }>
        
        <ProfileForm formId={FORM_ID} onSaved={() => setEditing(false)} />
      </Dialog>
    </div>);

}
