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

function todayUtc(): string {
    return new Date().toISOString().split('T')[0];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://atyourage.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const supabase = createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
    );

    try {
        const adminId = await verifyAdmin(supabase, req);
        if (!adminId) return res.status(403).json({ error: 'Admin access required' });

        const { user_id, quota_date } = req.body ?? {};
        if (!user_id) return res.status(400).json({ error: 'user_id is required' });

        const uuidRx = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRx.test(user_id)) return res.status(400).json({ error: 'user_id must be a valid UUID' });

        const targetDate = quota_date ?? todayUtc();

        const { error } = await supabase
            .from('user_daily_quota')
            .delete()
            .eq('user_id', user_id)
            .eq('quota_date', targetDate);

        if (error) return res.status(500).json({ error: error.message });

        // Audit log
        await supabase.from('admin_audit_log').insert({
            action: 'quota_reset',
            target_user_id: user_id,
            performed_by: adminId,
            payload: { quota_date: targetDate, reason: req.body?.reason ?? null },
        });

        return res.status(200).json({
            success: true,
            user_id,
            quota_date: targetDate,
            message: `Quota reset for ${targetDate}. User now has a fresh quota.`,
        });

    } catch (err: any) {
        console.error('[admin/quota-reset-user] Error:', err);
        return res.status(500).json({ error: 'Internal server error', message: err?.message });
    }
}
