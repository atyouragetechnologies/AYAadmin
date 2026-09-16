// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const PREMIUM_TIERS = ['aya_plus', 'jee15', 'neet15', 'upsc'];

function todayUtc(): string {
    return new Date().toISOString().split('T')[0];
}

function nextUtcMidnight(): string {
    const now = new Date();
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    return next.toISOString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://atyourage.app';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const supabase = createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
    );

    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Authorization header required' });

        const { data: { user: authUser } } = await supabase.auth.getUser(token);
        if (!authUser?.id) return res.status(401).json({ error: 'Unauthorized: invalid token' });

        const user_id = authUser.id;

        // Fetch user + config + today's quota row in parallel
        const [userRes, configRes, quotaRes] = await Promise.all([
            supabase
                .from('users')
                .select('access_type, daily_quota_override')
                .eq('id', user_id)
                .maybeSingle(),
            supabase
                .from('app_config')
                .select('key, value')
                .in('key', ['daily_quota_enabled', 'daily_quota_limit']),
            supabase
                .from('user_daily_quota')
                .select('stories_played, story_ids_played, last_played_at')
                .eq('user_id', user_id)
                .eq('quota_date', todayUtc())
                .maybeSingle(),
        ]);

        const user       = userRes.data;
        const configRows = configRes.data ?? [];
        const quotaRow   = quotaRes.data;

        const cfg: Record<string, any> = {};
        for (const row of configRows) cfg[row.key] = row.value;

        const isAyaPlus      = PREMIUM_TIERS.includes(user?.access_type ?? 'free');
        const quotaEnabled   = cfg['daily_quota_enabled'] === true || cfg['daily_quota_enabled'] === 'true';
        const globalLimit    = Number(cfg['daily_quota_limit'] ?? 2);
        const effectiveLimit =
            user?.daily_quota_override !== null && user?.daily_quota_override !== undefined
                ? user.daily_quota_override
                : globalLimit;

        const storiesPlayed = quotaRow?.stories_played ?? 0;
        const exhausted     = !isAyaPlus && quotaEnabled && storiesPlayed >= effectiveLimit;

        return res.status(200).json({
            user_id,
            is_premium_bypass: isAyaPlus,
            quota_enabled: quotaEnabled,
            quota_limit: isAyaPlus ? -1 : effectiveLimit,
            stories_played: isAyaPlus ? null : storiesPlayed,
            stories_remaining: isAyaPlus ? null : Math.max(0, effectiveLimit - storiesPlayed),
            exhausted,
            quota_date: todayUtc(),           // informational — client must not use for reset logic
            next_reset_at: nextUtcMidnight(), // server-computed, drive countdown from this
            last_played_at: quotaRow?.last_played_at ?? null,
            fetched_at: new Date().toISOString(),
        });

    } catch (err: any) {
        console.error('[quota-status] Error:', err);
        return res.status(500).json({ error: 'Internal server error', message: err?.message });
    }
}
