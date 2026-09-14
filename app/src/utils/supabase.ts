import { createClient } from '@supabase/supabase-js';

let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/['"]/g, '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').replace(/['"]/g, '').trim();

if (supabaseUrl && !supabaseUrl.startsWith('http')) {
    supabaseUrl = 'https://' + supabaseUrl;
}

// On iOS Safari, detectSessionInUrl can cause a hang/loop when the URL doesn't
// contain an auth callback hash. Only enable it when we're actually on an OAuth
// redirect URL (i.e. the URL contains #access_token or ?code=).
const isOAuthCallback = typeof window !== 'undefined' && (
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('refresh_token') ||
    window.location.search.includes('code=')
);

let supabaseInstance: any;

try {
  supabaseInstance = createClient(
    supabaseUrl || 'https://dummy.supabase.co',
    supabaseAnonKey || 'dummy-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: isOAuthCallback,
        storageKey: 'aya-supabase-auth',
      },
      global: {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    }
  );
} catch (error) {
  console.error('[Supabase] Fatal error initializing client. Check your VITE_SUPABASE_URL.', error);
  // Fallback to dummy so the app doesn't crash on boot
  supabaseInstance = createClient('https://dummy.supabase.co', 'dummy-key');
}

export const supabase = supabaseInstance;
