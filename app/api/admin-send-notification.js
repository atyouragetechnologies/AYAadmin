import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

let supabase;
try {
    if (supabaseUrl && supabaseKey) {
        supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    }
} catch (error) {
    console.error('[admin-send-notification] Supabase init error:', error);
}

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@aya-game.com';

if (publicVapidKey && privateVapidKey) {
    try {
        webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
    } catch (error) {
        console.error('[admin-send-notification] Failed to configure VAPID:', error?.name || 'Error');
    }
}

const FOUNDER_EMAIL = 'anitadhakad333@gmail.com';

async function verifyAdminAuth(req) {
    const adminHeader = req.headers['x-admin-email'];
    let callerEmail = adminHeader ? String(adminHeader).trim().toLowerCase() : null;
    if (!callerEmail && req.body?.adminEmail) callerEmail = String(req.body.adminEmail).trim().toLowerCase();
    if (!callerEmail && req.body?.admin_email) callerEmail = String(req.body.admin_email).trim().toLowerCase();
    if (!callerEmail) return false;
    if (callerEmail === FOUNDER_EMAIL) return true;

    try {
        const { data } = await supabase.from('admin_users').select('email').eq('email', callerEmail).maybeSingle();
        return !!data;
    } catch (error) {
        console.error('[admin-send-notification] Admin check DB error:', error?.message || 'Database error');
        return false;
    }
}

function redactSensitiveText(value) {
    if (value === undefined || value === null) return null;
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    return text
        .replace(/https?:\/\/[^\s"'<>]+/gi, (url) => {
            try { return `[endpoint host: ${new URL(url).hostname}]`; } catch { return '[endpoint redacted]'; }
        })
        .replace(/((?:p256dh|auth|vapid(?:[_ -]?(?:private|public)?[_ -]?key)?|authorization)\s*[:=]\s*)[^,\s}"']+/gi, '$1[redacted]')
        .slice(0, 2000);
}

function classifyWebPushError(error) {
    const statusCode = Number.isInteger(error?.statusCode)
        ? error.statusCode
        : Number.isInteger(error?.status) ? error.status : null;
    if (statusCode === 404 || statusCode === 410) return 'expired';
    if (statusCode === 401 || statusCode === 403) return 'authentication';
    if (statusCode === 429) return 'rate_limited';
    if (statusCode && statusCode >= 500 && statusCode <= 599) return 'temporary';
    return 'unknown';
}

async function fetchFCMTokens() {
    const { data, error } = await supabase.from('users').select('id, auth_user_id, fcm_token, fcm_token_updated_at');
    if (error) {
        if (error.code === '42703') return [];
        throw error;
    }
    return (data || []).filter(u => u.fcm_token).map(u => ({
        token: u.fcm_token,
        user_id: u.auth_user_id || u.id,
        updated_at: u.fcm_token_updated_at || new Date().toISOString()
    }));
}

async function sendWebPush(subscription, payload) {
    await webpush.sendNotification(subscription, payload);
}

async function sendFCMNotification(token, payload) {
    const fcmServerKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;
    if (!fcmServerKey) throw new Error('FCM server key is not configured');

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
            'Authorization': `key=${fcmServerKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: token,
            data: {
                title: payload.title,
                body: payload.body,
                url: payload.url || '/game',
                channel_id: 'push_notifications_v1'
            }
        })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`FCM error ${response.status}: ${text}`);
    }

    const result = await response.json();
    if (result.failure > 0) {
        throw new Error('FCM delivery failed');
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-email');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!supabase) return res.status(500).json({ error: 'Supabase client is not configured on the server.' });

    try {
        if (!(await verifyAdminAuth(req))) {
            return res.status(403).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
        }

        const { title, body, target_platform = 'both', url = '/game' } = req.body || {};
        if (!title || typeof title !== 'string' || !title.trim()) return res.status(400).json({ success: false, error: 'Notification title is required.' });
        if (!body || typeof body !== 'string' || !body.trim()) return res.status(400).json({ success: false, error: 'Notification body is required.' });

        const cleanTitle = title.trim();
        const cleanBody = body.trim();
        const cleanUrl = (url || '/game').trim() || '/game';
        const target = ['both', 'android', 'web'].includes(target_platform) ? target_platform : 'both';
        const payload = JSON.stringify({ title: cleanTitle, body: cleanBody, url: cleanUrl, icon: '/icons/icon-192.png' });

        let webSubscriptions = [];
        if (target === 'both' || target === 'web') {
            const { data, error } = await supabase.from('push_subscriptions').select('subscription');
            if (error) throw error;
            webSubscriptions = (data || []).filter(s => s.subscription?.endpoint);
        }

        let fcmTokens = [];
        if (target === 'both' || target === 'android') {
            fcmTokens = await fetchFCMTokens();
        }

        const total = webSubscriptions.length + fcmTokens.length;
        let sent = 0;
        let failed = 0;
        const failures = [];

        await Promise.all(webSubscriptions.map(async (sub) => {
            try {
                await sendWebPush(sub.subscription, payload);
                sent++;
            } catch (error) {
                failed++;
                failures.push({ platform: 'web', type: classifyWebPushError(error), message: redactSensitiveText(error?.message) });
            }
        }));

        await Promise.all(fcmTokens.map(async (fcm) => {
            try {
                await sendFCMNotification(fcm.token, { title: cleanTitle, body: cleanBody, url: cleanUrl });
                sent++;
            } catch (error) {
                failed++;
                failures.push({ platform: 'android', type: 'fcm', message: redactSensitiveText(error?.message) });
            }
        }));

        // Save to history
        try {
            await supabase.from('notification_history').insert({
                title: cleanTitle,
                body: cleanBody,
                target_platform: target,
                sent_count: total,
                success_count: sent,
                failure_count: failed
            });
        } catch (histErr) {
            console.warn('[admin-send-notification] Failed to save history:', histErr?.message || histErr);
        }

        return res.status(200).json({
            success: true,
            total,
            sent,
            failed,
            details: {
                web: webSubscriptions.length,
                android: fcmTokens.length,
                failures
            }
        });
    } catch (error) {
        console.error('[admin-send-notification] Fatal error:', error?.name || 'Error', redactSensitiveText(error?.message));
        return res.status(500).json({ success: false, error: 'Internal server error while broadcasting notifications.' });
    }
}