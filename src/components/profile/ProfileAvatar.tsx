import React, { useEffect, useState } from 'react';
import { MerchantProfile } from '../../types/profile';
import { profileInitials } from '../../utils/profile';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl'
};

/** Profile image if the URL loads, otherwise initials on the brand colour. */
export function ProfileAvatar({ profile, size = 'md' }: {profile: Pick<MerchantProfile, 'avatarInitials' | 'avatarUrl' | 'merchantName'>;size?: Size;}) {
  const [failed, setFailed] = useState(false);
  const url = profile.avatarUrl.trim();

  useEffect(() => setFailed(false), [url]);

  if (url && !failed) {
    return <img src={url} alt="" onError={() => setFailed(true)} className={`${SIZES[size]} shrink-0 rounded-full object-cover ring-1 ring-line`} />;
  }
  return (
    <span className={`${SIZES[size]} flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white`} aria-hidden="true">
      {profileInitials(profile)}
    </span>);

}