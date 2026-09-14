import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

let supabase;
try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
  }
} catch (e) {
  console.error('[subscribe-push] Supabase init error:', e);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Supabase client is not configured on the server.'
    });
  }

  // ── DELETE: Unsubscribe Push Subscription ──────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const { endpoint } = req.body || {};
      if (!endpoint) {
        return res.status(400).json({ success: false, error: 'Missing endpoint to unsubscribe.' });
      }

      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .filter('subscription->>endpoint', 'eq', endpoint);

      if (deleteError) {
        return res.status(500).json({ success: false, error: deleteError.message });
      }

      return res.status(200).json({ success: true, message: 'Unsubscribed successfully.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── GET: Registered Device Count ──────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('id');

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({
        success: true,
        count: data ? data.length : 0
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── POST: Save or Update Push Subscription ────────────────────────────────
  if (req.method === 'POST') {
    try {
      const { subscription, userId } = req.body || {};

      if (!subscription || !subscription.endpoint) {
        console.warn('[subscribe-push] Missing required subscription payload or endpoint.');
        return res.status(400).json({
          success: false,
          error: 'Missing required subscription payload or endpoint.'
        });
      }

      const endpoint = subscription.endpoint;
      const isValidUuid = userId && typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      const targetUserId = isValidUuid ? userId : null;

      let endpointHost = 'unknown';
      try { endpointHost = new URL(endpoint).hostname; } catch { /* validation below handles malformed values */ }
      console.log('[subscribe-push] Processing subscription.', { endpointHost, hasValidUserId: !!targetUserId });

      // Check if subscription with the same endpoint already exists
      const { data: existingRows, error: checkError } = await supabase
        .from('push_subscriptions')
        .select('id, user_id')
        .eq('subscription->>endpoint', endpoint);

      if (checkError) {
        console.warn('[subscribe-push] Filter query warning:', checkError.message);
      }

      const existingSub = existingRows && existingRows.length > 0 ? existingRows[0] : null;

      if (existingSub) {
        // UPDATE existing subscription row
        const updatePayload = {
          subscription: subscription,
          updated_at: new Date().toISOString()
        };
        if (targetUserId) {
          updatePayload.user_id = targetUserId;
        }

        const { data: updated, error: updateError } = await supabase
          .from('push_subscriptions')
          .update(updatePayload)
          .eq('id', existingSub.id)
          .select('id')
          .maybeSingle();

        if (updateError) {
          console.error('[subscribe-push] Update error:', updateError);
          return res.status(500).json({ success: false, error: updateError.message });
        }

        if (targetUserId) {
          try {
            await supabase.from('users').update({
              notifications_enabled: true,
              notification_permission: 'granted',
              notification_updated_at: new Date().toISOString()
            }).eq('id', targetUserId);
          } catch (userUpdErr) {
            console.warn('[subscribe-push] Notice updating user notification status:', userUpdErr);
          }
        }

        console.log('[subscribe-push] Subscription updated successfully in DB. ID:', updated?.id || existingSub.id);
        return res.status(200).json({ success: true, id: updated?.id || existingSub.id, updated: true });
      } else {
        // INSERT new subscription row
        const insertPayload = targetUserId
          ? { user_id: targetUserId, subscription: subscription }
          : { subscription: subscription };

        let { data: inserted, error: insertError } = await supabase
          .from('push_subscriptions')
          .insert(insertPayload)
          .select('id')
          .maybeSingle();

        // Fallback if FK constraint fails (e.g. user_id does not exist in public.users)
        if (insertError && (insertError.code === '23503' || insertError.code === '23502')) {
          console.warn('[subscribe-push] FK constraint failure, retrying insert without user_id...');
          const retryRes = await supabase
            .from('push_subscriptions')
            .insert({ subscription: subscription })
            .select('id')
            .maybeSingle();

          if (!retryRes.error) {
            inserted = retryRes.data;
            insertError = null;
          } else {
            insertError = retryRes.error;
          }
        }

        if (insertError) {
          console.error('[subscribe-push] Insert error:', insertError);
          return res.status(500).json({ success: false, error: insertError.message });
        }

        if (targetUserId) {
          try {
            await supabase.from('users').update({
              notifications_enabled: true,
              notification_permission: 'granted',
              notification_updated_at: new Date().toISOString()
            }).eq('id', targetUserId);
          } catch (userUpdErr) {
            console.warn('[subscribe-push] Notice updating user notification status:', userUpdErr);
          }
        }

        console.log('[subscribe-push] Subscription inserted successfully in DB. ID:', inserted?.id);
        return res.status(201).json({ success: true, id: inserted?.id, created: true });
      }

    } catch (err) {
      console.error('[subscribe-push] Exception:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
