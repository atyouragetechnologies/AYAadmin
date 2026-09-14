import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.44.2';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

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
  let endpointHostname = 'unknown';
  try { endpointHostname = new URL(record.subscription?.endpoint).hostname || 'unknown'; } catch { /* malformed subscription */ }
  let category = 'unknown';
  let reason = 'Unknown push delivery error';
  if (httpStatus === 404 || httpStatus === 410) { category = 'expired'; reason = 'Expired or invalid subscription'; }
  else if (httpStatus === 401 || httpStatus === 403) { category = 'authentication'; reason = 'VAPID authentication or push-service configuration error'; }
  else if (httpStatus === 429) { category = 'rate_limited'; reason = 'Push service rate limited this delivery'; }
  else if (httpStatus && httpStatus >= 500 && httpStatus <= 599) { category = 'temporary'; reason = 'Push service/server error'; }
  else if (!httpStatus && /timeout|timed?\s*out|network|econn|enotfound|socket|fetch failed/i.test(`${errorType} ${errorMessage}`)) { category = 'temporary'; reason = 'Network or timeout error'; }
  return { subscriptionId: record.id, endpointHostname, httpStatus, category, reason, errorType, errorMessage, errorBody: redact(error?.body) };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { user_id, title, body, icon, url } = await req.json();
    if (!user_id || !title || !body) throw new Error('user_id, title, and body are required.');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: record, error: fetchError } = await supabase
      .from('push_subscriptions').select('id, subscription').eq('user_id', user_id).single();
    if (fetchError || !record?.subscription) throw new Error('No push subscription found for this user.');

    webpush.setVapidDetails(
      Deno.env.get('VAPID_SUBJECT') || 'mailto:support@example.com',
      Deno.env.get('VAPID_PUBLIC_KEY')!,
      Deno.env.get('VAPID_PRIVATE_KEY')!
    );
    const payload = JSON.stringify({ title, body, icon: icon || '/pwa-192x192.webp', url: url || '/' });
    try {
      if (!record.subscription.endpoint) throw new Error('Invalid subscription object: endpoint is missing');
      await webpush.sendNotification(record.subscription, payload);
      return Response.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
      const failure: any = failureFor(record, error);
      if (failure.category === 'expired') {
        const { error: deleteError } = await supabase.from('push_subscriptions').delete().eq('id', record.id);
        failure.removed = !deleteError;
        if (deleteError) failure.errorMessage = `${failure.errorMessage}; automatic removal failed: ${redact(deleteError.message)}`;
      }
      console.error('[send-push] Push delivery failed:', failure);
      return Response.json({ success: false, failure }, { headers: corsHeaders, status: 502 });
    }
  } catch (error: any) {
    console.error('[send-push] Error:', error?.name || 'Error', redact(error?.message));
    return Response.json({ error: 'Unable to send push notification.' }, { headers: corsHeaders, status: 400 });
  }
});
