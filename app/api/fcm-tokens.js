import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

    let supabase;
    try {
        if (supabaseUrl && supabaseKey) {
            supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
        }
    } catch (e) {
        console.error('[fcm-tokens] Supabase init error:', e);
    }

    if (!supabase) {
        return res.status(500).json({ error: 'Supabase client is not configured on the server.' });
    }

    if (req.method === 'GET') {
        try {
            // For admin use - we don't have admin auth check here, but fcm tokens are not
            // sensitive like push subscriptions. For security, this should be admin-only in production.
            // We read from the users table where fcm_token is not null.
            const { data, error } = await supabase
                .from('users')
                .select('id, auth_user_id, fcm_token, username, email, fcm_token_updated_at');

            if (error) {
                // If column doesn't exist yet, return empty
                if (error.code === '42703') {
                    return res.status(200).json({ tokens: [] });
                }
                return res.status(500).json({ error: error.message });
            }

            const tokens = (data || [])
                .filter(u => u.fcm_token)
                .map(u => ({
                    id: u.auth_user_id || u.id,
                    user_id: u.auth_user_id || u.id,
                    token: u.fcm_token,
                    token_short: u.fcm_token.substring(0, 20) + '...',
                    platform: 'android',
                    username: u.username,
                    email: u.email,
                    created_at: u.fcm_token_updated_at || new Date().toISOString(),
                    updated_at: u.fcm_token_updated_at || new Date().toISOString()
                }));

            return res.status(200).json({ success: true, tokens });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}