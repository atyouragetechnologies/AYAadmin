import { createClient } from '@supabase/supabase-js';

// NOTE: deliberately NOT using firebase-admin here. That package (via its
// fetch-blob dependency) does `import "node:fs"` at load time, which Cloudflare
// Workers cannot provide even with nodejs_compat — importing it crashes this
// entire Worker on every request before any handler code runs. FCM is sent via
// its plain HTTP v1 REST API instead, using only fetch + node:crypto (both of
// which do work under Workers' nodejs_compat).
//
// 'web-push' is ALSO not statically imported for the same reason: its asn1.js
// dependency throws ("buffer.hasOwnProperty is not a function") the moment the
// module is evaluated under Workers. It's loaded lazily inside sendWebPush()
// instead, so a broken web-push only fails Web Push sends (caught per-subscription
// below) instead of crashing this endpoint for Android/FCM sends too.
let webpushModule = null;
let webpushLoadError = null;
async function getWebpush() {
    if (webpushModule) return webpushModule;
    if (webpushLoadError) throw webpushLoadError;
    try {
        webpushModule = (await import('web-push')).default;
        const publicVapidKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
        const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
        const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@aya-game.com';
        webpushModule.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
        return webpushModule;
    } catch (error) {
        webpushLoadError = error;
        throw error;
    }
}

let supabase = null;
let serviceAccount = null;
let cachedAccessToken = null; // { token, expiresAt }
let initialized = false;

function initServices() {
    if (initialized) return;

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

    try {
        if (supabaseUrl && supabaseKey && !supabase) {
            supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
        }
    } catch (error) {
        console.error('[admin-send-notification] Supabase init error:', error);
    }

    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (serviceAccountJson) {
            serviceAccount = JSON.parse(serviceAccountJson);
        } else {
            console.warn('[admin-send-notification] FIREBASE_SERVICE_ACCOUNT_JSON not found. FCM notifications will fail.');
        }
    } catch (e) {
        console.error('[admin-send-notification] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e);
    }

    initialized = true;
}

function base64url(input) {
    return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getFcmAccessToken() {
    if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
        return cachedAccessToken.token;
    }

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claims = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
    };
    const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;

    const { createSign } = await import('node:crypto');
    const signer = createSign('RSA-SHA256');
    signer.update(unsigned);
    signer.end();
    const signature = signer.sign(serviceAccount.private_key).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const jwt = `${unsigned}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
    });
    const json = await res.json();
    if (!json.access_token) throw new Error('FCM OAuth failed: ' + JSON.stringify(json));

    cachedAccessToken = { token: json.access_token, expiresAt: Date.now() + (json.expires_in || 3600) * 1000 };
    return json.access_token;
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
    const webpush = await getWebpush();
    await webpush.sendNotification(subscription, payload);
}

async function sendFCMNotification(token, payload) {
    if (!serviceAccount) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured.');
    }

    const message = {
        token: token,
        data: {
            title: payload.title,
            body: payload.body,
            url: payload.url || '/game',
            channel_id: 'push_notifications_v1'
        }
    };

    try {
        const accessToken = await getFcmAccessToken();
        const res = await fetch(`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; UTF-8' },
            body: JSON.stringify({ message }),
        });
        if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            const err = new Error(`FCM error: ${errJson?.error?.message || res.statusText}`);
            err.statusCode = res.status;
            throw err;
        }
    } catch (error) {
        throw error;
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-email');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    initServices();

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
            const { data, error } = await supabase.from('push_subscriptions').select('id, subscription');
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

        // Test deployment shares production's Supabase/Firebase data (no isolated
        // test project yet), so it must never actually deliver to a real device —
        // only the deploy:testweb Worker has IS_TEST_ENVIRONMENT set.
        const isTestEnv = process.env.IS_TEST_ENVIRONMENT === 'true';

        if (isTestEnv) {
            console.log(`[admin-send-notification] TEST ENVIRONMENT — skipping real delivery to ${total} real recipient(s).`);
        } else {
            await Promise.all(webSubscriptions.map(async (sub) => {
                try {
                    await sendWebPush(sub.subscription, payload);
                    sent++;
                } catch (error) {
                    failed++;
                    const type = classifyWebPushError(error);
                    if (type === 'expired' || type === 'authentication') {
                        await supabase.from('push_subscriptions').delete().eq('id', sub.id).catch(() => {});
                    }
                    failures.push({ platform: 'web', type, message: redactSensitiveText(error?.message) });
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
        }

        // Save to history (skipped in test env — this is real users' shared
        // production history, not something a test run should write to)
        if (!isTestEnv) {
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
        }

        return res.status(200).json({
            success: true,
            dryRun: isTestEnv,
            total,
            sent: isTestEnv ? 0 : sent,
            failed: isTestEnv ? 0 : failed,
            details: {
                web: webSubscriptions.length,
                android: fcmTokens.length,
                failures,
                ...(isTestEnv ? { note: 'TEST environment — no real notification was sent to any device.' } : {})
            }
        });
    } catch (error) {
        console.error('[admin-send-notification] Fatal error:', error?.name || 'Error', redactSensitiveText(error?.message));
        return res.status(500).json({ success: false, error: 'Internal server error while broadcasting notifications.' });
    }
}