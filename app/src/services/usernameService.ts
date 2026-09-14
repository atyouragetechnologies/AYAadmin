/**
 * Username availability service.
 * Calls the `is_username_available` Postgres RPC function.
 *
 * Deliberately thin — all debouncing and state management live in the hook layer.
 */

import { supabase } from '../utils/supabase';

/**
 * Checks whether a username is available in the database.
 *
 * @param username      The username to check (case-insensitive on the server side).
 * @param excludeUserId Optional UUID of the currently logged-in user. When provided,
 *                      their own username is excluded from the "taken" check so the
 *                      Settings page doesn't show their current username as unavailable.
 * @returns             `true` if the username can be claimed, `false` if it is taken.
 * @throws              Re-throws Supabase errors so callers can surface them to the user.
 */
export async function checkUsernameAvailable(
  username: string,
  excludeUserId?: string | null
): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_username_available', {
    p_username: username,
    p_exclude_user_id: excludeUserId ?? null,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}
