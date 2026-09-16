// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const PREMIUM_TIERS = ['aya_plus', 'jee15', 'neet15', 'upsc'];

function nextUtcMidnight(): string {
    const now = new Date();
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    return next.toISOString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://atyourage.app';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const supabase = createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
    );

    try {
        // Require valid JWT
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Authorization header required' });

        const { data: { user: authUser } } = await supabase.auth.getUser(token);
        if (!authUser?.id) return res.status(401).json({ error: 'Unauthorized: invalid token' });

        const user_id  = authUser.id;
        const story_id = req.body?.story_id;

        if (!story_id) return res.status(400).json({ error: 'story_id is required' });

        // Validate story_id is a UUID
        const uuidRx = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRx.test(story_id)) {
            return res.status(400).json({ error: 'story_id must be a valid UUID' });
        }

        // Fetch user access + override
        const { data: user } = await supabase
            .from('users')
            .select('access_type, daily_quota_override')
            .eq('id', user_id)
            .maybeSingle();

        const isAyaPlus = PREMIUM_TIERS.includes(user?.access_type ?? 'free');

        // Premium users skip quota consumption
        if (isAyaPlus) {
            return res.status(200).json({
                consumed: false,
                reason: 'premium_bypass',
                stories_played: null,
                quota_limit: null,
                next_reset_at: nextUtcMidnight(),
            });
        }

        // Fetch quota config
        const { data: configRows } = await supabase
            .from('app_config')
            .select('key, value')
            .in('key', ['daily_quota_enabled', 'daily_quota_limit']);

        const cfg: Record<string, any> = {};
        for (const row of configRows ?? []) cfg[row.key] = row.value;

        const quotaEnabled = cfg['daily_quota_enabled'] === true || cfg['daily_quota_enabled'] === 'true';
        const globalLimit  = Number(cfg['daily_quota_limit'] ?? 2);
        const effectiveLimit =
            user?.daily_quota_override !== null && user?.daily_quota_override !== undefined
                ? user.daily_quota_override
                : globalLimit;

        // Quota disabled — still record play but don't gate
        if (!quotaEnabled || effectiveLimit === -1) {
            return res.status(200).json({
                consumed: false,
                reason: 'quota_disabled',
                stories_played: null,
                quota_limit: effectiveLimit,
                next_reset_at: nextUtcMidnight(),
            });
        }

        // Call the atomic PL/pgSQL function (handles idempotency + upsert)
        const { data: result, error } = await supabase
            .rpc('consume_quota_slot', { p_user_id: user_id, p_story_id: story_id });

        if (error) {
            console.error('[consume-quota] RPC error:', error);
            return res.status(500).json({ error: 'Failed to consume quota slot', message: error.message });
        }

        const row = Array.isArray(result) ? result[0] : result;

        return res.status(200).json({
            consumed: !row?.already_counted,
            already_counted: row?.already_counted ?? false,
            stories_played: row?.stories_played ?? 1,
            quota_limit: effectiveLimit,
            exhausted: (row?.stories_played ?? 1) >= effectiveLimit,
            next_reset_at: nextUtcMidnight(),
        });

    } catch (err: any) {
        console.error('[consume-quota] Error:', err);
        return res.status(500).json({ error: 'Internal server error', message: err?.message });
    }
}
