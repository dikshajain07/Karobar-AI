import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileProvider } from '../../contexts/ProfileContext';
import { DemoDataProvider } from '../../contexts/DemoDataContext';
import { DEMO_USER_ID } from '../../utils/mockAuth';
import { AppShell } from '../AppShell';

/**
 * The dashboard for the signed-in user. Profile and shop data are stored under the
 * user's id, and the providers remount when a different user signs in.
 */
export function AuthenticatedApp() {
  const { user } = useAuth();
  if (!user) return null;
  const isDemo = user.id === DEMO_USER_ID;

  return (
    <ProfileProvider
      key={`profile-${user.id}`}
      storageKey={`karobar-profile:${user.id}`}
      legacyKey={isDemo ? 'karobar-profile' : undefined}
      seed={isDemo ? undefined : { merchantName: user.name, shopName: user.shopName, email: user.email, phone: '', address: '' }}>
      
      <DemoDataProvider key={`data-${user.id}`} storageKey={`karobar-ai-demo-v2:${user.id}`} legacyKey={isDemo ? 'karobar-ai-demo-v2' : undefined}>
        <AppShell />
      </DemoDataProvider>
    </ProfileProvider>);

}