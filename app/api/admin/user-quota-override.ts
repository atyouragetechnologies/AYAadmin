// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const FOUNDER_EMAIL = 'atyouragetechnologies@gmail.com';

async function verifyAdmin(supabase: any, req: VercelRequest): Promise<string | null> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user?.email) return null;
    const email = user.email.toLowerCase();
    if (email === FOUNDER_EMAIL) return user.id;
    const { data } = await supabase.from('admin_users').select('email').eq('email', email).maybeSingle();
    return data ? user.id : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://atyourage.app');
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

    const supabase = createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
    );

    try {
        const adminId = await verifyAdmin(supabase, req);
        if (!adminId) return res.status(403).json({ error: 'Admin access required' });

        const { user_id, override } = req.body ?? {};
        if (!user_id) return res.status(400).json({ error: 'user_id is required' });

        const uuidRx = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRx.test(user_id)) return res.status(400).json({ error: 'user_id must be a valid UUID' });

        // override: null (reset to global), -1 (unlimited), 0 (blocked), 1-20 (custom)
        if (override !== null && override !== undefined) {
            const n = Number(override);
            if (!Number.isInteger(n) || n < -1 || n > 20) {
                return res.status(400).json({ error: 'override must be null, -1, or an integer between 0 and 20' });
            }
        }

        const { error } = await supabase
            .from('users')
            .update({ daily_quota_override: override ?? null })
            .eq('id', user_id);

        if (error) return res.status(500).json({ error: error.message });

        // Audit log
        await supabase.from('admin_audit_log').insert({
            action: 'quota_override',
            target_user_id: user_id,
            performed_by: adminId,
            payload: { daily_quota_override: override ?? null },
        });

        const label = override === null ? 'global default' : override === -1 ? 'unlimited' : override === 0 ? 'blocked' : `${override} stories/day`;

        return res.status(200).json({
            success: true,
            user_id,
            daily_quota_override: override ?? null,
            effective_as: label,
        });

    } catch (err: any) {
        console.error('[admin/user-quota-override] Error:', err);
        return res.status(500).json({ error: 'Internal server error', message: err?.message });
    }
}
