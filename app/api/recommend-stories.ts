// @ts-nocheck
/**
 * api/recommend-stories.ts
 *
 * AYA Recommendation Engine v2 — Vercel Serverless Function
 *
 * PURPOSE:
 * - Server-side story recommendation scoring (business logic never in UI)
 * - Explainable, deterministic, weighted scoring (no ML/collaborative filtering)
 * - DNA-aware: uses both trait values AND self-view vs behavior gaps
 * - Three recommendation modes: SUPPORT, CHALLENGE, CONTINUE
 * - Logs every decision to recommendation_decisions for analytics
 * - Premium gating enforced server-side (client state not authoritative for billing)
 * - Graceful fallback: if semantic search fails, structured matching still works
 * - Crisis detection runs server-side as authoritative check
 *
 * SCORING WEIGHTS (from src/config/recommendationConfig.ts):
 * - 30% situation/problem relevance
 * - 15% emotional relevance
 * - 15% DNA growth-gap relevance (CHALLENGE mode)
 * - 10% age/life-stage relevance
 * - 10% past behavioral response (tag preferences)
 * - 5%  idol affinity
 * - 5%  difficulty fit
 * - 5%  novelty/diversity
 * - 5%  semantic similarity (pgvector, optional)
 *
 * API CONTRACT (stable — ML/advanced ranking can be added later without breaking this):
 * POST /api/recommend-stories
 * Body: RecommendationRequest
 * Returns: RecommendationResponse
 *
 * Phase 2: Check-in + Recommendation Engine
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ─── Types (inline to avoid module resolution issues in Vercel) ───────────────

interface DnaTraits {
  risk: number;
  creativity: number;
  vision: number;
  empathy: number;
  leadership: number;
}

interface CheckInData {
  situation_tags?: string[];
  problem_tags?: string[];
  emotional_tags?: string[];
  intent_tags?: string[];
  free_text?: string;
  intensity?: number;
}

interface RecommendationRequest {
  user_id: string;
  dna_traits: DnaTraits;
  onboarding_scores?: DnaTraits;
  checkin_data?: CheckInData;
  session_preferences?: Record<string, number>;
  completed_story_ids?: string[];
  age?: number;
  access_tier?: string;
  limit?: number;
}

interface ScoredStory {
  story_id: string;
  total_score: number;
  component_scores: Record<string, number>;
  recommendation_mode: string;
  explanation: { primary: string; traits: string[]; mode: string };
  requires_upgrade: boolean;
  premium_tier?: string;
}

interface RecommendationResponse {
  stories: ScoredStory[];
  method: 'structured' | 'semantic' | 'hybrid';
  decision_id?: string;
  generated_at: string;
  is_cold_start: boolean;
}

// ─── Recommendation Weights (mirrored from config — can be pulled from DB later) ─

const WEIGHTS = {
  situation_relevance: 0.30,
  emotional_relevance: 0.15,
  dna_growth_gap:      0.15,
  age_life_stage:      0.10,
  past_behavior:       0.10,
  idol_affinity:       0.05,
  difficulty_fit:      0.05,
  novelty_diversity:   0.05,
  semantic_similarity: 0.05,
};

const CHALLENGE_CONFIG = {
  min_gap_for_challenge: 15,
  challenge_boost_multiplier: 1.4,
  challenge_mix_ratio: 0.25,
};

const COLD_START_THRESHOLD = 1;
const COMPLETION_PENALTY = 0.5;
const SEMANTIC_MIN_SIMILARITY = 0.65;

// ─── Crisis Detection (server-side authoritative check) ───────────────────────

const HIGH_RISK_PATTERNS = [
  'want to die', 'want to kill myself', 'kill myself', 'end my life',
  'end it all', 'not worth living', "don't want to live", 'suicidal',
  'suicide', 'cut myself', 'hurt myself', 'self harm', 'self-harm',
  'no reason to live', 'better off dead', 'nobody would miss me',
];

function detectCrisis(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase().trim();
  return HIGH_RISK_PATTERNS.some(p => normalized.includes(p));
}

// ─── Scoring Helpers ─────────────────────────────────────────────────────────

/**
 * Score overlap between two tag arrays.
 * Returns 0–1 based on intersection / union (Jaccard-like).
 */
