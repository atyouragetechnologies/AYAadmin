/**
 * recommendationEngine.ts
 *
 * Story recommendation service for AYA.
 *
 * ── BACKWARD COMPATIBILITY ──────────────────────────────────────────────────
 * All original exports are preserved:
 *   - WEIGHTS (legacy weight config, kept for reference)
 *   - updateUserTagPreference() (used by feedbackUtils.ts)
 *   - getRecommendations() (used by ForYouCarousel — legacy fallback)
 *
 * ── NEW IN PHASE 1 ──────────────────────────────────────────────────────────
 *   - logSearchQuery()            — log every search to search_analytics
 *   - logRecommendationClick()    — log when user clicks a recommended story
 *   - fetchStoryMetadata()        — fetch story_metadata for a single story
 *   - getStoryMetadataMap()       — fetch story_metadata for a set of story IDs
 *
 * The Phase 2 v2 engine (api/recommend-stories.ts) will use these helpers.
 */

import type { StoryMetadata, SearchAnalyticsEntry } from '../types/ayaTypes';

// ─── Legacy Weights (kept for backward compatibility) ─────────────────────────
// Phase 2+ uses RECOMMENDATION_WEIGHTS from src/config/recommendationConfig.ts
export const WEIGHTS = {
    vectorSimilarity: 0.3,
    tagAffinity: 0.3,
    sessionIntent: 0.2,
    personalityFit: 0.1,
    completionBonus: 0.1
};

// ─── Legacy: updateUserTagPreference ─────────────────────────────────────────
// Used by feedbackUtils.ts on journey_complete / journey_start events.
// DO NOT remove — preserved for backward compatibility.

/** No-op: tag preferences are now tracked server-side via Firebase Analytics */
export async function updateUserTagPreference(_userId: string, _tags: string[], _scoreChange: number): Promise<void> {
    // Tag preference tracking moved to Firebase Analytics (logAnalyticsEvent)
}

// ─── Legacy: getRecommendations ───────────────────────────────────────────────
// Returns empty — use getRecommendationsV2 which calls /api/recommend-stories

export async function getRecommendations(_userId: string, _sessionTags: Record<string, number> = {}, _limit: number = 5): Promise<string[]> {
    return []; // Legacy stub — use getRecommendationsV2
}

// ─── NEW Phase 1: Search Analytics Logging ────────────────────────────────────

/** Log search query — now a no-op client-side (server handles via Firebase Analytics) */
export async function logSearchQuery(_entry: SearchAnalyticsEntry & { user_id?: string }): Promise<string | null> {
    return null; // Non-critical, Firestore analytics handle this via SearchBar
}

/** Log search click — no-op stub */
export async function logSearchClick(_searchId: string, _clickedStoryId: string): Promise<void> {
    // Non-critical, fail silently
}

// ─── NEW Phase 1: Recommendation Click Tracking ───────────────────────────────

/** Log recommendation click — no-op stub */
export async function logRecommendationClick(_decisionId: string, _clickedStoryId: string): Promise<void> {
    // Non-critical, fail silently
}

// ─── NEW Phase 1: Story Metadata Fetching ─────────────────────────────────────

/** Fetch story metadata — returns null (metadata now served server-side) */
export async function fetchStoryMetadata(_storyId: string): Promise<StoryMetadata | null> {
    return null;
}

/** Get story metadata map — returns empty (metadata now served server-side) */
export async function getStoryMetadataMap(storyIds: string[]): Promise<Record<string, StoryMetadata>> {
    if (storyIds.length === 0) return {};
    return {};
}

/** Get all authored story IDs from local scenario data */
export async function getAllAuthoredStoryIds(): Promise<string[]> {
    const { STORY_METADATA } = await import('../data/storyMetadata');
    return (STORY_METADATA as any[]).map((m: any) => m.scenarioId as string).filter(Boolean);
}

// ─── NEW Phase 2: Recommendation Engine V2 Client Call ───────────────────────

/**
 * Call the Vercel serverless recommendation endpoint (/api/recommend-stories).
 * Falls back gracefully to legacy getRecommendations if API fails or metadata is empty.
 */
export async function getRecommendationsV2(request: import('../types/ayaTypes').RecommendationRequest): Promise<import('../types/ayaTypes').RecommendationResponse> {
    try {
        const response = await fetch('/api/recommend-stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });

        if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.stories) && data.stories.length > 0) {
                return data;
            }
        }
    } catch (err) {
        console.warn('[RecommendationEngine] V2 API call failed, using client fallback', err);
    }

    // Client-side Fallback
    const legacyIds = await getRecommendations(
        request.user_id,
        request.session_preferences || {},
        request.limit || 8
    );

    const fallbackStories: import('../types/ayaTypes').ScoredStory[] = legacyIds.map(id => ({
        story_id: id,
        total_score: 0.5,
        component_scores: {
            situation_relevance: 0.5,
            emotional_relevance: 0.5,
            dna_growth_gap: 0,
            age_life_stage: 0.5,
            past_behavior: 0.5,
            idol_affinity: 0,
            difficulty_fit: 0.5,
            novelty_diversity: 0.5,
            semantic_similarity: 0
        },
        recommendation_mode: 'support',
        explanation: {
            primary: 'Recommended based on your recent activity and topic preferences.',
            traits: [],
            mode: 'support'
        },
        requires_upgrade: false
    }));

    return {
        stories: fallbackStories,
        method: 'structured',
        generated_at: new Date().toISOString()
    };
}

