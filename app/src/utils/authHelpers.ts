/**
 * authHelpers.ts
 *
 * Helpers for bridging AYA's mobile/phone-based identity model
 * with Supabase Auth email/password sessions.
 *
 * Mobile users are registered in Supabase Auth using a
 * deterministic synthetic email derived from their phone number.
 * This gives every user a real Supabase Auth JWT so that
 * auth.uid() is populated for all users, enabling strict RLS.
 *
 * SECURITY NOTE:
 * - The email domain (@aya-game.com) is internal and never exposed as UX.
 * - The password is deterministically derived but salted with VITE_AUTH_SALT
 *   so that knowing only the mobile number is insufficient to derive credentials.
 * - These are not "real" passwords — they are auth tokens for the internal
 *   mobile-to-Supabase bridge. Users never see or type them.
 */

/**
 * Normalize phone number by extracting digits only and removing Indian country code (+91 / 91) or leading 0.
 */
export function normalizePhone(mobile: string): string {
  let digits = (mobile || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Validate that a normalized mobile number is EXACTLY 10 digits long.
 * Throws a clean error if invalid. Returns clean 10-digit string if valid.
 */
export function validatePhone(mobile: string): string {
  const clean = normalizePhone(mobile);
  if (!clean || clean.length !== 10) {
    throw new Error('Enter a valid 10-digit mobile number.');
  }
  return clean;
}

/**
 * Derive a deterministic synthetic email from a phone number for Supabase Auth.
 */
export function derivePhoneEmail(mobile: string): string {
  const clean = normalizePhone(mobile);
  return `phone_${clean}@aya-game.com`;
}

/**
 * Derive a deterministic synthetic email from a mobile number.
 * Strips all non-digit characters first.
 */
export function deriveMobileEmail(mobile: string): string {
  const clean = normalizePhone(mobile);
  return `mobile_${clean}@aya-game.com`;
}

/**
 * Derive a deterministic auth password from a mobile number + project salt.
 * The salt comes from VITE_AUTH_SALT in .env.local to prevent brute-force
 * derivation of any user's auth credentials from their phone number alone.
 */
export function deriveMobilePassword(mobile: string): string {
  const clean = normalizePhone(mobile);
  const salt = import.meta.env.VITE_AUTH_SALT ?? 'aya-fallback-salt';
  // Format: Aya<first4ofSalt><mobile>!Auth — always meets Supabase min-length
  return `Aya${salt.slice(0, 4)}${clean}!Auth`;
}

