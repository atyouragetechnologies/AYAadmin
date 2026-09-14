/**
 * api/recommendations.js
 *
 * Vercel Serverless Function for Life Navigation Story Recommendations
 * and Search Demand Analytics.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials in env.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { userId, situationText, situationTags = [], limit = 6 } = req.body || {};

        // 1. Fetch available story metadata
        const { data: metadataRows, error: metaErr } = await supabase
            .from('story_metadata')
            .select('*');

        if (metaErr) {
            console.warn('[api/recommendations] Meta error:', metaErr);
        }

        // 2. Fetch user traits if userId is provided
        let userScores = { risk: 50, creativity: 50, vision: 50, empathy: 50, leadership: 50 };
        if (userId && !userId.startsWith('offline-')) {
            const { data: profile } = await supabase
                .from('personality_profiles')
                .select('trait_risk_taker, trait_creative, trait_analytical, trait_social, trait_ambitious')
                .eq('user_id', userId)
                .maybeSingle();

            if (profile) {
                userScores = {
                    risk: profile.trait_risk_taker || 50,
                    creativity: profile.trait_creative || 50,
                    vision: profile.trait_analytical || 50,
                    empathy: profile.trait_social || 50,
                    leadership: profile.trait_ambitious || 50,
                };
            }
        }

        // 3. Log search demand analytics
        if (situationText && situationText.trim().length > 2) {
            await supabase.from('search_demand_analytics').insert({
                query_text: situationText.trim(),
                user_id: userId && !userId.startsWith('offline-') ? userId : null,
                match_count: (metadataRows || []).length,
            });
        }

        return res.status(200).json({
            success: true,
            recommendations: (metadataRows || []).slice(0, limit),
            userScores,
        });
    } catch (err) {
        console.error('[api/recommendations] Internal Error:', err);
        return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
}