function tagOverlapScore(userTags: string[], storyTags: string[]): number {
  if (!userTags?.length || !storyTags?.length) return 0;
  const userSet = new Set(userTags);
  const storySet = new Set(storyTags);
  let matches = 0;
  for (const tag of storySet) {
    if (userSet.has(tag)) matches++;
  }
  // Normalize: how much of the user's intent is covered by this story
  return Math.min(1, matches / Math.min(userTags.length, storyTags.length));
}

/**
 * Calculate the DNA growth-gap score.
 * High score = story addresses a meaningful gap between self-view (onboarding)
 * and actual behavior (gameplay scores).
 */
function dnaGrowthGapScore(
  dnaTraits: DnaTraits,
  onboardingScores: DnaTraits | undefined,
  storyDominantTrait: string | null,
  storyTraitAffinity: Record<string, number>,
  mode: string,
): number {
  if (!onboardingScores || !storyDominantTrait) return 0;

  const traitKeys: (keyof DnaTraits)[] = ['risk', 'creativity', 'vision', 'empathy', 'leadership'];
  
  // Find the trait with the largest gap
  let maxGapTrait: keyof DnaTraits = 'risk';
  let maxGap = 0;
  
  for (const trait of traitKeys) {
    const gap = Math.abs((dnaTraits[trait] ?? 50) - (onboardingScores[trait] ?? 50));
    if (gap > maxGap) {
      maxGap = gap;
      maxGapTrait = trait;
    }
  }

  if (maxGap < CHALLENGE_CONFIG.min_gap_for_challenge) return 0;

  // Does this story address the gap trait?
  const storyAffinityForGapTrait = storyTraitAffinity[maxGapTrait] ?? 0;
  const isGapTrait = storyDominantTrait === maxGapTrait;

  // Score: how much this story covers the gap
  const gapScore = (isGapTrait ? 0.7 : 0) + (storyAffinityForGapTrait * 0.3);
  
  // In CHALLENGE mode, apply boost
  return mode === 'challenge' ? gapScore * CHALLENGE_CONFIG.challenge_boost_multiplier : gapScore;
}

/**
 * Calculate age/life-stage fit.
 */
function ageStageScore(userAge: number | undefined, storyAgeMin: number, storyAgeMax: number): number {
  if (!userAge) return 0.5; // neutral if unknown
  if (userAge >= storyAgeMin && userAge <= storyAgeMax) return 1.0;
  // Proximity penalty: 1 point per year outside range
  const gap = Math.min(
    Math.abs(userAge - storyAgeMin),
    Math.abs(userAge - storyAgeMax),
  );
  return Math.max(0, 1 - (gap * 0.1));
}

/**
 * Calculate past behavior score from user_tag_preferences.
 */
function pastBehaviorScore(
  storyTags: string[],
  tagPrefsMap: Record<string, number>,
  sessionPrefs: Record<string, number>,
): number {
  if (!storyTags?.length) return 0;
  
  let score = 0;
  let maxPossible = 0;
  
  for (const tag of storyTags) {
    // Session prefs (recent) weighted 1.5x over long-term prefs
    const sessionScore = (sessionPrefs[tag] ?? 0) * 1.5;
    const longTermScore = tagPrefsMap[tag] ?? 0;
    score += Math.max(sessionScore, longTermScore);
    maxPossible += 1;
  }

  return maxPossible > 0 ? Math.min(1, score / maxPossible) : 0;
}

/**
 * Calculate difficulty fit.
 * User XP level roughly maps to preferred difficulty.
 */
