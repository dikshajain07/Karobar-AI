/**
 * MOCK AUTHENTICATION — PROTOTYPE ONLY, NOT SECURE.
 * Accounts and sessions live in this browser's storage. Passwords are hashed with SHA-256
 * only to avoid storing plain text; this is not real security.
 *
 * Every screen talks to the `AuthProviderAdapter` interface, so a real provider
 * (Firebase, Supabase, Auth0, your own API…) can replace `mockAuthProvider` later.
 */

export interface AuthUser {
  id: string;
  name: string;
  shopName: string;
  email: string;
  createdAt: string;
}

export interface SignUpInput {
  name: string;
  shopName: string;
  email: string;
  password: string;
}

export type AuthField = 'name' | 'shopName' | 'email' | 'password';
export type AuthResult = {ok: true;user: AuthUser;} | {ok: false;error: string;field?: AuthField;};
export type BasicResult = {ok: true;} | {ok: false;error: string;field?: AuthField;};

export interface AuthProviderAdapter {
  restoreSession: () => AuthUser | null;
  logIn: (email: string, password: string, remember: boolean) => Promise<AuthResult>;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  logOut: () => void;
  accountExists: (email: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<BasicResult>;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
}

const USERS_KEY = 'karobar-auth-users';
const SESSION_KEY = 'karobar-auth-session';
/** Simulated network latency so loading states are visible, like a real request. */
const LATENCY_MS = 450;

export const DEMO_USER_ID = 'demo-user';
export const DEMO_CREDENTIALS = { email: 'demo@karobar.ai', password: 'Demo@1234' };

const wait = () => new Promise((resolve) => window.setTimeout(resolve, LATENCY_MS));
const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function hashPassword(email: string, password: string): Promise<string> {
  const text = `karobar:${normalizeEmail(email)}:${password}`;
  if (window.crypto?.subtle) {
    const buffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buffer)).
    map((b) => b.toString(16).padStart(2, '0')).
    join('');
  }
  return window.btoa(unescape(encodeURIComponent(text)));
}

function readUsers(): StoredUser[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(USERS_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed as StoredUser[] : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** The demo account always exists so the prototype can be explored without signing up. */
async function usersWithDemo(): Promise<StoredUser[]> {
  const users = readUsers();
  if (!users.some((u) => u.id === DEMO_USER_ID)) {
    users.push({
      id: DEMO_USER_ID,
      name: 'Rakesh Sharma',
      shopName: 'Sharma General Store',
      email: DEMO_CREDENTIALS.email,
      createdAt: new Date().toISOString(),
      passwordHash: await hashPassword(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password)
    });
    writeUsers(users);
  }
  return users;
}

function toPublic({ passwordHash: _hash, ...user }: StoredUser): AuthUser {
  return user;
}

/** "Remember me" keeps the session in localStorage; otherwise it lasts for this browser tab. */
function writeSession(userId: string, remember: boolean) {
  const value = JSON.stringify({ userId, startedAt: new Date().toISOString() });
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
  (remember ? window.localStorage : window.sessionStorage).setItem(SESSION_KEY, value);
}

export const mockAuthProvider: AuthProviderAdapter = {
  restoreSession() {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const { userId } = JSON.parse(raw) as {userId: string;};
      const user = readUsers().find((u) => u.id === userId);
      return user ? toPublic(user) : null;
    } catch {
      return null;
    }
  },

  async logIn(email, password, remember) {
    await wait();
    const users = await usersWithDemo();
    const user = users.find((u) => u.email === normalizeEmail(email));
    if (!user) return { ok: false, error: 'No account found with this email. Check it or create an account.', field: 'email' };
    if (user.passwordHash !== (await hashPassword(user.email, password))) {
      return { ok: false, error: 'Incorrect password. Try again or reset it.', field: 'password' };
    }
    writeSession(user.id, remember);
    return { ok: true, user: toPublic(user) };
  },

  async signUp(input) {
    await wait();
    const users = await usersWithDemo();
    const email = normalizeEmail(input.email);
    if (users.some((u) => u.email === email)) {
      return { ok: false, error: 'An account with this email already exists. Try logging in.', field: 'email' };
    }
    const user: StoredUser = {
      id: `user-${Date.now().toString(36)}`,
      name: input.name.trim().replace(/\s+/g, ' '),
      shopName: input.shopName.trim().replace(/\s+/g, ' '),
      email,
      createdAt: new Date().toISOString(),
      passwordHash: await hashPassword(email, input.password)
    };
    writeUsers([...users, user]);
    writeSession(user.id, true);
    return { ok: true, user: toPublic(user) };
  },

  logOut() {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  },

  async accountExists(email) {
    await wait();
    return (await usersWithDemo()).some((u) => u.email === normalizeEmail(email));
  },

  async resetPassword(email, newPassword) {
    await wait();
    const users = await usersWithDemo();
    const index = users.findIndex((u) => u.email === normalizeEmail(email));
    if (index === -1) return { ok: false, error: 'No account found with this email.', field: 'email' };
    users[index] = { ...users[index], passwordHash: await hashPassword(users[index].email, newPassword) };
    writeUsers(users);
    return { ok: true };
  }
};