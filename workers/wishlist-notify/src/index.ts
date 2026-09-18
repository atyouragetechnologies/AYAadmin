/**
 * AYA Wishlist Telegram Notifier — Cloudflare Worker
 *
 * Receives a JSON POST from the AYA frontend whenever a user adds a
 * personality to the wishlist, then sends a MarkdownV2 message to the
 * configured Telegram group via the Bot API.
 *
 * Secrets (set via `wrangler secret put`):
 *   TELEGRAM_BOT_TOKEN        — e.g. 123456:ABC-...
 *   TELEGRAM_WISHLIST_CHAT_ID — e.g. -1001234567890
 *   ALLOWED_ORIGIN            — your production domain, e.g. https://aya.atyouragetechnologies.com
 *
 * Edge Firestore lookup (optional):
 *   Because Workers can't run the Firebase Admin SDK, user profile enrichment
 *   is done by the frontend before calling this worker (it passes `who` in the
 *   body). No DB dependency here — zero cold-start risk.
 */

export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WISHLIST_CHAT_ID: string;
  ALLOWED_ORIGIN?: string;
}

interface WishlistPayload {
  personalityName: string;
  voteCount?: number;
  who?: string;
  isNewRequest?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Escapes Telegram MarkdownV2 special characters.
 * https://core.telegram.org/bots/api#markdownv2-style
 */
function escMd(text: string | undefined | null): string {
  return String(text ?? '').replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(body: object, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

async function sendTelegramMessage(token: string, chatId: string, text: string): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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

// ── Main Handler ──────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';
    const cors = corsHeaders(allowedOrigin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    // ── Validate secrets ───────────────────────────────────────────────────
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_WISHLIST_CHAT_ID) {
      console.error('[wishlist-notify] Telegram env vars not configured');
      return json({ error: 'Worker not configured' }, 500, cors);
    }

    // ── Parse body ─────────────────────────────────────────────────────────
    let payload: WishlistPayload;
    try {
      payload = await request.json() as WishlistPayload;
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, cors);
    }

    const { personalityName, voteCount = 1, who, isNewRequest = true } = payload;

    if (!personalityName?.trim()) {
      return json({ error: 'Missing personalityName' }, 400, cors);
    }

    // ── Build message ──────────────────────────────────────────────────────
    const name = escMd(personalityName.trim());
    const safeWho = escMd(who || 'a guest user');
    const votes = Number(voteCount) || 1;

    const text = isNewRequest
      ? `🆕 *New wishlist request\\!*\n\n👤 By: ${safeWho}\n🌟 Wants: *${name}*`
      : `🔁 *Repeat wishlist vote*\n\n👤 By: ${safeWho}\n🌟 For: *${name}*\n🔥 Now requested *${votes}* times`;

    // ── Send to Telegram ───────────────────────────────────────────────────
    try {
      await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_WISHLIST_CHAT_ID, text);
      return json({ ok: true }, 200, cors);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[wishlist-notify] Telegram send failed:', msg);
      // Return 200 so the frontend doesn't treat this as a game-breaking error
      return json({ ok: false, error: msg }, 200, cors);
    }
  },
} satisfies ExportedHandler<Env>;