function difficultyFitScore(storyDifficulty: number, userStoriesCompleted: number): number {
  // Map experience to preferred difficulty range
  let preferredDifficulty: number;
  if (userStoriesCompleted < 3) preferredDifficulty = 2;
  else if (userStoriesCompleted < 10) preferredDifficulty = 3;
  else if (userStoriesCompleted < 25) preferredDifficulty = 4;
  else preferredDifficulty = 4;

  const diff = Math.abs(storyDifficulty - preferredDifficulty);
  return Math.max(0, 1 - (diff * 0.25));
}

/**
 * Novelty score — penalize recently completed stories, reward diversity.
 */
function noveltyScore(storyId: string, completedIds: string[], allRecommendedThisSession: string[]): number {
  if (completedIds.includes(storyId)) return 1 - COMPLETION_PENALTY;
  if (allRecommendedThisSession.includes(storyId)) return 0.5; // Lower but not excluded
  return 1.0;
}

/**
 * Build an explainable "Why this story?" sentence from actual signals.
 * Never invents facts — uses only actual user signals + actual story metadata.
 */
function buildExplanation(
  story: any,
  checkinData: CheckInData | undefined,
  dnaTraits: DnaTraits,
  onboardingScores: DnaTraits | undefined,
  mode: string,
  componentScores: Record<string, number>,
): { primary: string; traits: string[]; mode: string } {
  const traitLabels: Record<string, string> = {
    risk: 'Risk tolerance', creativity: 'Creativity', 
    vision: 'Vision', empathy: 'Empathy', leadership: 'Leadership',
  };

  const traits: string[] = [];
  
  // Identify top contributing traits
  if (story.dominant_trait) {
    traits.push(story.dominant_trait);
  }
  if (story.trait_affinity) {
    const sortedTraits = Object.entries(story.trait_affinity as Record<string, number>)
      .filter(([, v]) => v > 0.5)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([k]) => k);
    sortedTraits.forEach(t => { if (!traits.includes(t)) traits.push(t); });
  }

  // Build sentence from actual signals
  let primary = '';

  if (mode === 'support' && checkinData?.situation_tags?.length) {
    const situation = checkinData.situation_tags[0].replace(/_/g, ' ');
    const traitLabel = traits[0] ? traitLabels[traits[0]] : 'your current focus';
    primary = `You're dealing with ${situation}. This story explores how someone navigated a similar moment — using ${traitLabel} as their anchor.`;
  } else if (mode === 'challenge' && onboardingScores && story.dominant_trait) {
    const trait = story.dominant_trait;
    const userOnboarding = (onboardingScores as any)[trait] ?? 50;
    const userGameplay = (dnaTraits as any)[trait] ?? 50;
    const delta = Math.round(Math.abs(userOnboarding - userGameplay));
    if (delta >= CHALLENGE_CONFIG.min_gap_for_challenge) {
      primary = `Your recent decisions show ${delta > 0 ? 'more' : 'less'} ${traitLabels[trait] || trait} than you might expect. This story sits right at that tension.`;
    } else {
      primary = `This story explores a ${traitLabels[trait] || trait} challenge that may push your thinking in a new direction.`;
    }
  } else if (mode === 'continue') {
    primary = `Based on your recent journey, this story continues exploring a theme you've been engaging with.`;
  } else {
    // Fallback — use story lesson if available
    const lesson = story.lesson_tags?.[0];
    primary = lesson 
      ? `This story explores ${lesson.replace(/_/g, ' ')} — a theme your recent decisions have touched on.`
      : `This story was selected based on your behavioral profile and recent activity.`;
  }

  // Use template if available (overrides generated text)
  if (story.why_this_story_template) {
    const situationText = checkinData?.situation_tags?.[0]?.replace(/_/g, ' ') || 'your current situation';
    const traitText = traits[0] ? traitLabels[traits[0]] : 'your key traits';
    primary = story.why_this_story_template
      .replace('{user_problem}', situationText)
      .replace('{trait}', traitText)
      .replace('{idol_name}', story.idol_name || 'this figure')
      .replace('{resolution}', story.resolution_archetype || 'their own path');
  }

  return { primary, traits, mode };
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = (req.headers.origin as string) || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!,
  );

  try {
    const body: RecommendationRequest = req.body;
    const {
      user_id,
      dna_traits,
      onboarding_scores,
      checkin_data,
      session_preferences = {},
      completed_story_ids = [],
      age,
      access_tier = 'free',
      limit = 8,
    } = body;

    if (!user_id || !dna_traits) {
      return res.status(400).json({ error: 'user_id and dna_traits are required' });
    }

    // ── Server-side crisis check (authoritative) ─────────────────────────────
    const checkinText = [
      checkin_data?.free_text ?? '',
      ...(checkin_data?.situation_tags ?? []),
      ...(checkin_data?.emotional_tags ?? []),
    ].join(' ');
    
    if (detectCrisis(checkinText)) {
      // Return crisis response — do NOT surface story recommendations
      return res.status(200).json({
        stories: [],
        method: 'structured',
        is_crisis: true,
        generated_at: new Date().toISOString(),
      });
    }

    // ── Fetch candidate stories ───────────────────────────────────────────────
    const { data: allMetadata } = await supabase
      .from('story_metadata')
      .select('*');

    const storyPool: any[] = allMetadata ?? [];

    // If no metadata authored yet → cold start (fall back to tag-based)
    const isColdStart = storyPool.length === 0;

    // ── Fetch supporting data ─────────────────────────────────────────────────
    const [tagPrefsResult, userResult] = await Promise.all([
      supabase
        .from('user_tag_preferences')
        .select('tag_name, score')
        .eq('user_id', user_id)
        .order('score', { ascending: false })
        .limit(20),
      supabase
        .from('users')
        .select('stories_completed, total_xp, access_type')
        .eq('id', user_id)
        .maybeSingle(),
    ]);

    const tagPrefsMap: Record<string, number> = (tagPrefsResult.data ?? []).reduce(
      (acc: Record<string, number>, row: any) => { acc[row.tag_name] = row.score; return acc; },
      {},
    );

    const userStoriesCompleted = userResult.data?.stories_completed ?? 0;
    const effectiveAccessTier = userResult.data?.access_type ?? access_tier;
    const isAyaPlus = ['aya_plus', 'jee15', 'neet15', 'upsc'].includes(effectiveAccessTier);

    // ── Semantic search (optional, graceful fallback) ─────────────────────────
    let semanticScores: Record<string, number> = {};
    let method: 'structured' | 'semantic' | 'hybrid' = 'structured';

    // Only attempt if we have a semantic description to embed
    // (pgvector embeddings are populated separately — not required for v1)
    // In Phase 2 this is a stub; semantic search activates when embeddings exist
    // and FEATURE_FLAGS.semantic_search = true (checked client-side before calling)

    // ── Score each story ──────────────────────────────────────────────────────
    const recommendedThisSession: string[] = [];
    const checkinSituationTags = [
      ...(checkin_data?.situation_tags ?? []),
      ...(checkin_data?.problem_tags ?? []),
    ];
    const checkinEmotionalTags = checkin_data?.emotional_tags ?? [];

    const userAgeForScoring = age ?? 18;

    // Determine recommendation modes
    // SUPPORT: primary mode (user has checked in with a situation)
    // CHALLENGE: if there's a meaningful DNA gap
    // CONTINUE: for stories that match past engagement themes
    const dnaGapExists = onboarding_scores 
      ? Object.keys(dna_traits).some(k => {
          const gap = Math.abs((dna_traits as any)[k] - ((onboarding_scores as any)[k] ?? 50));
          return gap >= CHALLENGE_CONFIG.min_gap_for_challenge;
        })
      : false;

    const scoredStories: ScoredStory[] = storyPool.map((story: any) => {
      const storyTags = [
        ...(story.situation_tags ?? []),
        ...(story.problem_tags ?? []),
        ...(story.lesson_tags ?? []),
      ];

      // Determine mode for this story
      let mode = 'support';
      if (dnaGapExists && story.best_for_mode === 'challenge') mode = 'challenge';
      else if (userStoriesCompleted > 0 && story.best_for_mode === 'continue') mode = 'continue';

      // Calculate component scores
      const components = {
        situation_relevance: tagOverlapScore(checkinSituationTags, [
          ...(story.situation_tags ?? []),
          ...(story.problem_tags ?? []),
          ...(story.intent_tags ?? []),
        ]),
        emotional_relevance: tagOverlapScore(checkinEmotionalTags, story.emotional_tags ?? []),
        dna_growth_gap: dnaGrowthGapScore(
          dna_traits, onboarding_scores, story.dominant_trait, story.trait_affinity ?? {}, mode,
        ),
        age_life_stage: ageStageScore(userAgeForScoring, story.age_min ?? 13, story.age_max ?? 30),
        past_behavior: pastBehaviorScore(storyTags, tagPrefsMap, session_preferences),
        idol_affinity: 0, // Phase 2: stub; idol matching uses existing PersonalityAnalysis
        difficulty_fit: difficultyFitScore(story.difficulty ?? 3, userStoriesCompleted),
        novelty_diversity: noveltyScore(story.story_id, completed_story_ids, recommendedThisSession),
        semantic_similarity: semanticScores[story.story_id] ?? 0,
      };

      // Weighted total
      const total = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => {
        return sum + (components[key as keyof typeof components] ?? 0) * weight;
      }, 0);

      const explanation = buildExplanation(
        story, checkin_data, dna_traits, onboarding_scores, mode, components,
      );

      const requiresUpgrade = story.is_premium && !isAyaPlus;

      return {
        story_id: story.story_id,
        total_score: Math.round(total * 1000) / 1000,
        component_scores: components,
        recommendation_mode: mode,
        explanation,
        requires_upgrade: requiresUpgrade,
        premium_tier: story.premium_tier ?? undefined,
      };
    });

    // ── Sort and select ───────────────────────────────────────────────────────
    // Mix CHALLENGE stories in according to challenge_mix_ratio
    const challengeStories = scoredStories
      .filter(s => s.recommendation_mode === 'challenge')
      .sort((a, b) => b.total_score - a.total_score);

    const otherStories = scoredStories
      .filter(s => s.recommendation_mode !== 'challenge')
      .sort((a, b) => b.total_score - a.total_score);

    const challengeCount = Math.round(limit * CHALLENGE_CONFIG.challenge_mix_ratio);
    const otherCount = limit - challengeCount;

    const finalStories = [
      ...otherStories.slice(0, otherCount),
      ...challengeStories.slice(0, challengeCount),
    ].sort((a, b) => b.total_score - a.total_score).slice(0, limit);

    // ── Log decision to recommendation_decisions ──────────────────────────────
    let decisionId: string | undefined;
    try {
      const { data: decisionRow } = await supabase
        .from('recommendation_decisions')
        .insert({
          user_id: user_id,
          recommended_story_ids: finalStories.map(s => s.story_id),
          recommendation_mode: dnaGapExists ? 'mixed' : 'support',
          scoring_breakdown: Object.fromEntries(
            finalStories.map(s => [s.story_id, {
              total_score: s.total_score,
              component_scores: s.component_scores,
              explanation: s.explanation,
            }])
          ),
          method,
          dna_traits_snapshot: dna_traits,
          session_prefs_snapshot: session_preferences,
          checkin_snapshot: checkin_data ?? {},
        })
        .select('id')
        .single();

      decisionId = decisionRow?.id;
    } catch (logErr) {
      console.warn('[recommend-stories] Failed to log decision (non-critical):', logErr);
    }

    const response: RecommendationResponse = {
      stories: finalStories,
      method,
      decision_id: decisionId,
      generated_at: new Date().toISOString(),
      is_cold_start: isColdStart,
    };

    return res.status(200).json(response);

  } catch (err: any) {
    console.error('[recommend-stories] Error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
}
