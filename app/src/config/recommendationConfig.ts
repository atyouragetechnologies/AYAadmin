/**
 * recommendationConfig.ts
 *
 * Single source of truth for all AYA recommendation engine configuration.
 *
 * RULES:
 * - Never import pricing from UI components — import from here.
 * - Never hardcode weights in scoring functions — read from RECOMMENDATION_WEIGHTS.
 * - Feature flags control risky new functionality — read from FEATURE_FLAGS.
 * - All values are typed and exported individually for easy override/testing.
 *
 * Phase 1: Story/Data Foundation
 */

import type {
  RecommendationWeights,
  AyaPricingConfig,
  AyaFeatureFlags,
} from '../types/ayaTypes';

// ─── Recommendation Weights ───────────────────────────────────────────────────
// Configurable scoring weights. Must sum to 1.0.
// Adjust proportions here without touching scoring logic.

export const RECOMMENDATION_WEIGHTS: RecommendationWeights = {
  situation_relevance: 0.30,   // Problem/situation category match
  emotional_relevance: 0.15,   // Emotional state match
  dna_growth_gap:      0.15,   // DNA self-view vs behavior gap (challenge mode)
  age_life_stage:      0.10,   // Age and life stage relevance
  past_behavior:       0.10,   // Previous completed stories / tag preferences
  idol_affinity:       0.05,   // Matching toward user's idol type
  difficulty_fit:      0.05,   // Difficulty alignment to user level
  novelty_diversity:   0.05,   // Penalty for recently seen / reward for new
  semantic_similarity: 0.05,   // pgvector cosine similarity (if available)
};

// Verify weights sum to 1.0 at runtime in dev
if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
  const sum = Object.values(RECOMMENDATION_WEIGHTS).reduce((a, b) => a + b, 0);
  const rounded = Math.round(sum * 100) / 100;
  if (rounded !== 1.0) {
    console.warn(`[AYA Config] Recommendation weights sum to ${rounded}, not 1.0. Check recommendationConfig.ts`);
  }
}

// ─── Recommendation Engine Settings ──────────────────────────────────────────

export const RECOMMENDATION_CONFIG = {
  /** Default number of stories to return */
  default_limit: 8,

  /** Minimum score threshold (0–1) to include a story in results */
  min_score_threshold: 0.05,

  /** Penalty applied to already-completed stories */
  completion_penalty: 0.5,

  /** Minimum gap (out of 100) between onboarding_scores and gameplay_scores to trigger surprise insight */
  surprise_insight_min_delta: 12,

  /** Cosine similarity threshold below which semantic results are discarded */
  semantic_min_similarity: 0.65,

  /** Number of recent game sessions to analyze for EmergingYou trends */
  emerging_you_session_count: 5,

  /** Trait delta required (per session avg) to show a trend arrow */
  emerging_you_min_delta: 3,

  /** Minimum stories played before showing personalized recommendations (cold-start threshold) */
  cold_start_threshold: 1,

  /** Max number of previously completed stories to exclude from recommendations */
  max_excluded_stories: 50,
} as const;

// ─── Challenge Mode Thresholds ────────────────────────────────────────────────
// Used to identify meaningful growth gaps for CHALLENGE mode recommendations.
// If onboarding_score - gameplay_score > threshold, a challenge story is appropriate.

export const CHALLENGE_MODE_CONFIG = {
  /** Minimum absolute difference between self-view and behavior for a trait to be a 'gap' */
  min_gap_for_challenge: 15,

  /** How much to boost a story's score in CHALLENGE mode if it targets the gap trait */
  challenge_boost_multiplier: 1.4,

  /** Proportion of final results that should be CHALLENGE mode stories (rest = SUPPORT/CONTINUE) */
  challenge_mix_ratio: 0.25,
} as const;

// ─── Pricing Configuration ────────────────────────────────────────────────────
// Never hardcode prices in UI components. Always read from here.
// These can later be fetched from remote config or environment variables.

export const PRICING_CONFIG: AyaPricingConfig = {
  monthly_price_inr:     99,
  monthly_original_inr:  149,
  three_month_price_inr: 199,
  three_month_original_inr: 249,
  annual_price_inr:      799,
  annual_original_inr:   999,
  report_price_min_inr:  499,
  report_price_max_inr:  999,
  currency:              'INR',
  currency_symbol:       '₹',
};

