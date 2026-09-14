/**
 * ayaTypes.ts
 *
 * Central type definitions for all new AYA Evolution systems.
 * Phase 1: Story/Data Foundation
 *
 * These types mirror the database schema from migration 020 and are the
 * single source of truth for the new recommendation, check-in, and insight
 * systems.
 *
 * IMPORTANT: Existing types from gameTypes.ts are NOT replaced.
 * Import from both files as needed.
 */

// ─── Story Metadata (13-dimension fingerprint) ────────────────────────────────

export interface StoryMetadata {
  id: string;
  story_id: string;

  // Dimensions 1-4: Situation/Problem/Emotion/Intent
  situation_tags: string[];
  problem_tags: string[];
  emotional_tags: string[];
  intent_tags: string[];

  // Dimension 5: Life stage
  life_stage_tags: string[];
  age_min: number;
  age_max: number;

  // Dimension 6: Dominant trait tension
  dominant_trait: DnaTrait | null;

  // Dimension 7: Supporting traits (trait name → 0.0–1.0 affinity weight)
  trait_affinity: Partial<Record<DnaTrait, number>>;

  // Dimension 8: Resolution archetype
  resolution_archetype: ResolutionArchetype | null;

  // Dimension 9: Lesson
  lesson_tags: string[];

  // Dimension 10: Difficulty (1–5)
  difficulty: 1 | 2 | 3 | 4 | 5;

  // Dimension 11: Relatability (1–5)
  relatability: 1 | 2 | 3 | 4 | 5;

  // Dimension 12: Historical context
  era: string | null;
  cultural_context: string | null;

  // Dimension 13: Semantic description + trigger phrases
  semantic_description: string | null;
  trigger_phrases: string[];

  // Recommendation mode
  best_for_mode: RecommendationMode;

  // Explainability
  why_this_story_template: string | null;

  // Premium
  is_premium: boolean;
  premium_tier: 'aya_plus' | 'report';

  created_at: string;
  updated_at: string;
}

// ─── Core Enums / Literal Types ───────────────────────────────────────────────

export type DnaTrait = 'risk' | 'creativity' | 'vision' | 'empathy' | 'leadership';

export type RecommendationMode = 'support' | 'challenge' | 'continue' | 'mixed';

export type ResolutionArchetype =
  | 'overcome'
  | 'adapt'
  | 'accept'
  | 'persist'
  | 'pivot'
  | 'connect'
  | 'create'
  | 'lead';

export type CrisisRiskLevel = 'none' | 'low' | 'medium' | 'high';

export type CurrentChapterLabel =
  | 'Explorer'
  | 'Builder'
  | 'Challenger'
  | 'Resilient'
  | 'Leader'
  | 'Visionary'
  | 'Seeker'
  | 'Creator';

export type AccessTier = 'free' | 'aya_plus' | 'jee15' | 'neet15' | 'upsc';

// ─── User Check-in ────────────────────────────────────────────────────────────

export interface CheckInData {
  situation_tags: string[];
  problem_tags: string[];
  emotional_tags: string[];
  intent_tags: string[];
  free_text?: string;
  intensity: 1 | 2 | 3 | 4 | 5;
}

export interface CheckInRecord extends CheckInData {
  id: string;
  user_id: string;
  crisis_risk_level: CrisisRiskLevel;
  is_crisis: boolean;
  session_id?: string;
  created_at: string;
}

// ─── Recommendation Engine ─────────────────────────────────────────────────────

export interface RecommendationWeights {
  situation_relevance: number;   // 0.30
  emotional_relevance: number;   // 0.15
  dna_growth_gap: number;        // 0.15
  age_life_stage: number;        // 0.10
  past_behavior: number;         // 0.10
  idol_affinity: number;         // 0.05
  difficulty_fit: number;        // 0.05
  novelty_diversity: number;     // 0.05
  semantic_similarity: number;   // 0.05
}

export interface ScoredStory {
  story_id: string;
  total_score: number;
  component_scores: {
    situation_relevance: number;
    emotional_relevance: number;
    dna_growth_gap: number;
    age_life_stage: number;
    past_behavior: number;
    idol_affinity: number;
    difficulty_fit: number;
    novelty_diversity: number;
    semantic_similarity: number;
  };
  recommendation_mode: RecommendationMode;
  explanation: RecommendationExplanation;
  requires_upgrade: boolean;
  premium_tier?: 'aya_plus' | 'report';
}

export interface RecommendationExplanation {
  /** Short, user-facing "Why this story?" sentence */
  primary: string;
  /** Trait(s) that drove the recommendation */
  traits: DnaTrait[];
  /** Mode that drove the recommendation */
  mode: RecommendationMode;
}

