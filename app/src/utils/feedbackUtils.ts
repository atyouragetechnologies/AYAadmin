/**
 * feedbackUtils.ts — Firebase Firestore replacement
 *
 * All Supabase inserts replaced with logAnalyticsEvent() from lib/firestore.ts.
 * Analytics collections in Firestore:
 *   /analytics/journey_events/events/{id}
 *   /analytics/journey_feedback/events/{id}
 *   /analytics/feature_usage/events/{id}
 *   /analytics/story_difficulty/events/{id}
 *   /analytics/search_logs/events/{id}
 *   /analytics/personality_wishlist/events/{id}
 *   /analytics/story_requests/events/{id}
 *
 * Note: Admin read queries (getGlobalSentimentDistribution, getUserAnalytics, etc.)
 * are now handled server-side. Client-side read functions return empty/null as these
 * are admin-only and will be replaced with Firebase Admin SDK or Cloud Functions.
 */
import { logAnalyticsEvent, getDocs, collection, db, query, where } from '../lib/firestore';
import { STORY_DATABASE } from '../data/scenarios';
import { generateLevels } from './levelGenerator';
import { resolvePersonalityAvatar } from './avatarUtils';

// ── UUID Helper ───────────────────────────────────────────────────────────────

function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ── Logging Functions ─────────────────────────────────────────────────────────

/**
 * Log a journey event (passive tracking).
 */
export async function logJourneyEvent(userId: string, journeyId: string, eventType: string, eventData: any = {}) {
    if (!journeyId) return null;
    try {
        logAnalyticsEvent('journey_events', {
            id: generateUUID(),
            userId: userId || null,
            journeyId,
            eventType,
            eventData,
        });

        // Update session preferences for recommendation engine
        if (eventType === 'journey_complete' || eventType === 'journey_start') {
            import('../services/recommendationEngine').then(({ updateUserTagPreference }) => {
                getDocs(query(collection(db, 'story_metadata'), where('__name__', '==', journeyId))).then((res) => {
                    if (!res.empty && userId) {
                        const tags: string[] = res.docs[0].data().tags ?? [];
                        const score = eventType === 'journey_complete' ? 1.0 : 0.2;
                        updateUserTagPreference(userId, tags, score);
                        import('../store/userStore').then(({ useUserStore }) => {
                            const store = useUserStore.getState();
                            tags.forEach((t: string) => store.updateSessionPreference(t, score));
                        });
                    }
                }).catch(() => {});
            }).catch(() => {});
        }

        return true;
    } catch (err) {
        console.error('Exception in logJourneyEvent:', err);
        return null;
    }
}

/**
 * Log sentiment feedback after journey completion.
 */
export async function logJourneyFeedback(
    userId: string,
    journeyId: string,
    sentimentScore: number,
    emoji: string,
    sessionDurationSeconds: number | null = null
) {
    if (sentimentScore < 0 || sentimentScore > 4) return null;
    try {
        logAnalyticsEvent('journey_feedback', {
            id: generateUUID(),
            userId: userId || null,
            journeyId,
            sentimentScore,
            emoji,
            sessionDurationSeconds,
        });
        return true;
    } catch (err) {
        console.error('Exception in logJourneyFeedback:', err);
        return null;
    }
}

/**
 * Log feature usage (passive).
 */
export async function logFeatureUsage(userId: string, featureName: string, sessionId: string | null = null) {
    try {
        logAnalyticsEvent('feature_usage', {
            id: generateUUID(),
            userId: userId || null,
            featureName,
            sessionId,
        });
        return true;
    } catch (err) {
        console.error('Exception in logFeatureUsage:', err);
        return null;
    }
}

/**
 * Log an unmatched search query (story request demand signal).
 */
export async function logUnmatchedSearch(userId: string, searchQuery: string) {
    if (!searchQuery?.trim()) return null;
    try {
        logAnalyticsEvent('search_logs', {
            id: generateUUID(),
            userId: userId || null,
            searchQuery: searchQuery.trim(),
        });
        return true;
    } catch (err) {
        console.error('Exception in logUnmatchedSearch:', err);
        return null;
    }
}