// Formatted price strings for display
export const PRICING_DISPLAY = {
  monthly: `₹${PRICING_CONFIG.monthly_price_inr}/month`,
  monthly_original: `₹${PRICING_CONFIG.monthly_original_inr}/month`,
  monthly_savings_pct: Math.round(
    (1 - PRICING_CONFIG.monthly_price_inr / PRICING_CONFIG.monthly_original_inr) * 100
  ),
  three_month: `₹${PRICING_CONFIG.three_month_price_inr} for 3 months`,
  three_month_original: `₹${PRICING_CONFIG.three_month_original_inr}`,
  three_month_monthly_equiv: `₹${Math.round(PRICING_CONFIG.three_month_price_inr / 3)}/month`,
  three_month_savings_pct: Math.round(
    (1 - PRICING_CONFIG.three_month_price_inr / PRICING_CONFIG.three_month_original_inr) * 100
  ),
  annual: `₹${PRICING_CONFIG.annual_price_inr}/year`,
  annual_original: `₹${PRICING_CONFIG.annual_original_inr}/year`,
  annual_monthly_equiv: `₹${Math.round(PRICING_CONFIG.annual_price_inr / 12)}/month`,
  annual_savings_pct: Math.round(
    (1 - PRICING_CONFIG.annual_price_inr / PRICING_CONFIG.annual_original_inr) * 100
  ),
  report: `₹${PRICING_CONFIG.report_price_min_inr}–₹${PRICING_CONFIG.report_price_max_inr}`,
} as const;

// ─── AYA PRO Benefits & Plan Comparison ─────────────────────────────────────────
// Used in SubscriptionModal and upgrade CTAs. Single source of truth.

export const AYA_PLAN_COMPARISON = [
  { 
    key: 'assessment',
    feature: 'Personality Assessment', 
    free: '9-question personality assessment', 
    pro: '9-question personality assessment', 
    highlightPro: false 
  },
  { 
    key: 'stories',
    feature: 'Story & Library Access', 
    free: '3 complete stories / day', 
    pro: 'Unlimited stories & Full story library', 
    highlightPro: true 
  },
  { 
    key: 'gameplay',
    feature: 'Interactive Gameplay', 
    free: 'Full gameplay, choices, consequences, comparison & learning', 
    pro: 'Full gameplay, choices, consequences, comparison & learning', 
    highlightPro: false 
  },
  { 
    key: 'personality_match',
    feature: 'Personality Match', 
    free: 'Personality Match', 
    pro: 'Personality Match & deep role-model archetype insights', 
    highlightPro: false 
  },
  { 
    key: 'dna_report',
    feature: 'DNA Report & Evolution', 
    free: '1 complete DNA report after initial experience', 
    pro: 'DNA evolution based on continued gameplay and choices', 
    highlightPro: true 
  },
  { 
    key: 'dna_insights',
    feature: 'Refined DNA Insights', 
    free: 'Initial baseline DNA report', 
    pro: 'More refined / personalized DNA insights over time', 
    highlightPro: true 
  },
  { 
    key: 'career_matches',
    feature: 'Career Guidance', 
    free: 'Career matches based on DNA', 
    pro: 'Full / deeper career recommendations', 
    highlightPro: true 
  },
  { 
    key: 'journal',
    feature: 'Journal & Weekly Progress', 
    free: 'Journal', 
    pro: 'Journal + Weekly progress / DNA report (when available)', 
    highlightPro: true 
  },
  { 
    key: 'dealing_with',
    feature: '“What Are You Dealing With?” Search', 
    free: 'Limited searches to section', 
    pro: 'Unlimited searches & Personalized story recommendations', 
    highlightPro: true 
  },
  { 
    key: 'future_premium',
    feature: 'Future Features', 
    free: '—', 
    pro: 'All future Premium features included', 
    highlightPro: true 
  },
] as const;

