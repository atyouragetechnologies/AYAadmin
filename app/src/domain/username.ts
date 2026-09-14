/**
 * Pure username validation and sanitization utilities.
 * No side-effects, no Supabase calls — safe to import anywhere.
 *
 * Rules enforced:
 *  - 3–20 characters
 *  - Letters (A-Z, a-z), digits (0-9), underscores (_) only
 *  - No spaces, hyphens, periods, or special characters
 *  - No emoji
 */

const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;
const ALLOWED_CHARS_REGEX = /[^A-Za-z0-9_]/g;
const MAX_LENGTH = 20;

export interface UsernameValidationResult {
  valid: boolean;
  error: string | null;
}

/**
 * Validates a username string against the project rules.
 * Returns { valid: true, error: null } when the username is acceptable.
 */
export function validateUsername(value: string): UsernameValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, error: 'Username is required.' };
  }

  if (trimmed.length < 3 || trimmed.length > MAX_LENGTH || !USERNAME_REGEX.test(trimmed)) {
    if (/\s/.test(trimmed)) {
      return { valid: false, error: 'Username cannot contain spaces.' };
    }
    return {
      valid: false,
      error: 'Username must be 3–20 characters and contain only letters, numbers, and underscores.',
    };
  }

  return { valid: true, error: null };
}

/**
 * Removes disallowed characters from a raw input string and caps length at 20.
 * Intended for live sanitization as the user types.
 * Does NOT alter casing — the stored username preserves entered casing,
 * while uniqueness is enforced case-insensitively by the database.
 */
export function sanitizeUsername(value: string): string {
  return value.replace(ALLOWED_CHARS_REGEX, '').slice(0, MAX_LENGTH);
}
