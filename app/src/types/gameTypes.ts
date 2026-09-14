import type { LifeTraits } from '../utils/futureSelfMatch';
export type { LifeTraits };

// New Personality System Types
export interface PsychometricScores {
    risk: number;
    creativity: number;
    vision: number;
    empathy: number;
    leadership: number;
}

export interface PersonalityTraits {
    discipline: number; // 0-100
    resilience: number; // Grit
    risk: number;
    leadership: number;
    creativity: number;
    empathy: number;
    vision: number;
}

// --- NEW PSYCHOLOGICAL PROFILE ---
export type MotivationType = 'Impact' | 'Stability' | 'Fame' | 'Freedom';
export type RiskAppetite = 'Bold' | 'Balanced' | 'Cautious';
export type EmotionalStyle = 'Resilient' | 'Sensitive' | 'Analytical' | 'Avoidant';
export type SocialRole = 'Leader' | 'Supporter' | 'Observer' | 'Creator';
export type PassionType = 'Creative' | 'Intellectual' | 'Competitive' | 'Empathic';
export type CoreValue = 'Impact' | 'Art' | 'Success' | 'Kindness';

export interface PsychologicalProfile {
    motivation: MotivationType;
    risk: RiskAppetite;
    emotional: EmotionalStyle;
    social: SocialRole;
    passion: PassionType;
    coreValue: CoreValue;
    interest_goal?: string;
    interest_struggle?: string;
    interest_domain?: string;
}

export interface MatchResult {
    matchPercentage: number;
    gapAnalysis: string; // "You are more risk-averse than Kobe..."
    idolName: string;
}

export interface UserProfile {
    id?: string;
    mobile?: string;
    username?: string | null;
    email?: string | null;
    google_id?: string | null;
    auth_user_id?: string | null;
    fcm_token?: string | null;
    onboarding_complete?: boolean;
    name: string;
    age: number;
    interests?: string[];
    roleModels?: string[];
    avatarId?: string;
    avatarUrl?: string;
    bio?: string;
    isAdmin?: boolean;
    access_type?: string;        // 'free' | 'jee15' | 'neet15'
    access_start_date?: string;  // ISO date string 'YYYY-MM-DD'
    created_at?: string;
    trial_start_date?: string;
    trial_end_date?: string;
    trial_used?: boolean;
    preferred_map?: string;
    daily_free_stories?: number;
    last_story_date?: string;

    // Personality System
    traits: PersonalityTraits; // Deprecated, kept for backward compatibility
    onboarding_scores?: PsychometricScores;
    gameplay_scores?: PsychometricScores;
    psychologicalProfile?: PsychologicalProfile; // New deep profile
    assessmentCompleted: boolean;

    // Progression System
    total_xp?: number;
    level?: number;
    stories_completed?: number;
    story_count?: number; // New dynamic system tracker

    // Future Self Match
    futureArchetype?: string;
    futureArchetypeScore?: number;
    lifeTraits?: LifeTraits;

    // Daily Challenge & Streak System (Stored in `users` table usually)
    current_streak?: number;
    longest_streak?: number;
    last_active_date?: string; // ISO Date String
    daily_challenge_completed?: boolean;
    daily_challenge_personality?: string;

    // Backend Persistent Flags & Preferences
    tutorial_completed?: boolean;
    topic_survey_completed?: boolean;
    choice_history?: any[];
    music_volume?: number;
    sfx_volume?: number;
    is_music_muted?: boolean;
    is_sfx_muted?: boolean;
    daily_spins_used?: number;
    spin_reset_date?: string;
}

export interface Lesson {
    id: string;        // Unique ID (usually scenarioId)
    title: string;     // e.g. "RESILIENCE"
    description: string; // The full lesson text
    source: string;    // e.g. "Frida Kahlo"
    age: number;       // e.g. 24
    date: string;      // ISO Date string

    // New: Match Result stored with the lesson
    matchResult?: MatchResult;
}