export const AYAPRO_BENEFITS = [
  { key: 'stories',        label: 'Unlimited stories & Full story library',             free: '3 stories/day' },
  { key: 'dna_evolution',  label: 'DNA evolution based on continued gameplay & choices',free: '1 DNA report only' },
  { key: 'dna_insights',   label: 'More refined/personalized DNA insights over time',   free: 'Initial report' },
  { key: 'career',         label: 'Full / deeper career recommendations',               free: 'Basic matches' },
  { key: 'recommendations',label: 'Personalized story recommendations',                 free: '—' },
  { key: 'search',         label: 'Unlimited “What Are You Dealing With?” searches',    free: 'Limited searches' },
  { key: 'weekly_recap',   label: 'Weekly progress / DNA report when available',        free: '—' },
  { key: 'future_premium', label: 'VIP access to all future Premium features',          free: '—' },
] as const;

export const AYAPLUS_BENEFITS = AYAPRO_BENEFITS;

// ─── Feature Flags ────────────────────────────────────────────────────────────
// Set to false to disable a feature without code changes.
// Phase 1: Most new features off until their phase is complete.

export const FEATURE_FLAGS: AyaFeatureFlags = {
  checkin_enabled:   false,   // Phase 2 enables this
  rec_engine_v2:     false,   // Phase 2 enables this
  surprise_insight:  false,   // Phase 3 enables this
  emerging_you:      false,   // Phase 3 enables this
  current_chapter:   false,   // Phase 3 enables this
  weekly_recap:      false,   // Phase 3 enables this
  deep_reflection:   false,   // Phase 4 enables this
  ayaplus_enabled:   false,   // Phase 5 enables this
  search_analytics:  false,   // Phase 4 enables this
  semantic_search:   false,   // Enabled when pgvector embeddings are populated
};

// ─── Situation / Problem / Emotional / Intent Taxonomy ───────────────────────
// Pre-defined tags for check-in UI chips and story metadata authoring.
// These are the canonical tag values used throughout the system.

export const CHECKIN_TAGS = {
  situation: [
    { value: 'exam_pressure',          label: 'Exam / study pressure' },
    { value: 'career_uncertainty',     label: 'Career uncertainty' },
    { value: 'career_transition',      label: 'Career change / transition' },
    { value: 'relationship_challenge', label: 'Relationship challenge' },
    { value: 'family_pressure',        label: 'Family pressure' },
    { value: 'feeling_stuck',          label: 'Feeling stuck' },
    { value: 'starting_something',     label: 'Starting something new' },
    { value: 'creative_block',         label: 'Creative block' },
    { value: 'financial_stress',       label: 'Financial stress' },
    { value: 'identity_question',      label: 'Figuring out who I am' },
    { value: 'confidence_low',         label: 'Low confidence' },
    { value: 'failure_setback',        label: 'Recent failure / setback' },
    { value: 'loneliness',             label: 'Feeling alone' },
    { value: 'comparison_trap',        label: 'Comparing myself to others' },
    { value: 'big_decision',           label: 'A big decision to make' },
    { value: 'purpose',                label: 'Finding my purpose / calling' },
    { value: 'starting_with_little',   label: 'Starting from the bottom' },
    { value: 'discipline',             label: 'Building discipline' },
    { value: 'parents_vs_own_path',     label: 'Parents vs own path' },
  ],
  emotional: [
    { value: 'anxious',     label: 'Anxious' },
    { value: 'frustrated',  label: 'Frustrated' },
    { value: 'hopeful',     label: 'Hopeful but unsure' },
    { value: 'motivated',   label: 'Motivated' },
    { value: 'confused',    label: 'Confused' },
    { value: 'sad',         label: 'Sad' },
    { value: 'angry',       label: 'Angry' },
    { value: 'lonely',      label: 'Lonely' },
    { value: 'numb',        label: 'Numb / disconnected' },
    { value: 'determined',  label: 'Determined' },
    { value: 'curious',     label: 'Curious' },
    { value: 'burnt_out',   label: 'Burnt out' },
    { value: 'restless',    label: 'Restless' },
    { value: 'seeking',     label: 'Seeking' },
    { value: 'conflicted',  label: 'Conflicted' },
  ],
  intent: [
    { value: 'find_direction',      label: 'Find direction' },
    { value: 'build_confidence',    label: 'Build confidence' },
    { value: 'process_emotion',     label: 'Process how I feel' },
    { value: 'learn_from_others',   label: 'Learn from someone else' },
    { value: 'challenge_myself',    label: 'Challenge myself' },
    { value: 'feel_less_alone',     label: 'Feel less alone' },
    { value: 'understand_myself',   label: 'Understand myself better' },
    { value: 'get_inspired',        label: 'Get inspired' },
    { value: 'courage_to_commit',   label: 'Courage to commit to a path' },
    { value: 'find_courage_non_traditional_path', label: 'Courage for non-traditional path' },
  ],
} as const;

