/**
 * dnaService.ts — Firebase Firestore replacement
 *
 * All Supabase calls replaced with Firestore SDK via lib/firestore.ts.
 * Real-time updates via Firestore onSnapshot instead of Supabase Realtime channels.
 */
import { auth } from '../lib/firebase';
import {
    getUserProfile,
    getPersonalityProfile,
    upsertPersonalityProfile,
    upsertUserProfile,
    saveStoryCompletionAtomic,
    onUserProfileChange,
    personalityDoc,
    onSnapshot,
} from '../lib/firestore';
import { useUserStore } from '../store/userStore';
import { logAnalyticsEvent } from '../lib/firestore';
import { calculateLifeTraits, matchFutureArchetype } from '../utils/futureSelfMatch';

export interface UserDnaTraits {
    risk: number;
    creativity: number;
    vision: number;
    empathy: number;
    leadership: number;
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

// ── Identity ──────────────────────────────────────────────────────────────────

export async function resolveActiveUserId(explicitId?: string): Promise<string | null> {
    if (explicitId && !explicitId.startsWith('offline-')) return explicitId;

    // Firebase Auth first
    const fbUser = auth.currentUser;
    if (fbUser) return fbUser.uid;

    // Zustand store fallback
    const storeProfile = useUserStore.getState().profile;
    if (storeProfile?.id && !storeProfile.id.startsWith('offline-')) return storeProfile.id;

    // Session storage fallback
    try {
        const sessionData = localStorage.getItem('aya_session');
        if (sessionData) {
            const parsed = JSON.parse(sessionData);
            if (parsed?.userId && !parsed.userId.startsWith('offline-')) return parsed.userId;
        }
    } catch {}

    return storeProfile?.id || null;
}

// ── DNA Fetch ─────────────────────────────────────────────────────────────────

export async function fetchUserDnaProfile(overrideUserId?: string): Promise<UserDnaProfile | null> {
    const activeUserId = await resolveActiveUserId(overrideUserId);
    if (!activeUserId) return null;

    console.log('[dnaService] Fetching DNA profile from Firestore for:', activeUserId);

    const [ppData, userData] = await Promise.all([
        getPersonalityProfile(activeUserId).catch(() => null),
        getUserProfile(activeUserId).catch(() => null),
    ]);

    if (!ppData && !userData) {
        const storeProfile = useUserStore.getState().profile;
        if (storeProfile?.traits) {
            console.log('[dnaService] Initializing Firestore DNA profile from local store');
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

    const fallbackGameplay = (userData as any)?.gameplayScores || {};
    const fallbackOnboarding = (userData as any)?.onboardingScores || {};

    const traits: UserDnaTraits = {
        risk: (ppData as any)?.traitRiskTaker ?? fallbackGameplay.risk ?? fallbackOnboarding.risk ?? 50,
        creativity: (ppData as any)?.traitCreative ?? fallbackGameplay.creativity ?? fallbackOnboarding.creativity ?? 50,
        vision: (ppData as any)?.traitAnalytical ?? fallbackGameplay.vision ?? fallbackOnboarding.vision ?? 50,
        empathy: (ppData as any)?.traitSocial ?? fallbackGameplay.empathy ?? fallbackOnboarding.empathy ?? 50,
        leadership: (ppData as any)?.traitAmbitious ?? fallbackGameplay.leadership ?? fallbackOnboarding.leadership ?? 50,
        discipline: (ppData as any)?.lifeDiscipline ?? 50,
        resilience: (ppData as any)?.lifeResilience ?? 50,
    };

    const rawLifeTraits: Record<string, number> = {
        resilience: (ppData as any)?.lifeResilience ?? 0,
        discipline: (ppData as any)?.lifeDiscipline ?? 0,
        courage: (ppData as any)?.lifeCourage ?? 0,
        creativity: (ppData as any)?.lifeCreativity ?? 0,
        emotional_control: (ppData as any)?.lifeEmotionalControl ?? 0,
        leadership: (ppData as any)?.lifeLeadership ?? 0,
        risk_intelligence: (ppData as any)?.lifeRiskIntelligence ?? 0,
        consistency: (ppData as any)?.lifeConsistency ?? 0,
    };

    const hasNonFlatLifeTraits = Object.values(rawLifeTraits).some(v => v > 0 && v !== 50);
    const resolvedLifeTraits = hasNonFlatLifeTraits
        ? rawLifeTraits
        : calculateLifeTraits(traits as any, (userData as any)?.currentStreak || 0);

    const matchedArchetype = (ppData as any)?.futureArchetype
        ? { archetype: { name: (ppData as any).futureArchetype }, score: (ppData as any).futureArchetypeScore || 85 }
        : matchFutureArchetype(resolvedLifeTraits as any);

    const resolvedTotalXp = Math.max((ppData as any)?.totalXp ?? 0, (userData as any)?.totalXp ?? 0);
    const resolvedLevel = Math.max((ppData as any)?.level ?? 1, (userData as any)?.level ?? 1);
    const resolvedStories = Math.max((ppData as any)?.storiesCompleted ?? 0, (userData as any)?.storiesCompleted ?? 0);

    return {
        userId: activeUserId,
        traits,
        totalXp: resolvedTotalXp,
        level: resolvedLevel,
        storiesCompleted: resolvedStories,
        futureArchetype: (ppData as any)?.futureArchetype || matchedArchetype.archetype.name,
        futureArchetypeScore: (ppData as any)?.futureArchetypeScore || matchedArchetype.score,
        lifeTraits: resolvedLifeTraits as Record<string, number>,
        lastUpdated: (ppData as any)?.updatedAt?.toDate?.()?.toISOString() ?? undefined,
    };
}

// ── DNA Save ──────────────────────────────────────────────────────────────────

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
    if (!activeUserId) throw new Error('No user ID found to save DNA profile.');

    await upsertPersonalityProfile(activeUserId, {
        traitRiskTaker: Math.round(payload.traits.risk || 50),
        traitCreative: Math.round(payload.traits.creativity || 50),
        traitAnalytical: Math.round(payload.traits.vision || 50),
        traitSocial: Math.round(payload.traits.empathy || 50),
        traitAmbitious: Math.round(payload.traits.leadership || 50),
        futureArchetype: payload.futureArchetype || null,
        futureArchetypeScore: payload.futureArchetypeScore || null,
        totalXp: payload.totalXp ?? 0,
        level: payload.level ?? 1,
        storiesCompleted: payload.storiesCompleted ?? 0,
        lifeResilience: payload.lifeTraits?.resilience ?? 50,
        lifeDiscipline: payload.lifeTraits?.discipline ?? 50,
        lifeCourage: payload.lifeTraits?.courage ?? 50,
        lifeCreativity: payload.lifeTraits?.creativity ?? 50,
        lifeEmotionalControl: payload.lifeTraits?.emotional_control ?? 50,
        lifeLeadership: payload.lifeTraits?.leadership ?? 50,
        lifeRiskIntelligence: payload.lifeTraits?.risk_intelligence ?? 50,
        lifeConsistency: payload.lifeTraits?.consistency ?? 50,
    });

    await upsertUserProfile(activeUserId, {
        totalXp: payload.totalXp,
        level: payload.level,
        storiesCompleted: payload.storiesCompleted,
        gameplayScores: {
            risk: payload.traits.risk,
            creativity: payload.traits.creativity,
            vision: payload.traits.vision,
            empathy: payload.traits.empathy,
            leadership: payload.traits.leadership,
        },
    });

    // Analytics telemetry
    logAnalyticsEvent('journey_events', {
        userId: activeUserId,
        journeyId: 'dna_module',
        eventType: 'dna_sync',
        eventData: {
            traits: payload.traits,
            totalXp: payload.totalXp,
            level: payload.level,
            storiesCompleted: payload.storiesCompleted,
            futureArchetype: payload.futureArchetype,
            lifeTraits: payload.lifeTraits,
            syncedAt: new Date().toISOString(),
        },
    });

    // Sync Zustand store
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
        lastUpdated: new Date().toISOString(),
    };
}

// ── Story Completion ──────────────────────────────────────────────────────────

export async function saveStoryCompletionDna(payload: SaveStoryCompletionPayload): Promise<UserDnaProfile> {
    const activeUserId = await resolveActiveUserId();
    const currentStore = useUserStore.getState().profile;

    const resolvedTotalXp = (currentStore?.total_xp || 0) + payload.sessionXp;
    const resolvedStories = (currentStore?.stories_completed || 0) + 1;
    const resolvedLevel = Math.max(currentStore?.level || 1, Math.floor(resolvedTotalXp / 150) + 1);

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
            lastUpdated: new Date().toISOString(),
        };
    }

    try {
        // Use Firestore atomic transaction (replaces Supabase RPC save_story_completion_dna)
        const result = await saveStoryCompletionAtomic(activeUserId, {
            levelId: String(payload.levelId),
            selectedPersonality: String(payload.selectedPersonality),
            matchScore: payload.matchScore,
            stars: payload.stars,
            sessionXp: payload.sessionXp,
            traits: {
                traitRiskTaker: Math.round(payload.traits.risk),
                traitCreative: Math.round(payload.traits.creativity),
                traitAnalytical: Math.round(payload.traits.vision),
                traitSocial: Math.round(payload.traits.empathy),
                traitAmbitious: Math.round(payload.traits.leadership),
            },
            futureArchetype: payload.futureArchetype,
            futureArchetypeScore: payload.futureArchetypeScore,
            lifeTraits: payload.lifeTraits,
            gameplayScores: payload.gameplayScores,
            choicesLog: payload.choicesLog,
        });

        if (result?.success) {
            console.log('[dnaService] ✓ Story completion saved atomically via Firestore transaction');
            return {
                userId: activeUserId,
                traits: payload.traits,
                totalXp: result.totalXp ?? resolvedTotalXp,
                level: result.level ?? resolvedLevel,
                storiesCompleted: result.storiesCompleted ?? resolvedStories,
                futureArchetype: payload.futureArchetype,
                futureArchetypeScore: payload.futureArchetypeScore,
                lifeTraits: payload.lifeTraits,
            };
        }
    } catch (err) {
        console.warn('[dnaService] Atomic transaction failed, using direct save fallback:', err);
    }

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

// ── Real-time Updates (Firestore onSnapshot) ──────────────────────────────────

export function subscribeToLiveDnaUpdates(
    userId: string,
    onUpdate: (profile: UserDnaProfile) => void
): () => void {
    if (!userId || userId.startsWith('offline-')) return () => {};

    let isCancelled = false;

    const triggerFetch = async () => {
        if (isCancelled) return;
        try {
            const fresh = await fetchUserDnaProfile(userId);
            if (fresh && !isCancelled) onUpdate(fresh);
        } catch (err) {
            console.warn('[dnaService] Snapshot sync error:', err);
        }
    };

    // Firestore real-time listener on personality sub-document
    const unsubPersonality = onSnapshot(
        personalityDoc(userId),
        () => {
            console.log('[dnaService] Live update from Firestore personality doc');
            triggerFetch();
        },
        (err) => console.warn('[dnaService] Personality snapshot error:', err)
    );

    // Firestore real-time listener on user doc
    const unsubUser = onUserProfileChange(userId, () => {
        console.log('[dnaService] Live update from Firestore user doc');
        triggerFetch();
    });

    return () => {
        isCancelled = true;
        unsubPersonality();
        unsubUser();
    };
}