export interface RecommendationRequest {
  user_id: string;
  dna_traits: Record<DnaTrait, number>;
  onboarding_scores?: Record<DnaTrait, number>;
  checkin_data?: CheckInData;
  session_preferences?: Record<string, number>;
  completed_story_ids?: string[];
  age?: number;
  access_tier?: AccessTier;
  limit?: number;
}

export interface RecommendationResponse {
  stories: ScoredStory[];
  method: 'structured' | 'semantic' | 'hybrid';
  decision_id?: string;  // ID of the logged recommendation_decisions row
  generated_at: string;
}

// ─── Recommendation Decision Log ─────────────────────────────────────────────

export interface RecommendationDecisionLog {
  user_id?: string;
  checkin_id?: string;
  recommended_story_ids: string[];
  recommendation_mode: RecommendationMode;
  scoring_breakdown: Record<string, any>;
  method: 'structured' | 'semantic' | 'hybrid';
  dna_traits_snapshot: Record<string, number>;
  session_prefs_snapshot: Record<string, number>;
  checkin_snapshot: Record<string, any>;
}

// ─── Story Reflection (post-story deeper feedback) ────────────────────────────

export interface StoryReflection {
  story_id: string;
  reflection_text?: string;
  selected_chips?: string[];
  showed_surprise_insight?: boolean;
  surprise_trait?: DnaTrait;
  surprise_delta?: number;
  was_relevant?: boolean;
  did_help?: boolean;
  mood_before?: 1 | 2 | 3 | 4 | 5;
  mood_after?: 1 | 2 | 3 | 4 | 5;
}

// ─── Insight Service ──────────────────────────────────────────────────────────

export interface SurpriseInsight {
  showed: true;
  trait: DnaTrait;
  delta: number;
  direction: 'higher' | 'lower';
  /** User-facing curiosity-driven headline, never shaming */
  headline: string;
  /** Supporting detail */
  detail: string;
}

export interface CurrentChapter {
  label: CurrentChapterLabel;
  description: string;
  /** Color for UI rendering */
  color: string;
}

export interface EmergingYouInsight {
  trait: DnaTrait;
  direction: 'rising' | 'falling' | 'stable';
  delta: number;
  sessions_analyzed: number;
}

// ─── Weekly Recap ─────────────────────────────────────────────────────────────

export interface WeeklyRecapData {
  week_start: string;
  week_end: string;
  stories_played: number;
  stories_completed: number;
  lessons_explored: string[];
  trait_snapshot: Record<DnaTrait, number>;
  trait_deltas: Partial<Record<DnaTrait, number>>;
  current_chapter: CurrentChapterLabel;
  dominant_challenge?: string;
  emerging_pattern?: string;
  next_recommendation_id?: string;
  streak_at_recap: number;
  total_xp_earned: number;
}

// ─── Search Analytics ─────────────────────────────────────────────────────────

export interface SearchAnalyticsEntry {
  query: string;
  results_count: number;
  matched_story_ids: string[];
  clicked_story_id?: string;
  is_zero_result: boolean;
  is_low_confidence: boolean;
  session_id?: string;
}

// ─── Pricing (configurable, never hardcoded in UI components) ─────────────────

export interface AyaPricingConfig {
  monthly_price_inr: number;
  monthly_original_inr: number;
  three_month_price_inr: number;
  three_month_original_inr: number;
  annual_price_inr: number;
  annual_original_inr: number;
  report_price_min_inr: number;
  report_price_max_inr: number;
  currency: string;
  currency_symbol: string;
}

// ─── Feature Flags ────────────────────────────────────────────────────────────

export interface AyaFeatureFlags {
  /** Show CheckInCard on the map (Phase 2) */
  checkin_enabled: boolean;
  /** Use v2 recommendation engine (Phase 2) */
  rec_engine_v2: boolean;
  /** Show 'You Surprised Yourself' insight in MatchReport (Phase 3) */
  surprise_insight: boolean;
  /** Show Emerging You in DnaProfile (Phase 3) */
  emerging_you: boolean;
  /** Show Current Chapter label (Phase 3) */
  current_chapter: boolean;
  /** Weekly recap card on map (Phase 3) */
  weekly_recap: boolean;
  /** 2-step post-story reflection (Phase 4) */
  deep_reflection: boolean;
  /** AYA+ freemium gating (Phase 5) */
  ayaplus_enabled: boolean;
  /** Log all searches to search_analytics (Phase 4) */
  search_analytics: boolean;
  /** Semantic vector search active (needs embeddings in DB) */
  semantic_search: boolean;
}