/**
 * Add/vote on personality wish list.
 */
export async function addToWishlist(userId: string, personalityName: string): Promise<{ success: boolean; error?: string }> {
    const cleanName = personalityName?.trim();
    if (!cleanName) return { success: false, error: 'Empty name' };
    try {
        logAnalyticsEvent('personality_wishlist', {
            id: generateUUID(),
            userId: userId || null,
            personalityName: cleanName,
            voteCount: 1,
        });

        // Notify via Cloudflare Worker (edge — zero cold start, no Supabase dependency)
        try {
            const { useUserStore } = await import('../store/userStore');
            const profile = useUserStore.getState().profile;
            const namePart = profile?.username || profile?.name || '';
            const agePart = profile?.age ? ` (${profile.age})` : '';
            const who = namePart ? `${namePart}${agePart}` : 'a guest user';

            // Worker URL: set VITE_WISHLIST_WORKER_URL in .env
            // e.g. https://aya-wishlist-notify.atyouragetechnologies.workers.dev
            const workerUrl = import.meta.env.VITE_WISHLIST_WORKER_URL
                || 'https://aya-wishlist-notify.atyouragetechnologies.workers.dev';

            fetch(workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personalityName: cleanName,
                    voteCount: 1,
                    who,
                    isNewRequest: true,
                }),
            }).catch(e => console.warn('[wishlist] Worker notify error:', e));
        } catch (e) {
            console.warn('[wishlist] Could not send notification:', e);
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: `Exception: ${err.message}` };
    }
}

/**
 * Log story difficulty rating (1-5).
 */
export async function logDifficultyFeedback(userId: string, journeyId: string, difficultyRating: number, part: number = 1) {
    if (difficultyRating < 1 || difficultyRating > 5) return null;
    try {
        logAnalyticsEvent('story_difficulty', {
            id: generateUUID(),
            userId: userId || null,
            journeyId,
            difficultyRating,
            part,
        });
        return true;
    } catch (err) {
        console.error('Exception in logDifficultyFeedback:', err);
        return null;
    }
}

/**
 * Save topic preference.
 */
export async function saveTopicPreference(userId: string, topic: string) {
    try {
        logAnalyticsEvent('feature_usage', {
            id: generateUUID(),
            userId: userId || null,
            featureName: `topic_preference_${topic}`,
        });
        return true;
    } catch (err) {
        console.error('Exception in saveTopicPreference:', err);
        return null;
    }
}

/**
 * Log survey response.
 */
export async function saveSurveyResponse(userId: string, questionKey: string, response: string | number) {
    try {
        logAnalyticsEvent('journey_feedback', {
            id: generateUUID(),
            userId: userId || null,
            journeyId: 'survey',
            eventType: 'survey_response',
            questionKey,
            responseText: typeof response === 'string' ? response : null,
            responseRating: typeof response === 'number' ? response : null,
        });
        return true;
    } catch (err) {
        console.error('Exception in saveSurveyResponse:', err);
        return null;
    }
}

// ── Admin Read Functions (Firebase Admin / server-side only) ──────────────────
// These were previously reading Supabase tables from the client.
// In Firebase, analytics reads are handled server-side (Admin SDK / Cloud Functions).
// Returning empty/null for now — wire up a Cloud Function endpoint if needed.

export async function getTopRequestedPersonalities(limitCount: number = 50): Promise<Array<{ personality_name: string; vote_count: number }>> {
    try {
        const { getDocs: fsGetDocs, collection: fsCol } = await import('firebase/firestore');
        const { db: fsDb } = await import('../lib/firestore');
        const snap = await fsGetDocs(fsCol(fsDb, 'analytics', 'personality_wishlist', 'events') as any);
        const tally = new Map<string, number>();
        snap.docs.forEach(d => {
            const data = d.data() as Record<string, any>;
            const name = ((data.personalityName as string) || '').trim();
            if (name) tally.set(name, (tally.get(name) ?? 0) + 1);
        });
        return Array.from(tally.entries())
            .map(([personality_name, vote_count]) => ({ personality_name, vote_count }))
            .sort((a, b) => b.vote_count - a.vote_count)
            .slice(0, limitCount);
    } catch (err) {
        console.warn('[feedbackUtils] getTopRequestedPersonalities Firestore error:', err);
        return [];
    }
}

