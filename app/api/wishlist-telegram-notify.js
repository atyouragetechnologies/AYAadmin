import { createClient } from '@supabase/supabase-js';

let supabase = null;
let initialized = false;
let botToken, chatId, webhookSecret;

function initServices() {
  if (initialized) return;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    if (supabaseUrl && supabaseKey && !supabase) {
      supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    }
  } catch (error) {
    console.error('[wishlist-telegram-notify] Supabase init error:', error);
  }

  botToken = process.env.TELEGRAM_BOT_TOKEN;
  chatId = process.env.TELEGRAM_WISHLIST_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
  webhookSecret = process.env.WISHLIST_WEBHOOK_SECRET;

  initialized = true;
}

function escapeMarkdown(text) {
  return String(text ?? '').replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

async function lookupRequester(userId) {
  if (!userId || !supabase) return null;
  try {
    const { data } = await supabase
      .from('users')
      .select('username, name, age')
      .eq('id', userId)
      .maybeSingle();
    return data || null;
  } catch (error) {
    console.warn('[wishlist-telegram-notify] Requester lookup failed:', error?.message || error);
    return null;
  }
}

async function sendTelegramMessage(text) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Telegram API ${res.status}: ${body.slice(0, 300)}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  initServices();

  // Shared secret set when configuring the Supabase Database Webhook — stops
  // random internet requests from spamming the Telegram group.
  if (!webhookSecret || req.headers['x-webhook-secret'] !== webhookSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!botToken || !chatId) {
    console.error('[wishlist-telegram-notify] TELEGRAM_BOT_TOKEN / chat id not configured.');
    return res.status(500).json({ error: 'Telegram is not configured on the server.' });
  }

  try {
    const { type, table, record, old_record } = req.body || {};
    if (table !== 'personality_wishlist' || !record) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    const isNewRequest = type === 'INSERT';
    const isRepeatVote = type === 'UPDATE' && old_record && record.vote_count > old_record.vote_count;
    if (!isNewRequest && !isRepeatVote) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    const requester = await lookupRequester(record.user_id);
    const who = requester?.username || requester?.name
      ? escapeMarkdown(requester.username || requester.name) + (requester?.age ? ` \\(${requester.age}\\)` : '')
      : 'a guest user';

    const name = escapeMarkdown(record.personality_name);
    const votes = Number(record.vote_count) || 1;

    const text = isNewRequest
      ? `🆕 *New wishlist request\\!*\n\n👤 By: ${who}\n🌟 Wants: *${name}*`
      : `🔁 *Repeat wishlist vote*\n\n👤 By: ${who}\n🌟 For: *${name}*\n🔥 Now requested *${votes}* times`;

    await sendTelegramMessage(text);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[wishlist-telegram-notify] Failed:', error?.message || error);
    // 200 so Supabase doesn't endlessly retry a webhook that will never succeed
    // (e.g. bad Telegram config) — the error is already logged above.
    return res.status(200).json({ ok: false, error: 'Notification failed, see server logs' });
  }
}
