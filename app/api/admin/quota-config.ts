// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_KEYS = ['daily_quota_enabled', 'daily_quota_limit', 'premium_bypass_enabled', 'quota_reset_hour_utc'];
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const supabase = createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
    );

    try {
        const adminId = await verifyAdmin(supabase, req);
        if (!adminId) return res.status(403).json({ error: 'Admin access required' });

        // ── GET: return all quota config keys ──────────────────────
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('app_config')
                .select('key, value, updated_at')
                .in('key', ALLOWED_KEYS);

            if (error) return res.status(500).json({ error: error.message });

            const config: Record<string, any> = {};
            for (const row of data ?? []) config[row.key] = { value: row.value, updated_at: row.updated_at };

            return res.status(200).json({ config });
        }

        // ── PATCH: update a single config key ──────────────────────
        if (req.method === 'PATCH') {
            const { key, value } = req.body ?? {};

            if (!key || !ALLOWED_KEYS.includes(key)) {
                return res.status(400).json({ error: `key must be one of: ${ALLOWED_KEYS.join(', ')}` });
            }
            if (value === undefined || value === null) {
                return res.status(400).json({ error: 'value is required' });
            }

            // Type validation per key
            if (key === 'daily_quota_limit' || key === 'quota_reset_hour_utc') {
                const n = Number(value);
                if (!Number.isInteger(n) || n < -1 || n > 24) {
                    return res.status(400).json({ error: `${key} must be an integer between -1 and 24` });
                }
            }
            if (key === 'daily_quota_enabled' || key === 'premium_bypass_enabled') {
                if (typeof value !== 'boolean') {
                    return res.status(400).json({ error: `${key} must be a boolean` });
                }
            }

            const { error } = await supabase
                .from('app_config')
                .upsert({ key, value, updated_at: new Date().toISOString(), updated_by: adminId });

            if (error) return res.status(500).json({ error: error.message });

            // Audit log
            await supabase.from('admin_audit_log').insert({
                action: 'config_update',
                performed_by: adminId,
                payload: { key, new_value: value },
            });

            return res.status(200).json({ success: true, key, value });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('[admin/quota-config] Error:', err);
        return res.status(500).json({ error: 'Internal server error', message: err?.message });
    }
}