export interface Level {
    id: string;
    title: string;
    description: string;
    requiredStars: number;
    scenarioId: string; // Key into STORY_DATABASE
    status: 'locked' | 'unlocked' | 'completed';
    year: number; // e.g. 2018 (When user was 18)
    age: number;  // e.g. 18
    theme: string; // e.g. "Technology", "Art"
    age_mirror_text?: string;
    personality?: string; // e.g. "Steve Jobs"
    bio?: string; // Short "About me"
    fame?: string; // "Known for..."
    achievements?: string[]; // Bullet points
    lesson?: string; // Preview of what you'll learn
    archetype: string; // e.g. "The Founder", "The Visionary"
    avatarUrl: string; // Placeholder or path to asset
    isLocked: boolean;
    stars: number; // 0-3

    // New: Idol Benchmarks
    idolTraits?: PersonalityTraits;
    idolProfile?: Partial<PsychologicalProfile>; // For deep matching

    // Access Code
    day_number?: number;
    placeholder?: boolean;
    portrait?: string;
    background?: string;
}

export interface AccessCode {
    id: string;
    code: string;
    access_type: string;
    preferred_map: string;
    max_uses: number;
    uses_count: number;
    expires_at: string | null;
    used_by_user_id: string | null;
}

export interface Scenario {
    id: string;
    levelId: string;
    backgroundUrl: string;
    situationText: string;
    options: UtilityOption[];
    correctPersonalityResponse: string; // Explanation of what the personality would do
}

export interface UtilityOption {
    id: string;
    text: string;
    likenessScore: number; // 0-100 match percentage
    feedbackTitle: string;
    feedbackText: string;

    // New: Trait Modifiers (Optional for now, defaults to simple calculation)
    traitModifiers?: Partial<PersonalityTraits>;
}

// --- LIFE NAVIGATION & SELF-DISCOVERY PLATFORM TYPES ---

export type LifeTheme =
    | 'career_uncertainty'
    | 'high_pressure_burnout'
    | 'family_expectations'
    | 'creative_block'
    | 'risk_vs_safety'
    | 'imposter_syndrome'
    | 'leadership_loneliness'
    | 'relationship_dilemma'
    | 'finding_purpose'
    | 'identity_reinvention';

export type LifeStage = 'early_teens' | 'late_teens' | 'college' | 'early_career' | 'turning_point';

export interface ProblemCheckIn {
    id?: string;
    userId?: string;
    situationText: string;
    situationTags: string[];
    lifeStage?: string;
    feelingState?: string;
    createdAt?: string;
}

export interface StoryMetadata {
    id?: string;
    scenarioId: string;
    dilemmaType: string;
    lifeTheme: string;
    situationalTags: string[];
    protagonistLens: string;
    historicalContext?: string;
    reflectionPrompt?: string;
    microActionPrompt?: string;
    isPremium?: boolean;
    difficulty?: 'accessible' | 'moderate' | 'deep';
    targetTraits?: Partial<PsychometricScores>;
}

export interface RecommendationResult {
    storyId: string;
    score: number;
    title: string;
    personality: string;
    age: number;
    explanation: string;
    dilemmaType: string;
    lifeTheme: string;
    situationalTags: string[];
    isPremium?: boolean;
    matchFactors?: {
        situationMatch: number;
        dnaAlignment: number;
        intentBonus: number;
        noveltyScore: number;
    };
}

export interface DissonanceInsight {
    hasDissonance: boolean;
    traitName?: string;
    baselineValue?: number;
    choiceDirection?: 'bolder' | 'more_cautious' | 'more_empathic' | 'more_independent' | 'more_visionary';
    headline: string;
    description: string;
}

export interface MicroAction {
    scenarioId: string;
    prompt: string;
    committed: boolean;
    reflectionNotes?: string;
    completedAt?: string;
}

export interface CurrentVsEmergingYou {
    currentTraits: PsychometricScores;
    emergingTraits: PsychometricScores;
    dominantShift: {
        trait: keyof PsychometricScores;
        delta: number;
        label: string;
    };
    storiesCount: number;
}

export interface SafetyAssessment {
    isCrisis: boolean;
    severity: 'none' | 'low' | 'high';
    matchedKeywords: string[];
    supportMessage?: string;
    helplines?: Array<{
        country: string;
        name: string;
        contact: string;
        url?: string;
    }>;
}

export type SubscriptionTier = 'free' | 'plus' | 'pro';

export interface UserSubscription {
    tier: SubscriptionTier;
    status: 'active' | 'cancelled' | 'expired';
    startsAt: string;
    expiresAt?: string | null;
}