// ─── Current Chapter Definitions ─────────────────────────────────────────────
// Dynamic chapter labels — NOT permanent psychological labels.

export const CURRENT_CHAPTERS = {
  Explorer: {
    label: 'Explorer',
    description: "You're in a phase of discovery — questioning, trying, and figuring things out. This is one of the richest phases of growth.",
    color: '#00f2ff',
    trigger_traits: ['vision', 'creativity'] as const,
  },
  Builder: {
    label: 'Builder',
    description: "You're in execution mode — taking what you know and making something real. Momentum is your most important resource right now.",
    color: '#f59e0b',
    trigger_traits: ['leadership', 'risk'] as const,
  },
  Challenger: {
    label: 'Challenger',
    description: "You're pushing against limits — your own or others'. Something is being tested, and you're choosing not to back down.",
    color: '#ef4444',
    trigger_traits: ['risk', 'leadership'] as const,
  },
  Resilient: {
    label: 'Resilient',
    description: "You've been through something hard and you're still here. That's not nothing — that's everything.",
    color: '#10b981',
    trigger_traits: ['empathy', 'vision'] as const,
  },
  Leader: {
    label: 'Leader',
    description: "People around you are looking to you — whether you chose that role or not. Your decisions affect more than just yourself.",
    color: '#8b5cf6',
    trigger_traits: ['leadership', 'empathy'] as const,
  },
  Visionary: {
    label: 'Visionary',
    description: "You see something others don't yet see. The challenge isn't the idea — it's the gap between vision and reality.",
    color: '#d575ff',
    trigger_traits: ['vision', 'creativity'] as const,
  },
  Seeker: {
    label: 'Seeker',
    description: "Something feels unresolved. You're asking deeper questions about who you are and what actually matters to you.",
    color: '#fbbf24',
    trigger_traits: ['empathy', 'creativity'] as const,
  },
  Creator: {
    label: 'Creator',
    description: "You're making something — an idea, a project, a new version of yourself. Creation is your response to uncertainty.",
    color: '#a855f7',
    trigger_traits: ['creativity', 'vision'] as const,
  },
} as const;

// ─── Crisis Detection Patterns ────────────────────────────────────────────────
// Used by crisisDetection.ts (Phase 2). Defined here for centralized management.

export const CRISIS_PATTERNS = {
  high_risk: [
    'want to die', 'want to kill myself', 'kill myself', 'end my life',
    'end it all', 'not worth living', "don't want to live", 'suicidal',
    'suicide', 'cut myself', 'hurt myself', 'self harm', 'self-harm',
    'no reason to live', 'better off dead', 'nobody would miss me',
  ],
  medium_risk: [
    'feeling hopeless', 'completely hopeless', 'no point anymore',
    'giving up on everything', 'cant go on', "can't go on",
    'nothing matters', 'feeling worthless', "i'm worthless",
    'hate myself', 'hate my life', 'want to disappear',
    'want to run away from everything',
  ],
} as const;

// ─── Indian Crisis Resources ──────────────────────────────────────────────────
// Shown in SafetyCard when high-risk crisis is detected.
// AYA does NOT position itself as crisis care or therapy.

export const CRISIS_RESOURCES = [
  {
    name: 'iCall',
    phone: '9152987821',
    description: 'Free counselling from TISS (Mon–Sat, 8am–10pm)',
    url: 'https://icallhelpline.org',
  },
  {
    name: 'Vandrevala Foundation',
    phone: '1860-2662-345',
    description: '24/7 mental health helpline',
    url: 'https://www.vandrevalafoundation.com',
  },
  {
    name: 'AASRA',
    phone: '9820466627',
    description: '24/7 crisis support',
    url: 'http://www.aasra.info',
  },
] as const;