export async function getGlobalSentimentDistribution() {
    console.warn('[feedbackUtils] getGlobalSentimentDistribution: use Firebase Admin SDK / Cloud Function for reads.');
    return null;
}

export async function getGlobalDifficultyStats() {
    console.warn('[feedbackUtils] getGlobalDifficultyStats: use Firebase Admin SDK / Cloud Function for reads.');
    return null;
}

export async function getFeatureUsageStats() {
    console.warn('[feedbackUtils] getFeatureUsageStats: use Firebase Admin SDK / Cloud Function for reads.');
    return [];
}

export async function getStoryAnalytics(_journeyId: string) {
    console.warn('[feedbackUtils] getStoryAnalytics: use Firebase Admin SDK / Cloud Function for reads.');
    return null;
}

export async function getUserAnalytics(_userQuery: string) {
    console.warn('[feedbackUtils] getUserAnalytics: use Firebase Admin SDK / Cloud Function for reads.');
    return null;
}

export async function getAllJourneyIds(): Promise<string[]> {
    console.warn('[feedbackUtils] getAllJourneyIds: use Firebase Admin SDK / Cloud Function for reads.');
    return [];
}

// ── Local Helpers (no backend needed) ────────────────────────────────────────

export function getStoryInfo(id: string) {
    if (!id) return { title: 'Unknown Story', personality: 'Unknown', age: null as number | null, avatar: '' };
    if (id === 'onboarding_quiz' || id.startsWith('onboarding')) {
        return {
            title: 'Onboarding Mindset Assessment',
            personality: 'Self Discovery Quiz',
            age: null,
            avatar: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_business.webp'
        };
    }
    const all = generateLevels(18);
    const lvl = all.find(l => (l.scenarioId || l.id) === id || l.id === id);
    if (lvl) {
        return {
            title: lvl.title || id,
            personality: lvl.personality || lvl.archetype || 'Public Figure',
            age: lvl.age || null,
            avatar: resolvePersonalityAvatar(lvl.personality || lvl.archetype || '')
        };
    }
    const parts = id.split('_');
    const ageIdx = parts.indexOf('age');
    const age = ageIdx !== -1 && parts[ageIdx + 1] ? parseInt(parts[ageIdx + 1], 10) : null;
    const name = parts.length > 3 ? parts[3].charAt(0).toUpperCase() + parts[3].slice(1) : id;
    return { title: id, personality: name, age, avatar: resolvePersonalityAvatar(name) };
}

export function getFrameDetails(journeyId: string, frameId: string) {
    const dbStory = STORY_DATABASE[journeyId];
    if (dbStory?.frames) {
        const frame = dbStory.frames.find((f: any) => f.id === frameId);
        if (frame) {
            return {
                prompt: frame.text || '',
                speaker: frame.speaker || '',
                choicesMap: (frame.choices || []).reduce((acc: any, c: any) => {
                    acc[c.text] = { score: c.score, feedbackTitle: c.feedbackTitle || c.feedbackText };
                    return acc;
                }, {})
            };
        }
    }
    return { prompt: '', speaker: '', choicesMap: {} };
}

export default {
    logJourneyEvent,
    logJourneyFeedback,
    logFeatureUsage,
    logUnmatchedSearch,
    addToWishlist,
    logDifficultyFeedback,
    saveTopicPreference,
    saveSurveyResponse,
    getTopRequestedPersonalities,
    getGlobalSentimentDistribution,
    getGlobalDifficultyStats,
    getFeatureUsageStats,
    getStoryAnalytics,
    getUserAnalytics,
    getAllJourneyIds,
    getStoryInfo,
    getFrameDetails
};
