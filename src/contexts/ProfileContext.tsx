import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MerchantProfile } from '../types/profile';
import { businessCategories, defaultProfile } from '../data/defaultProfile';

interface ProfileValue {
  profile: MerchantProfile;
  updateProfile: (next: MerchantProfile) => void;
}

interface ProfileProviderProps {
  /** Per-user key, so each account keeps its own profile */
  storageKey: string;
  /** Older single-user key to migrate from (demo account only) */
  legacyKey?: string;
  /** Details from sign-up used the first time a profile is created */
  seed?: Partial<MerchantProfile>;
  children: React.ReactNode;
}

const ProfileContext = createContext<ProfileValue | null>(null);

function loadProfile(storageKey: string, legacyKey?: string, seed?: Partial<MerchantProfile>): MerchantProfile {
  try {
    const raw = window.localStorage.getItem(storageKey) ?? (legacyKey ? window.localStorage.getItem(legacyKey) : null);
    if (!raw) return { ...defaultProfile, ...seed };
    const parsed = { ...defaultProfile, ...(JSON.parse(raw) as Partial<MerchantProfile>) };
    if (!businessCategories.includes(parsed.category)) parsed.category = defaultProfile.category;
    parsed.currency = 'INR';
    return parsed;
  } catch {
    return { ...defaultProfile, ...seed };
  }
}

export function ProfileProvider({ storageKey, legacyKey, seed, children }: ProfileProviderProps) {
  const [profile, setProfile] = useState<MerchantProfile>(() => loadProfile(storageKey, legacyKey, seed));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(profile));
    } catch {

      // Profile just won't persist.
    }}, [profile, storageKey]);

  const updateProfile = useCallback((next: MerchantProfile) => setProfile(next), []);

  return <ProfileContext.Provider value={{ profile, updateProfile }}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}