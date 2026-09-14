import { supabase } from './supabase';

/**
 * Check if the currently authenticated user is an admin.
 * 
 * Uses the secure is_admin_user RPC which checks the public.users table.
 */
export async function checkIsAdmin(): Promise<boolean> {
    try {
        const { data: isAdmin, error } = await supabase.rpc('is_admin_user');
        if (error) {
            console.error('[AdminCheck] RPC error:', error.message);
            return false;
        }
        return !!isAdmin;
    } catch (err) {
        console.error('[AdminCheck] Failed:', err);
        return false;
    }
}
