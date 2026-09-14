import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.44.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function hostname(subscription: any) {
  try { return new URL(subscription?.endpoint).hostname || 'unknown'; } catch { return 'unknown'; }
}

function redact(value: unknown) {
  if (value === undefined || value === null) return null;
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.replace(/https?:\/\/[^\s"'<>]+/gi, (url) => {
    try { return `[endpoint host: ${new URL(url).hostname}]`; } catch { return '[endpoint redacted]'; }
  }).replace(/((?:p256dh|auth|vapid(?:[_ -]?(?:private|public)?[_ -]?key)?|authorization)\s*[:=]\s*)[^,\s}"']+/gi, '$1[redacted]').slice(0, 2000);
}

function failureFor(record: any, error: any) {
  const httpStatus = Number.isInteger(error?.statusCode) ? error.statusCode : Number.isInteger(error?.status) ? error.status : null;
  const errorType = typeof error?.name === 'string' ? error.name : 'PushDeliveryError';
  const errorMessage = redact(error?.message) || 'Push delivery failed';
  let category = 'unknown';
  let reason = 'Unknown push delivery error';
  if (httpStatus === 404 || httpStatus === 410) { category = 'expired'; reason = 'Expired or invalid subscription'; }
  else if (httpStatus === 401 || httpStatus === 403) { category = 'authentication'; reason = 'VAPID authentication or push-service configuration error'; }
  else if (httpStatus === 429) { category = 'rate_limited'; reason = 'Push service rate limited this delivery'; }
  else if (httpStatus && httpStatus >= 500 && httpStatus <= 599) { category = 'temporary'; reason = 'Push service/server error'; }
  else if (!httpStatus && /timeout|timed?\s*out|network|econn|enotfound|socket|fetch failed/i.test(`${errorType} ${errorMessage}`)) { category = 'temporary'; reason = 'Network or timeout error'; }
  return { subscriptionId: record.id, endpointHostname: hostname(record.subscription), httpStatus, category, reason, errorType, errorMessage, errorBody: redact(error?.body) };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user?.email) throw new Error('Invalid authentication token or no email associated.');
    const { data: adminData } = await supabase.from('admin_users').select('email').eq('email', user.email).maybeSingle();
    if (!adminData) throw new Error('Unauthorized. You are not an admin.');

    const { title, body, icon, url } = await req.json();
    if (!title || !body) throw new Error('title and body are required.');
    const { data: subscriptions, error: subError } = await supabase.from('push_subscriptions').select('id, subscription');
    if (subError) throw subError;
    if (!subscriptions?.length) return Response.json({ success: true, total: 0, sent: 0, failed: 0, failures: [] }, { headers: corsHeaders });

    webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') || 'mailto:support@example.com', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);
    const payload = JSON.stringify({ title, body, icon: icon || '/pwa-192x192.webp', url: url || '/game' });
    const results = await Promise.all(subscriptions.map(async (record: any) => {
      try {
        if (!record.subscription?.endpoint) throw new Error('Invalid subscription object: endpoint is missing');
        await webpush.sendNotification(record.subscription, payload);
        return { sent: true };
      } catch (error) {
        const failure: any = failureFor(record, error);
        if (failure.category === 'expired') {
          const { error: deleteError } = await supabase.from('push_subscriptions').delete().eq('id', record.id);
          failure.removed = !deleteError;
          if (deleteError) failure.errorMessage = `${failure.errorMessage}; automatic removal failed: ${redact(deleteError.message)}`;
        }
        console.error('[broadcast-push] Push delivery failed:', failure);
        return { sent: false, failure };
      }
    }));

    const failures = results.filter((result) => !result.sent).map((result: any) => result.failure);
    const summary = { sent: results.length - failures.length, expiredRemoved: 0, authentication: 0, temporary: 0, rateLimited: 0, other: 0 };
    for (const failure of failures) {
      if (failure.category === 'expired') summary.expiredRemoved++;
      else if (failure.category === 'authentication') summary.authentication++;
      else if (failure.category === 'temporary') summary.temporary++;
      else if (failure.category === 'rate_limited') summary.rateLimited++;
      else summary.other++;
    }
    return Response.json({ success: true, total: results.length, sent: summary.sent, failed: failures.length, summary, failures }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[broadcast-push] Error:', error?.name || 'Error', redact(error?.message));
    return Response.json({ error: 'Unable to broadcast push notification.' }, { headers: corsHeaders, status: 400 });
  }
});
