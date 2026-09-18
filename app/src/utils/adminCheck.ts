import { auth } from '../lib/firebase';
import { getUserProfile } from '../lib/firestore';

/**
 * Check if the currently authenticated user is an admin.
 * Checks the isAdmin flag on the user's Firestore profile.
 */
export async function checkIsAdmin(): Promise<boolean> {
    try {
        const user = auth.currentUser;
        if (!user) return false;
        const profile = await getUserProfile(user.uid);
        return !!(profile as any)?.isAdmin;
    } catch (err) {
        console.error('[AdminCheck] Failed:', err);
        return false;
    }
}
