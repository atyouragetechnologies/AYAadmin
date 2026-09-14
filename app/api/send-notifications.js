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
  console.error('[send-notifications] Supabase init error:', error);
}

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@aya-game.com';

if (publicVapidKey && privateVapidKey) {
  try {
    webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
  } catch (error) {
    console.error('[send-notifications] Failed to configure VAPID:', error?.name || 'Error');
  }
}

const FOUNDER_EMAIL = 'anitadhakad333@gmail.com';

function endpointHostname(subscription) {
  try {
    return new URL(subscription?.endpoint).hostname || 'unknown';
  } catch {
    return 'unknown';
  }
}

// Push-service errors can include a URL in their message. Keep diagnostics useful
// without ever returning or logging a complete subscription endpoint.
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

function pushErrorDetails(sub, error) {
  const statusCode = Number.isInteger(error?.statusCode)
    ? error.statusCode
    : Number.isInteger(error?.status) ? error.status : null;
  const errorType = typeof error?.name === 'string' ? error.name : 'PushDeliveryError';
  const errorMessage = redactSensitiveText(error?.message) || 'Push delivery failed';
  const errorBody = redactSensitiveText(error?.body);

  let category = 'unknown';
  let reason = 'Unknown push delivery error';
  if (statusCode === 404 || statusCode === 410) {
    category = 'expired';
    reason = 'Expired or invalid subscription';
  } else if (statusCode === 401 || statusCode === 403) {
    category = 'authentication';
    reason = 'VAPID authentication or push-service configuration error';
  } else if (statusCode === 429) {
    category = 'rate_limited';
    reason = 'Push service rate limited this delivery';
  } else if (statusCode && statusCode >= 500 && statusCode <= 599) {
    category = 'temporary';
    reason = 'Push service/server error';
  } else if (!statusCode && /timeout|timed?\s*out|network|econn|enotfound|socket|fetch failed/i.test(`${errorType} ${errorMessage}`)) {
    category = 'temporary';
    reason = 'Network or timeout error';
  }

  return {
    subscriptionId: sub.id,
    endpointHostname: endpointHostname(sub.subscription),
    httpStatus: statusCode,
    category,
    reason,
    errorType,
    errorMessage,
    errorBody
  };
}

function emptySummary() {
  return { sent: 0, expiredRemoved: 0, authentication: 0, temporary: 0, rateLimited: 0, other: 0 };
}

async function verifyAdminAuth(req) {
  const adminHeader = req.headers['x-admin-email'];
  const authHeader = req.headers.authorization;
  let callerEmail = adminHeader ? String(adminHeader).trim().toLowerCase() : null;
  if (!callerEmail && req.body?.adminEmail) callerEmail = String(req.body.adminEmail).trim().toLowerCase();

  if (!callerEmail && authHeader?.startsWith('Bearer ')) {
    try {
      const { data } = await supabase.auth.getUser(authHeader.slice(7));
      callerEmail = data?.user?.email?.trim().toLowerCase() || null;
    } catch (error) {
      console.warn('[send-notifications] Bearer token verification failed:', error?.name || 'Error');
    }
  }
  if (!callerEmail) return false;
  if (callerEmail === FOUNDER_EMAIL) return true;

  try {
    const { data } = await supabase.from('admin_users').select('email').eq('email', callerEmail).maybeSingle();
    return !!data;
  } catch (error) {
    console.error('[send-notifications] Admin check DB error:', error?.message || 'Database error');
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-email');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!supabase) return res.status(500).json({ error: 'Supabase client is not configured on the server.' });
  if (!publicVapidKey || !privateVapidKey) {
    console.error('[send-notifications] VAPID keys are not configured.');
    return res.status(500).json({ success: false, error: 'VAPID configuration error: server keys must be configured.' });
  }

  try {
    if (!(await verifyAdminAuth(req))) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Admin privileges required to broadcast notifications.' });
    }

    let { title, body, url = '/game' } = req.body || {};
    if (req.method === 'POST') {
      if (!title || typeof title !== 'string' || !title.trim()) return res.status(400).json({ success: false, error: 'Notification title is required.' });
      if (!body || typeof body !== 'string' || !body.trim()) return res.status(400).json({ success: false, error: 'Notification body is required.' });
      title = title.trim();
      body = body.trim();
    } else {
      title = '🌟 At Your Age (AYA)';
      body = 'Your daily challenge is waiting!';
    }

    const { data: subscriptions, error: fetchError } = await supabase.from('push_subscriptions').select('id, subscription, user_id');
    if (fetchError) {
      console.error('[send-notifications] Error fetching subscriptions:', fetchError.message);
      return res.status(500).json({ success: false, error: fetchError.message });
    }
    if (!subscriptions?.length) {
      return res.status(200).json({ success: true, total: 0, failed: 0, summary: emptySummary(), failures: [], message: 'No push subscriptions found in database' });
    }

    const payload = JSON.stringify({ title, body, url, icon: '/icons/icon-192.png' });
    const deliveries = await Promise.all(subscriptions.map(async (sub) => {
      try {
        if (!sub.subscription?.endpoint) throw new Error('Invalid subscription object: endpoint is missing');
        await webpush.sendNotification(sub.subscription, payload);
        return { sent: true };
      } catch (error) {
        const failure = pushErrorDetails(sub, error);
        if (failure.category === 'expired') {
          const { error: deleteError } = await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          failure.removed = !deleteError;
          if (deleteError) {
            failure.errorMessage = `${failure.errorMessage}; automatic removal failed: ${redactSensitiveText(deleteError.message)}`;
            console.error('[send-notifications] Failed to remove expired subscription:', { subscriptionId: sub.id, error: redactSensitiveText(deleteError.message) });
          }
        }
        console.error('[send-notifications] Push delivery failed:', failure);
        return { sent: false, failure };
      }
    }));

    const summary = emptySummary();
    const failures = [];
    for (const delivery of deliveries) {
      if (delivery.sent) { summary.sent++; continue; }
      const failure = delivery.failure;
      failures.push(failure);
      if (failure.category === 'expired') summary.expiredRemoved++;
      else if (failure.category === 'authentication') summary.authentication++;
      else if (failure.category === 'temporary') summary.temporary++;
      else if (failure.category === 'rate_limited') summary.rateLimited++;
      else summary.other++;
    }

    return res.status(200).json({ success: true, total: subscriptions.length, sent: summary.sent, failed: failures.length, summary, failures });
  } catch (error) {
    console.error('[send-notifications] Fatal error:', error?.name || 'Error', redactSensitiveText(error?.message));
    return res.status(500).json({ success: false, error: 'Internal server error while broadcasting notifications.' });
  }
}
