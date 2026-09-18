/**
 * usernameService.ts — Firebase Firestore replacement
 * Delegates to isUsernameAvailable() from lib/firestore.ts
 */
import { isUsernameAvailable } from '../lib/firestore';

/**
 * Checks whether a username is available (case-insensitive).
 * @param username The username to check.
 * @param excludeUserId Optional current user UID — their own username is not counted as taken.
 */
export async function checkUsernameAvailable(
    username: string,
    excludeUserId?: string | null
): Promise<boolean> {
    return isUsernameAvailable(username, excludeUserId ?? undefined);
}
