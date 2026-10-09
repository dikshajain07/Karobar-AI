export interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Too weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  checks: {id: string;label: string;met: boolean;}[];
}

const LABELS: StrengthResult['label'][] = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

export function passwordStrength(pw: string): StrengthResult {
  const checks = [
  { id: 'length', label: 'At least 8 characters', met: pw.length >= 8 },
  { id: 'mix', label: 'Letters and numbers', met: /[A-Za-z]/.test(pw) && /\d/.test(pw) },
  { id: 'case', label: 'Upper and lower case', met: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
  { id: 'symbol', label: 'A symbol, e.g. @ # !', met: /[^A-Za-z0-9]/.test(pw) }];

  let score = checks.filter((c) => c.met).length;
  if (!checks[0].met) score = Math.min(score, 1);
  const s = score as StrengthResult['score'];
  return { score: s, label: LABELS[s], checks };
}

/** Minimum rule for new passwords: 8+ characters with letters and numbers. */
export function newPasswordError(pw: string): string | undefined {
  if (!pw) return 'Create a password';
  if (pw.length < 8) return 'Use at least 8 characters';
  if (pw.length > 64) return 'Use 64 characters or fewer';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Include both letters and numbers';
  return undefined;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}