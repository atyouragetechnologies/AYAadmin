import { supabase } from './supabase';
import { useUserStore } from '../store/userStore';

export const MAX_DAILY_SPINS = 2;

/**
 * Returns YYYY-MM-DD in Asia/Kolkata timezone accurately across all environments and browsers.
 */
export const getTodayIST = (): string => {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  } catch {
    const now = new Date();
    return new Date(now.getTime() + 5.5 * 3600000).toISOString().split('T')[0];
  }
};

/**
 * Live milliseconds remaining until midnight IST.
 */
export const getMsToMidnightIST = (): number => {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).formatToParts(now);

    const getVal = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
    const hour = getVal('hour') % 24;
    const min = getVal('minute');
    const sec = getVal('second');

    const elapsedSeconds = hour * 3600 + min * 60 + sec;
    const remainingSeconds = Math.max(0, 86400 - elapsedSeconds);
    return remainingSeconds * 1000;
  } catch {
    const now = Date.now();
    const istNow = new Date(now + 5.5 * 3600000);
    const midnight = new Date(istNow);
    midnight.setUTCHours(18, 30, 0, 0);
    if (midnight.getTime() <= now) midnight.setUTCDate(midnight.getUTCDate() + 1);
    return Math.max(0, midnight.getTime() - now);
  }
};

/**
 * Get current spins used for today, checking localStorage and optionally Supabase.
 */
export const fetchSpinsUsed = async (userId?: string): Promise<number> => {
  const today = getTodayIST();
  let localSpins = 0;

  // 1. Read local storage
  try {
    const raw = localStorage.getItem('aya_vibe_spins');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        localSpins = typeof parsed.count === 'number' ? parsed.count : 0;
      } else {
        // Different day -> auto-reset
        localSpins = 0;
        localStorage.setItem('aya_vibe_spins', JSON.stringify({ count: 0, date: today }));
      }
    } else {
      localStorage.setItem('aya_vibe_spins', JSON.stringify({ count: 0, date: today }));
    }
  } catch (e) {
    console.warn('[spinLimit] localStorage read error', e);
  }

  // 2. If no valid registered user, rely on local storage
  if (!userId || userId.startsWith('offline-')) {
    return localSpins;
  }

  // 3. Query Supabase
  try {
    const { data, error } = await supabase
      .from('users')
      .select('daily_spins_used, spin_reset_date')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return localSpins;
    }

    let dbSpins = (data as any).daily_spins_used ?? 0;
    const dbResetDate = (data as any).spin_reset_date;

    // New day in DB -> reset
    if (!dbResetDate || dbResetDate < today) {
      dbSpins = 0;
      supabase
        .from('users')
        .update({ daily_spins_used: 0, spin_reset_date: today })
        .eq('id', userId)
        .then(() => {});
    }

    const finalSpins = Math.max(dbSpins, localSpins);
    localStorage.setItem('aya_vibe_spins', JSON.stringify({ count: finalSpins, date: today }));
    return finalSpins;
  } catch {
    return localSpins;
  }
};

/**
 * Record a new spin, persisting to localStorage, store, and Supabase.
 */
export const recordSpinUsage = async (userId?: string, currentSpinsUsed = 0): Promise<number> => {
  const today = getTodayIST();
  const nextSpins = Math.min(MAX_DAILY_SPINS, currentSpinsUsed + 1);

  // 1. Update localStorage
  try {
    localStorage.setItem('aya_vibe_spins', JSON.stringify({ count: nextSpins, date: today }));
  } catch (e) {
    console.warn('[spinLimit] localStorage write error', e);
  }

  // 2. Update userStore profile
  try {
    const profile = useUserStore.getState().profile;
    if (profile) {
      useUserStore.getState().setProfile({
        ...profile,
        daily_spins_used: nextSpins,
        spin_reset_date: today,
      });
    }
  } catch (e) {
    console.warn('[spinLimit] userStore update error', e);
  }

  // 3. Update Supabase
  if (userId && !userId.startsWith('offline-')) {
    try {
      await supabase
        .from('users')
        .update({ daily_spins_used: nextSpins, spin_reset_date: today })
        .eq('id', userId);
    } catch (e) {
      console.warn('[spinLimit] Supabase update error', e);
    }
  }

  // 4. Notify all components
  window.dispatchEvent(new CustomEvent('aya-spins-updated', { detail: { count: nextSpins } }));

  return nextSpins;
};
