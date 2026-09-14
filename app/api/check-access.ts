// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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
        const supabaseForAuth = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
        );

        let verifiedUserId: string | undefined;
        if (token) {
            const { data: { user } } = await supabaseForAuth.auth.getUser(token);
            verifiedUserId = user?.id;
        }

        const { story_id } = req.body;
        // Use verified JWT user if available; fall back to body user_id for service-role callers
        const user_id = verifiedUserId || req.body.user_id;

        if (!user_id) {
            return res.status(401).json({ error: 'Unauthorized: no valid user' });
        }

        // Fetch user access type from Supabase
        const { data: user } = await supabase
            .from('users')
            .select('access_type, access_start_date')
            .eq('id', user_id)
            .maybeSingle();

        const accessType = user?.access_type || 'free';
        const isAyaPlus = ['aya_plus', 'jee15', 'neet15', 'upsc'].includes(accessType);

        let canAccess = true;

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

        return res.status(200).json({
            user_id,
            access_type: accessType,
            is_aya_plus: isAyaPlus,
            can_access: canAccess,
            checked_at: new Date().toISOString()
        });
    } catch (err: any) {
        console.error('[check-access] Error:', err);
        return res.status(500).json({ error: 'Internal server error', message: err?.message });
    }
}
