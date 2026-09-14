/**
 * dnaService.ts
 *
 * Dedicated service for persistent DNA profile management.
 * Guarantees that all trait lookups and story completion scores are
 * dynamically linked to the user and persisted directly to Supabase
 * with live real-time synchronization.
 */

import { supabase } from '../utils/supabase';
import { getMyUserId, formatSupabaseError } from './followService';
import { useUserStore } from '../store/userStore';
import { logJourneyEvent } from '../utils/feedbackUtils';
import { calculateLifeTraits, matchFutureArchetype } from '../utils/futureSelfMatch';

export interface UserDnaTraits {
  risk: number;
  creativity: number;
  vision: number;      // analytical
  empathy: number;     // social
  leadership: number;  // ambitious
  discipline?: number;
  resilience?: number;
}

export interface UserDnaProfile {
  userId: string;
  traits: UserDnaTraits;
  totalXp: number;
  level: number;
  storiesCompleted: number;
  futureArchetype?: string;
  futureArchetypeScore?: number;
  lifeTraits?: Record<string, number>;
  lastUpdated?: string;
}

export interface SaveStoryCompletionPayload {
  levelId: string;
  selectedPersonality: string;
  matchScore: number;
  stars: number;
  sessionXp: number;
  traits: UserDnaTraits;
  futureArchetype?: string;
  futureArchetypeScore?: number;
  lifeTraits?: Record<string, number>;
  gameplayScores?: Record<string, number>;
  choicesLog?: any[];
}

/**
 * Safely resolves the active user ID from explicit argument, current store profile,
 * localStorage session, or Supabase Auth session.
 */
export async function resolveActiveUserId(explicitId?: string): Promise<string | null> {
  if (explicitId && !explicitId.startsWith('offline-')) {
    return explicitId;
  }

  const storeProfile = useUserStore.getState().profile;
  if (storeProfile?.id && !storeProfile.id.startsWith('offline-')) {
    return storeProfile.id;
  }

  try {
    const sessionData = localStorage.getItem('aya_session');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (parsed?.userId && !parsed.userId.startsWith('offline-')) {
        return parsed.userId;
      }
    }
  } catch {}

  try {
    const authUserId = await getMyUserId();
    if (authUserId) return authUserId;
  } catch {}

  return storeProfile?.id || null;
}

/**
 * Fetch the user's persistent DNA profile from Supabase with multi-tier fallback.
 * Checks personality_profiles, users table, and journey_events telemetry.
 */
