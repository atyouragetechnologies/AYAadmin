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

import { supabase } from '../utils/supabase';
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

export async function updateUserTagPreference(userId: string, tags: string[], scoreChange: number) {
    if (!userId || userId.startsWith('offline-')) return;
    
    for (const tag of tags) {
        const { data } = await supabase
            .from('user_tag_preferences')
            .select('score, interaction_count')
            .eq('user_id', userId)
            .eq('tag_name', tag)
            .single();
            
        let newScore = scoreChange;
        let newCount = 1;
        
        if (data) {
            newCount = (data.interaction_count || 0) + 1;
            newScore = (data.score * 0.9) + scoreChange; 
        }

        await supabase.from('user_tag_preferences').upsert({
            user_id: userId,
            tag_name: tag,
            score: newScore,
            interaction_count: newCount,
            last_interaction: new Date().toISOString()
        }, { onConflict: 'user_id,tag_name' });
    }
}

// ─── Legacy: getRecommendations ───────────────────────────────────────────────
// Tag-based fallback. Used by ForYouCarousel until Phase 2 v2 engine is active.
// Phase 2: ForYouCarousel will call getRecommendationsV2() with this as fallback.

export async function getRecommendations(userId: string, sessionTags: Record<string, number> = {}, limit: number = 5): Promise<string[]> {
    const { data: tagPrefs } = await supabase
        .from('user_tag_preferences')
        .select('tag_name, score')
        .eq('user_id', userId)
        .order('score', { ascending: false })
        .limit(10);
        
    const userPrefMap = (tagPrefs || []).reduce((acc: any, t: any) => {
        acc[t.tag_name] = t.score;
        return acc;
    }, {});

    const combinedPrefs = { ...userPrefMap };
    for (const [tag, score] of Object.entries(sessionTags)) {
        combinedPrefs[tag] = (combinedPrefs[tag] || 0) + (score * 1.5);
    }

    const topTags = Object.keys(combinedPrefs).slice(0, 5);
    let candidateStoryIds = new Set<string>();
    
    if (topTags.length > 0) {
        const { data: tagMatches } = await supabase
            .from('story_tags')
            .select('story_id')
            .in('tag_name', topTags);
            
        if (tagMatches) {
            tagMatches.forEach((m: any) => candidateStoryIds.add(m.story_id));
        }
    }

    const candidates = Array.from(candidateStoryIds);
    if (candidates.length === 0) return [];
    return candidates.slice(0, limit);
}

// ─── NEW Phase 1: Search Analytics Logging ────────────────────────────────────

/**
 * Log every search query to search_analytics table.
 * Called by SearchBar on every search (Phase 4 makes this active via feature flag).
 * Safe to call regardless — fails silently to never block the UI.
 */
export async function logSearchQuery(entry: SearchAnalyticsEntry & { user_id?: string }): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('search_analytics')
            .insert({
                user_id: entry.user_id || null,
                query: entry.query,
                query_normalized: entry.query.toLowerCase().trim(),
                results_count: entry.results_count,
                matched_story_ids: entry.matched_story_ids,
                clicked_story_id: entry.clicked_story_id || null,
                is_zero_result: entry.is_zero_result,
                is_low_confidence: entry.is_low_confidence,
                session_id: entry.session_id || null,
                platform: 'web',
            })
            .select('id')
            .single();

        if (error) {
            console.warn('[RecommendationEngine] logSearchQuery failed (non-critical):', error.message);
            return null;
        }
        return data?.id ?? null;
    } catch {
        return null; // Never block the UI
    }
}

/**
 * Update a search_analytics record when the user clicks a result.
 * Converts a zero-result or low-confidence event into a successful one.
 */
export async function logSearchClick(searchId: string, clickedStoryId: string): Promise<void> {
    try {
        await supabase
            .from('search_analytics')
            .update({
                clicked_story_id: clickedStoryId,
                is_low_confidence: false,
            })
            .eq('id', searchId);
    } catch {
        // Non-critical, fail silently
    }
}

// ─── NEW Phase 1: Recommendation Click Tracking ───────────────────────────────

/**
 * Log when a user clicks a recommended story.
 * Updates the recommendation_decisions row with the clicked story.
 */
export async function logRecommendationClick(decisionId: string, clickedStoryId: string): Promise<void> {
    try {
        await supabase
            .from('recommendation_decisions')
            .update({
                clicked_story_id: clickedStoryId,
                clicked_at: new Date().toISOString(),
            })
            .eq('id', decisionId);
    } catch {
        // Non-critical, fail silently
    }
}

// ─── NEW Phase 1: Story Metadata Fetching ─────────────────────────────────────

/**
 * Fetch story_metadata for a single story ID.
 * Returns null if not yet authored (graceful fallback).
 */
export async function fetchStoryMetadata(storyId: string): Promise<StoryMetadata | null> {
    try {
        const { data, error } = await supabase
            .from('story_metadata')
            .select('*')
            .eq('story_id', storyId)
            .maybeSingle();

        if (error || !data) return null;
        return data as StoryMetadata;
    } catch {
        return null;
    }
}

/**
 * Fetch story_metadata for a set of story IDs.
 * Returns a map of story_id → metadata. Missing entries = not yet authored.
 * Used by the Phase 2 recommendation scoring engine.
 */
export async function getStoryMetadataMap(storyIds: string[]): Promise<Record<string, StoryMetadata>> {
    if (storyIds.length === 0) return {};
    
    try {
        const { data, error } = await supabase
            .from('story_metadata')
            .select('*')
            .in('story_id', storyIds);

        if (error || !data) return {};

        return data.reduce((acc: Record<string, StoryMetadata>, row: any) => {
            acc[row.story_id] = row as StoryMetadata;
            return acc;
        }, {});
    } catch {
        return {};
    }
}

/**
 * Fetch all authored story IDs (for building candidate pool).
 * Ordered by created_at desc so newest stories are tried first.
 */
export async function getAllAuthoredStoryIds(): Promise<string[]> {
    try {
        const { data } = await supabase
            .from('story_metadata')
            .select('story_id')
            .order('created_at', { ascending: false });

        return (data || []).map((r: any) => r.story_id);
    } catch {
        return [];
    }
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

