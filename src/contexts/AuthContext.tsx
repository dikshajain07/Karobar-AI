import React, { createContext, useCallback, useContext, useState } from 'react';
import { AuthResult, AuthUser, BasicResult, SignUpInput, mockAuthProvider } from '../utils/mockAuth';

/** Swap this for a real provider adapter later — the rest of the app only uses useAuth(). */
const provider = mockAuthProvider;

interface AuthValue {
  user: AuthUser | null;
  logIn: (email: string, password: string, remember: boolean) => Promise<AuthResult>;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  logOut: () => void;
  accountExists: (email: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<BasicResult>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  // Session restore is synchronous, so a refresh never flashes the login page.
  const [user, setUser] = useState<AuthUser | null>(() => provider.restoreSession());

  const logIn = useCallback(async (email: string, password: string, remember: boolean) => {
    const result = await provider.logIn(email, password, remember);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const result = await provider.signUp(input);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const logOut = useCallback(() => {
    provider.logOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, logIn, signUp, logOut, accountExists: provider.accountExists, resetPassword: provider.resetPassword }}>
      
      {children}
    </AuthContext.Provider>);

}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