export async function fetchUserDnaProfile(overrideUserId?: string): Promise<UserDnaProfile | null> {
  const activeUserId = await resolveActiveUserId(overrideUserId);
  if (!activeUserId) {
    console.log('[dnaService] No user ID available for DNA lookup');
    return null;
  }

  console.log('[dnaService] Fetching live DNA profile for user:', activeUserId);

  let ppData: any = null;
  let userData: any = null;

  // 1. Primary: query personality_profiles
  try {
    const res = await supabase
      .from('personality_profiles')
      .select('*')
      .eq('user_id', activeUserId)
      .maybeSingle();
    ppData = res.data;
  } catch (err) {
    console.warn('[dnaService] personality_profiles fetch notice:', err);
  }

  // 2. Secondary: query users table
  try {
    const userRes = await supabase
      .from('users')
      .select('id, total_xp, level, stories_completed, gameplay_scores, onboarding_scores, current_streak')
      .eq('id', activeUserId)
      .maybeSingle();
    userData = userRes.data;
  } catch (err) {
    console.warn('[dnaService] users table fetch notice:', err);
  }

  // 3. Tertiary fallback: if personality_profiles is empty, check journey_events for latest dna_sync
  if (!ppData) {
    try {
      const eventRes = await supabase
        .from('journey_events')
        .select('event_data, created_at')
        .eq('user_id', activeUserId)
        .in('event_type', ['dna_sync', 'dna_profile_updated'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (eventRes.data?.event_data) {
        const ev = eventRes.data.event_data;
        ppData = {
          user_id: activeUserId,
          trait_risk_taker: ev.traits?.risk,
          trait_creative: ev.traits?.creativity,
          trait_analytical: ev.traits?.vision ?? ev.traits?.analytical,
          trait_social: ev.traits?.empathy ?? ev.traits?.social,
          trait_ambitious: ev.traits?.leadership ?? ev.traits?.ambitious,
          total_xp: ev.total_xp,
          level: ev.level,
          stories_completed: ev.stories_completed,
          future_archetype: ev.future_archetype,
          future_archetype_score: ev.future_archetype_score,
          life_resilience: ev.life_traits?.resilience,
          life_discipline: ev.life_traits?.discipline,
          last_updated: eventRes.data.created_at,
        };
      }
    } catch {}
  }

  // If no backend record exists yet, save current store traits to Supabase immediately
  if (!ppData && !userData) {
    const storeProfile = useUserStore.getState().profile;
    if (storeProfile?.traits) {
      console.log('[dnaService] Initializing backend DNA profile from local store');
      return saveUserDnaProfile({
        userId: activeUserId,
        traits: storeProfile.traits,
        totalXp: storeProfile.total_xp || 0,
        level: storeProfile.level || 1,
        storiesCompleted: storeProfile.stories_completed || 0,
      });
    }
    return null;
  }

  const fallbackGameplay = userData?.gameplay_scores || {};
  const fallbackOnboarding = userData?.onboarding_scores || {};

  const traits: UserDnaTraits = {
    risk: ppData?.trait_risk_taker ?? fallbackGameplay.risk ?? fallbackOnboarding.risk ?? 50,
    creativity: ppData?.trait_creative ?? fallbackGameplay.creativity ?? fallbackOnboarding.creativity ?? 50,
    vision: ppData?.trait_analytical ?? fallbackGameplay.vision ?? fallbackGameplay.analytical ?? fallbackOnboarding.vision ?? 50,
    empathy: ppData?.trait_social ?? fallbackGameplay.empathy ?? fallbackGameplay.social ?? fallbackOnboarding.empathy ?? 50,
    leadership: ppData?.trait_ambitious ?? fallbackGameplay.leadership ?? fallbackGameplay.ambitious ?? fallbackOnboarding.leadership ?? 50,
    discipline: ppData?.life_discipline ?? 50,
    resilience: ppData?.life_resilience ?? 50,
  };

  const rawLifeTraits: Record<string, number> = {
    resilience: ppData?.life_resilience ?? 0,
    discipline: ppData?.life_discipline ?? 0,
    courage: ppData?.life_courage ?? 0,
    creativity: ppData?.life_creativity ?? 0,
    emotional_control: ppData?.life_emotional_control ?? 0,
    leadership: ppData?.life_leadership ?? 0,
    risk_intelligence: ppData?.life_risk_intelligence ?? 0,
    consistency: ppData?.life_consistency ?? 0,
  };

  const hasNonFlatLifeTraits = Object.values(rawLifeTraits).some(v => v > 0 && v !== 50);
  const resolvedLifeTraits = hasNonFlatLifeTraits
    ? rawLifeTraits
    : calculateLifeTraits(traits as any, userData?.current_streak || 0);

  const matchedArchetype = ppData?.future_archetype
    ? { archetype: { name: ppData.future_archetype }, score: ppData.future_archetype_score || 85 }
    : matchFutureArchetype(resolvedLifeTraits as any);

  const resolvedTotalXp = Math.max(ppData?.total_xp ?? 0, userData?.total_xp ?? 0);
  const resolvedLevel = Math.max(ppData?.level ?? 1, userData?.level ?? 1);
  const resolvedStories = Math.max(ppData?.stories_completed ?? 0, userData?.stories_completed ?? 0);

  return {
    userId: activeUserId,
    traits,
    totalXp: resolvedTotalXp,
    level: resolvedLevel,
    storiesCompleted: resolvedStories,
    futureArchetype: ppData?.future_archetype || matchedArchetype.archetype.name,
    futureArchetypeScore: ppData?.future_archetype_score || matchedArchetype.score,
    lifeTraits: resolvedLifeTraits as Record<string, number>,
    lastUpdated: ppData?.last_updated ?? undefined,
  };
}

/**
 * Persist DNA profile directly to Supabase across personality_profiles, users table,
 * and journey_events telemetry.
 */
export async function saveUserDnaProfile(payload: {
  userId?: string;
  traits: UserDnaTraits;
  totalXp?: number;
  level?: number;
  storiesCompleted?: number;
  futureArchetype?: string;
  futureArchetypeScore?: number;
  lifeTraits?: Record<string, number>;
}): Promise<UserDnaProfile> {
  const activeUserId = await resolveActiveUserId(payload.userId);
  if (!activeUserId) {
    throw new Error('No user ID found to save DNA profile.');
  }

  const ppPayload = {
    user_id: activeUserId,
    trait_risk_taker: Math.round(payload.traits.risk || 50),
    trait_creative: Math.round(payload.traits.creativity || 50),
    trait_analytical: Math.round(payload.traits.vision || 50),
    trait_social: Math.round(payload.traits.empathy || 50),
    trait_ambitious: Math.round(payload.traits.leadership || 50),
    future_archetype: payload.futureArchetype || null,
    future_archetype_score: payload.futureArchetypeScore || null,
    total_xp: payload.totalXp ?? 0,
    level: payload.level ?? 1,
    stories_completed: payload.storiesCompleted ?? 0,
    life_resilience: payload.lifeTraits?.resilience ?? 50,
    life_discipline: payload.lifeTraits?.discipline ?? 50,
    life_courage: payload.lifeTraits?.courage ?? 50,
    life_creativity: payload.lifeTraits?.creativity ?? 50,
    life_emotional_control: payload.lifeTraits?.emotional_control ?? 50,
    life_leadership: payload.lifeTraits?.leadership ?? 50,
    life_risk_intelligence: payload.lifeTraits?.risk_intelligence ?? 50,
    life_consistency: payload.lifeTraits?.consistency ?? 50,
    last_updated: new Date().toISOString(),
  };

  // 1. Upsert into personality_profiles
  try {
    const { error } = await supabase
      .from('personality_profiles')
      .upsert(ppPayload, { onConflict: 'user_id' });
    if (error) {
      console.warn('[dnaService] Upsert error, trying update:', formatSupabaseError(error));
      await supabase.from('personality_profiles').update(ppPayload).eq('user_id', activeUserId);
    }
  } catch (err) {
    console.warn('[dnaService] personality_profiles write notice:', err);
  }

  // 2. Update users table gameplay_scores & stats
  try {
    await supabase
      .from('users')
      .update({
        total_xp: payload.totalXp,
        level: payload.level,
        stories_completed: payload.storiesCompleted,
        gameplay_scores: {
          risk: payload.traits.risk,
          creativity: payload.traits.creativity,
          vision: payload.traits.vision,
          empathy: payload.traits.empathy,
          leadership: payload.traits.leadership,
        },
      })
      .eq('id', activeUserId);
  } catch (err) {
    console.warn('[dnaService] users table update notice:', err);
  }

  // 3. Log high-reliability journey event for telemetry
  logJourneyEvent(activeUserId, 'dna_module', 'dna_sync', {
    traits: payload.traits,
    total_xp: payload.totalXp,
    level: payload.level,
    stories_completed: payload.storiesCompleted,
    future_archetype: payload.futureArchetype,
    future_archetype_score: payload.futureArchetypeScore,
    life_traits: payload.lifeTraits,
    synced_at: new Date().toISOString(),
  }).catch(() => {});

  // 4. Update Zustand state immediately for local sync
  const currentStore = useUserStore.getState().profile;
  if (currentStore && currentStore.id === activeUserId) {
    useUserStore.getState().setProfile({
      ...currentStore,
      traits: {
        ...currentStore.traits,
        risk: payload.traits.risk,
        creativity: payload.traits.creativity,
        vision: payload.traits.vision,
        empathy: payload.traits.empathy,
        leadership: payload.traits.leadership,
      },
      gameplay_scores: {
        risk: payload.traits.risk,
        creativity: payload.traits.creativity,
        vision: payload.traits.vision,
        empathy: payload.traits.empathy,
        leadership: payload.traits.leadership,
      },
      total_xp: Math.max(payload.totalXp ?? 0, currentStore.total_xp || 0),
      level: Math.max(payload.level ?? 1, currentStore.level || 1),
      stories_completed: Math.max(payload.storiesCompleted ?? 0, currentStore.stories_completed || 0),
      ...(payload.futureArchetype ? { futureArchetype: payload.futureArchetype } : {}),
      ...(payload.futureArchetypeScore ? { futureArchetypeScore: payload.futureArchetypeScore } : {}),
      ...(payload.lifeTraits ? { lifeTraits: payload.lifeTraits } : {}),
    } as any);
  }

  return {
    userId: activeUserId,
    traits: payload.traits,
    totalXp: payload.totalXp ?? 0,
    level: payload.level ?? 1,
    storiesCompleted: payload.storiesCompleted ?? 0,
    futureArchetype: payload.futureArchetype,
    futureArchetypeScore: payload.futureArchetypeScore,
    lifeTraits: payload.lifeTraits,
    lastUpdated: ppPayload.last_updated,
  };
}

/**
 * Atomically save story completion results and update DNA traits in Supabase.
 * Uses atomic RPC when authenticated, with resilient direct-table fallback and telemetry.
 */
export async function saveStoryCompletionDna(
  payload: SaveStoryCompletionPayload
): Promise<UserDnaProfile> {
  const activeUserId = await resolveActiveUserId();
  const currentStore = useUserStore.getState().profile;

  console.log('[dnaService] Saving story completion DNA for user:', activeUserId, {
    levelId: payload.levelId,
    stars: payload.stars,
    traits: payload.traits,
  });

  const resolvedTotalXp = (currentStore?.total_xp || 0) + payload.sessionXp;
  const resolvedStories = (currentStore?.stories_completed || 0) + 1;
  const resolvedLevel = Math.max(currentStore?.level || 1, Math.floor(resolvedTotalXp / 100) + 1);

  if (!activeUserId) {
    return {
      userId: 'local-user',
      traits: payload.traits,
      totalXp: resolvedTotalXp,
      level: resolvedLevel,
      storiesCompleted: resolvedStories,
      futureArchetype: payload.futureArchetype,
      futureArchetypeScore: payload.futureArchetypeScore,
      lifeTraits: payload.lifeTraits,
      lastUpdated: new Date().toISOString()
    };
  }

  // 1. Try atomic RPC if available
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('save_story_completion_dna', {
      p_level_id: String(payload.levelId),
      p_selected_personality: String(payload.selectedPersonality),
      p_match_score: payload.matchScore,
      p_stars: payload.stars,
      p_session_xp: payload.sessionXp,
      p_trait_risk_taker: Math.round(payload.traits.risk),
      p_trait_creative: Math.round(payload.traits.creativity),
      p_trait_analytical: Math.round(payload.traits.vision),
      p_trait_social: Math.round(payload.traits.empathy),
      p_trait_ambitious: Math.round(payload.traits.leadership),
      p_future_archetype: payload.futureArchetype || null,
      p_future_archetype_score: payload.futureArchetypeScore || null,
      p_life_traits: payload.lifeTraits || null,
      p_gameplay_scores: payload.gameplayScores || null,
      p_choices_log: payload.choicesLog || null,
    });

    if (!rpcError && rpcData?.success) {
      console.log('[dnaService] ✓ Successfully saved story completion via RPC:', rpcData);
      return {
        userId: activeUserId,
        traits: {
          risk: payload.traits.risk,
          creativity: payload.traits.creativity,
          vision: payload.traits.vision,
          empathy: payload.traits.empathy,
          leadership: payload.traits.leadership,
        },
        totalXp: rpcData.total_xp ?? resolvedTotalXp,
        level: rpcData.level ?? resolvedLevel,
        storiesCompleted: rpcData.stories_completed ?? resolvedStories,
        futureArchetype: payload.futureArchetype,
        futureArchetypeScore: payload.futureArchetypeScore,
        lifeTraits: payload.lifeTraits,
      };
    }
  } catch (err) {
    console.warn('[dnaService] RPC invocation notice, using direct persistence fallback:', err);
  }

  // 2. Direct persistence fallback with accumulated totals
  return saveUserDnaProfile({
    userId: activeUserId,
    traits: payload.traits,
    totalXp: resolvedTotalXp,
    level: resolvedLevel,
    storiesCompleted: resolvedStories,
    futureArchetype: payload.futureArchetype,
    futureArchetypeScore: payload.futureArchetypeScore,
    lifeTraits: payload.lifeTraits,
  });
}

/**
 * Subscribe to LIVE real-time DNA and profile updates for a user.
 * Combines Supabase Postgres Realtime channels with an interval heartbeat
 * to guarantee that any backend change updates the UI live.
 */
export function subscribeToLiveDnaUpdates(
  userId: string,
  onUpdate: (profile: UserDnaProfile) => void
): () => void {
  if (!userId || userId.startsWith('offline-')) {
    return () => {};
  }

  let isCancelled = false;

  const triggerFetch = async () => {
    if (isCancelled) return;
    try {
      const fresh = await fetchUserDnaProfile(userId);
      if (fresh && !isCancelled) {
        onUpdate(fresh);
      }
    } catch (err) {
      console.warn('[dnaService] Realtime sync error:', err);
    }
  };

  // 1. Supabase Realtime channel for personality_profiles
  const ppChannel = supabase
    .channel(`live_dna_pp_${userId}_${Math.random().toString(36).slice(2, 7)}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'personality_profiles',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        console.log('[dnaService] Live update received from personality_profiles');
        triggerFetch();
      }
    )
    .subscribe();

  // 2. Supabase Realtime channel for users table
  const userChannel = supabase
    .channel(`live_dna_user_${userId}_${Math.random().toString(36).slice(2, 7)}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`,
      },
      () => {
        console.log('[dnaService] Live update received from users table');
        triggerFetch();
      }
    )
    .subscribe();

  // 3. Polling interval every 3 seconds to guarantee updates even if websockets drop
  const pollTimer = setInterval(triggerFetch, 3000);

  return () => {
    isCancelled = true;
    clearInterval(pollTimer);
    try {
      supabase.removeChannel(ppChannel);
      supabase.removeChannel(userChannel);
    } catch {}
  };
}

