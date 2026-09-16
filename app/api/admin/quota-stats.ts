// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const FOUNDER_EMAIL = 'atyouragetechnologies@gmail.com';

async function verifyAdmin(supabase: any, req: VercelRequest): Promise<boolean> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return false;
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user?.email) return false;
    const email = user.email.toLowerCase();
    if (email === FOUNDER_EMAIL) return true;
    const { data } = await supabase.from('admin_users').select('email').eq('email', email).maybeSingle();
    return !!data;
}

function todayUtc(): string {
    return new Date().toISOString().split('T')[0];
}

function daysAgo(n: number): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString().split('T')[0];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://atyourage.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const supabase = createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
    );

    try {
        const isAdmin = await verifyAdmin(supabase, req);
        if (!isAdmin) return res.status(403).json({ error: 'Admin access required' });

        const today    = todayUtc();
        const weekAgo  = daysAgo(7);

        // Fetch quota limit from config
        const { data: configRow } = await supabase
            .from('app_config')
            .select('value')
            .eq('key', 'daily_quota_limit')
            .maybeSingle();

        const quotaLimit = Number(configRow?.value ?? 2);

        // Today's rows
        const { data: todayRows } = await supabase
            .from('user_daily_quota')
            .select('stories_played')
            .eq('quota_date', today);

        const todayData = todayRows ?? [];
        const totalToday      = todayData.length;
        const exhaustedToday  = todayData.filter(r => r.stories_played >= quotaLimit).length;
        const partialToday    = todayData.filter(r => r.stories_played > 0 && r.stories_played < quotaLimit).length;
        const avgToday        = totalToday > 0
            ? Math.round((todayData.reduce((s, r) => s + r.stories_played, 0) / totalToday) * 100) / 100
            : 0;

        // 7-day rows for rolling average
        const { data: weekRows } = await supabase
            .from('user_daily_quota')
            .select('stories_played, quota_date')
            .gte('quota_date', weekAgo)
            .lte('quota_date', today);

        const weekData = weekRows ?? [];
        const avgWeek  = weekData.length > 0
            ? Math.round((weekData.reduce((s, r) => s + r.stories_played, 0) / weekData.length) * 100) / 100
            : 0;

        return res.status(200).json({
            quota_limit: quotaLimit,
            today: {
                date: today,
                total_active: totalToday,
                exhausted_count: exhaustedToday,
                partial_count: partialToday,
                avg_stories_played: avgToday,
                exhausted_pct: totalToday > 0 ? Math.round((exhaustedToday / totalToday) * 100) : 0,
            },
            week: {
                from: weekAgo,
                to: today,
                total_rows: weekData.length,
                avg_stories_played: avgWeek,
            },
            fetched_at: new Date().toISOString(),
        });

    } catch (err: any) {
        console.error('[admin/quota-stats] Error:', err);
        return res.status(500).json({ error: 'Internal server error', message: err?.message });
    }
}
