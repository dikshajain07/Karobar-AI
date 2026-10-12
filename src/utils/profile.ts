import { BusinessCategory, MerchantProfile } from '../types/profile';
import { TKey } from '../data/i18n';
import { businessCategories } from '../data/defaultProfile';
import { initials, normalizePhone } from './customers';
import { translate } from './i18n';

export type ProfileErrors = Partial<Record<keyof MerchantProfile, string>>;

/** Validation messages are returned in the selected language. */
export function validateProfile(p: MerchantProfile): ProfileErrors {
  const errors: ProfileErrors = {};
  const name = p.merchantName.trim();
  if (name.length < 2) errors.merchantName = translate('profileErr.nameShort');else
  if (name.length > 40) errors.merchantName = translate('profileErr.nameLong');

  const shop = p.shopName.trim();
  if (shop.length < 2) errors.shopName = translate('profileErr.shopShort');else
  if (shop.length > 60) errors.shopName = translate('profileErr.shopLong');

  if (!businessCategories.includes(p.category)) errors.category = translate('profileErr.category');

  if (p.avatarInitials.trim() && !/^[A-Za-z]{1,3}$/.test(p.avatarInitials.trim())) {
    errors.avatarInitials = translate('profileErr.initials');
  }
  if (p.avatarUrl.trim()) {
    try {
      const url = new URL(p.avatarUrl.trim());
      if (url.protocol !== 'https:' && url.protocol !== 'http:') errors.avatarUrl = translate('profileErr.urlProtocol');
    } catch {
      errors.avatarUrl = translate('profileErr.url');
    }
  }
  if (p.phone.trim() && !/^[6-9]\d{9}$/.test(normalizePhone(p.phone))) errors.phone = translate('profileErr.phone');
  if (p.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim())) errors.email = translate('profileErr.email');
  if (p.address.trim().length > 160) errors.address = translate('profileErr.address');
  if (p.currency !== 'INR') errors.currency = translate('profileErr.currency');
  return errors;
}

/** Trim fields and normalise the phone before saving. */
export function cleanProfile(p: MerchantProfile): MerchantProfile {
  return {
    ...p,
    merchantName: p.merchantName.trim().replace(/\s+/g, ' '),
    avatarInitials: p.avatarInitials.trim().toUpperCase(),
    avatarUrl: p.avatarUrl.trim(),
    shopName: p.shopName.trim().replace(/\s+/g, ' '),
    phone: p.phone.trim() ? normalizePhone(p.phone) : '',
    email: p.email.trim(),
    address: p.address.trim()
  };
}

export function profileInitials(p: Pick<MerchantProfile, 'avatarInitials' | 'merchantName'>): string {
  return p.avatarInitials.trim().toUpperCase() || initials(p.merchantName) || '?';
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there';
}

export function greetingFor(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return translate('greeting.morning');
  if (h < 17) return translate('greeting.afternoon');
  return translate('greeting.evening');
}

/** Translation key for a business category (the stored value stays in English). */
export function businessCategoryKey(category: BusinessCategory): TKey {
  return `bizcat.${category}` as TKey;
}