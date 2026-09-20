// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const PREMIUM_TIERS = ['aya_plus', 'aya_plus_monthly', 'aya_plus_quarterly', 'aya_plus_semi_annual', 'aya_plus_six_month', 'aya_plus_annual', 'premium', 'premium_pro', 'jee15', 'neet15', 'upsc'];

function todayUtc(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD, always UTC
}

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
        // Verify JWT — user can only check their own access
        const token = req.headers.authorization?.replace('Bearer ', '');
        let verifiedUserId: string | undefined;
        if (token) {
            const { data: { user } } = await supabase.auth.getUser(token);
            verifiedUserId = user?.id;
        }

        const { story_id } = req.body;
        const user_id = verifiedUserId || req.body.user_id;

        if (!user_id) {
            return res.status(401).json({ error: 'Unauthorized: no valid user' });
        }

        // Fetch user row (access_type + per-user quota override in one query)
        const { data: user } = await supabase
            .from('users')
            .select('access_type, access_start_date, daily_quota_override')
            .eq('id', user_id)
            .maybeSingle();

        const accessType = user?.access_type || 'free';
        const isAyaPlus = PREMIUM_TIERS.includes(accessType);

        let canAccess = true;

        // ── Premium content gate (unchanged) ────────────────────────
        if (story_id) {
            const { data: story } = await supabase
                .from('story_metadata')
                .select('is_premium')
                .eq('story_id', story_id)
                .maybeSingle();

            if (story?.is_premium && !isAyaPlus) {
                canAccess = false;
            }
        }

        // ── Daily quota gate (free-tier only) ───────────────────────
        const quotaStatus: Record<string, any> = {
            enabled: false,
            limit: 2,
            stories_played: 0,
            exhausted: false,
            next_reset_at: nextUtcMidnight(),
        };

        if (!isAyaPlus) {
            // Fetch global config (quota enabled + limit) in one round-trip
            const { data: configRows } = await supabase
                .from('app_config')
                .select('key, value')
                .in('key', ['daily_quota_enabled', 'daily_quota_limit', 'premium_bypass_enabled']);

            const cfg: Record<string, any> = {};
            for (const row of configRows ?? []) cfg[row.key] = row.value;

            const quotaEnabled = cfg['daily_quota_enabled'] === true || cfg['daily_quota_enabled'] === 'true';
            const globalLimit  = Number(cfg['daily_quota_limit'] ?? 2);
            const effectiveLimit =
                user?.daily_quota_override !== null && user?.daily_quota_override !== undefined
                    ? user.daily_quota_override
                    : globalLimit;

            quotaStatus.enabled = quotaEnabled;
            quotaStatus.limit   = effectiveLimit;

            if (quotaEnabled) {
                const { data: quotaRow } = await supabase
                    .from('user_daily_quota')
                    .select('stories_played, story_ids_played')
                    .eq('user_id', user_id)
                    .eq('quota_date', todayUtc())
                    .maybeSingle();

                quotaStatus.stories_played = quotaRow?.stories_played ?? 0;
                quotaStatus.exhausted      = quotaStatus.stories_played >= effectiveLimit;

                if (quotaStatus.exhausted) canAccess = false;
            }
        } else {
            // Premium: quota not applied, return informational state
            quotaStatus.enabled       = false;
            quotaStatus.limit         = -1;
            quotaStatus.stories_played = 0;
            quotaStatus.exhausted     = false;
        }

        return res.status(200).json({
            user_id,
            access_type: accessType,
            is_aya_plus: isAyaPlus,
            can_access: canAccess,
            quota_status: quotaStatus,
            checked_at: new Date().toISOString()
        });
    } catch (err: any) {
        console.error('[check-access] Error:', err);
        return res.status(500).json({ error: 'Internal server error', message: err?.message });
    }
}
