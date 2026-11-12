/**
 * Detects a Google sign-up after the OAuth redirect.
 *
 * Supabase uses the same flow for sign-in and sign-up, so we infer "new account" from
 * timestamps: on the first sign-in, `last_sign_in_at` is set within moments of `created_at`.
 * A session-storage flag limits the check to the page load that follows our own redirect,
 * so a reload or a later visit never sends a second event.
 */

const PENDING_KEY = "wumy:oauth-pending";

/** How close the first sign-in must be to account creation to count as a sign-up. */
export const NEW_ACCOUNT_WINDOW_MS = 60_000;

type UserTimestamps = {
  created_at?: string | null | undefined;
  last_sign_in_at?: string | null | undefined;
};

export function isNewAccount(user: UserTimestamps): boolean {
  if (!user.created_at || !user.last_sign_in_at) return false;
  const created = Date.parse(user.created_at);
  const lastSignIn = Date.parse(user.last_sign_in_at);
  if (Number.isNaN(created) || Number.isNaN(lastSignIn)) return false;
  return Math.abs(lastSignIn - created) <= NEW_ACCOUNT_WINDOW_MS;
}

/** Call right before redirecting to the OAuth provider. */
export function markOAuthPending(): void {
  try {
    window.sessionStorage.setItem(PENDING_KEY, "1");
  } catch {
    // Storage can be unavailable (private mode); we just skip the sign-up event then.
  }
}

/** Returns whether an OAuth redirect was pending, and clears the flag. */
export function consumeOAuthPending(): boolean {
  try {
    const pending = window.sessionStorage.getItem(PENDING_KEY) === "1";
    window.sessionStorage.removeItem(PENDING_KEY);
    return pending;
  } catch {
    return false;
  }
}
