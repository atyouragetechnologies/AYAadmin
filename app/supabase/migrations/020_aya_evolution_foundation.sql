-- ============================================================
-- Migration 020: AYA Evolution Foundation
-- ============================================================
-- Creates all new tables required for:
--   - Structured story metadata (13-dimension fingerprint)
--   - User check-ins (situation/problem signal)
--   - Recommendation decisions (explainability + analytics log)
--   - Story reflections (post-story deeper feedback)
--   - Weekly recaps (longitudinal insight snapshots)
--   - Search analytics (content gap intelligence)
--
-- IMPORTANT: No existing tables are dropped or altered destructively.
-- All changes are additive only.
-- Existing story IDs, user IDs, and gameplay data are preserved.
-- ============================================================

-- ── 1. Story Metadata (13-dimension fingerprint) ─────────────────────────────
-- Links to the existing `levels` table via story_id (= level.scenarioId or level.id)
-- Does NOT replace levels table — enriches it with recommendation signals.

CREATE TABLE IF NOT EXISTS public.story_metadata (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id            TEXT NOT NULL UNIQUE,           -- matches levels.scenario_id / STORY_DATABASE key

    -- Dimension 1: Situation categories (what is the user going through)
    situation_tags      TEXT[] DEFAULT '{}',            -- e.g. ['exam_pressure', 'career_transition']

    -- Dimension 2: Core problem
    problem_tags        TEXT[] DEFAULT '{}',            -- e.g. ['failure', 'identity_crisis', 'imposter_syndrome']

    -- Dimension 3: Emotional state the story addresses
    emotional_tags      TEXT[] DEFAULT '{}',            -- e.g. ['anxiety', 'loneliness', 'frustration']

    -- Dimension 4: User intent the story serves
    intent_tags         TEXT[] DEFAULT '{}',            -- e.g. ['find_direction', 'build_confidence', 'process_failure']

    -- Dimension 5: Age / life stage
    life_stage_tags     TEXT[] DEFAULT '{}',            -- e.g. ['teen', 'early_20s', 'mid_20s']
    age_min             SMALLINT DEFAULT 13,
    age_max             SMALLINT DEFAULT 30,

    -- Dimension 6: Dominant trait tension (the primary DNA trait this story challenges/explores)
    dominant_trait      TEXT,                           -- 'risk' | 'creativity' | 'vision' | 'empathy' | 'leadership'

    -- Dimension 7: Supporting trait weights (how much each DNA trait matters for this story)
    trait_affinity      JSONB DEFAULT '{}',             -- e.g. {"risk": 0.8, "creativity": 0.4, "vision": 0.6}

    -- Dimension 8: Resolution archetype
    resolution_archetype TEXT,                          -- e.g. 'overcome', 'adapt', 'accept', 'persist', 'pivot'

    -- Dimension 9: Lesson category
    lesson_tags         TEXT[] DEFAULT '{}',            -- e.g. ['resilience', 'identity', 'courage']

    -- Dimension 10: Difficulty (1=gentle, 5=challenging)
    difficulty          SMALLINT DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),

    -- Dimension 11: Relatability score (1=niche, 5=universal)
    relatability        SMALLINT DEFAULT 3 CHECK (relatability BETWEEN 1 AND 5),

    -- Dimension 12: Historical context
    era                 TEXT,                           -- e.g. 'modern', '20th_century', 'ancient'
    cultural_context    TEXT,                           -- e.g. 'indian', 'global', 'western'

    -- Dimension 13: Trigger phrases / semantic description for vector search
    semantic_description TEXT,                          -- free text description used for embedding
    trigger_phrases     TEXT[] DEFAULT '{}',            -- phrases users might type that should surface this story

    -- Recommendation mode affinity
    best_for_mode       TEXT DEFAULT 'support',         -- 'support' | 'challenge' | 'continue'

    -- Explainability template
    -- Interpolation slots: {user_problem}, {trait}, {idol_name}, {resolution}
    why_this_story_template TEXT,

    -- Premium gating
    is_premium          BOOLEAN DEFAULT false,
    premium_tier        TEXT DEFAULT 'aya_plus',        -- 'aya_plus' | 'report'

    -- Metadata
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by          TEXT DEFAULT 'admin'
);

CREATE INDEX IF NOT EXISTS idx_story_metadata_story_id ON public.story_metadata(story_id);
CREATE INDEX IF NOT EXISTS idx_story_metadata_dominant_trait ON public.story_metadata(dominant_trait);
CREATE INDEX IF NOT EXISTS idx_story_metadata_is_premium ON public.story_metadata(is_premium);
CREATE INDEX IF NOT EXISTS idx_story_metadata_situation_tags ON public.story_metadata USING gin(situation_tags);
CREATE INDEX IF NOT EXISTS idx_story_metadata_problem_tags ON public.story_metadata USING gin(problem_tags);
CREATE INDEX IF NOT EXISTS idx_story_metadata_emotional_tags ON public.story_metadata USING gin(emotional_tags);

-- ── 2. User Check-ins ────────────────────────────────────────────────────────
-- Captures the user's current situation before story recommendation.
-- Primary personalization signal for the recommendation engine.

CREATE TABLE IF NOT EXISTS public.user_checkins (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- What the user selected/entered
    situation_tags      TEXT[] DEFAULT '{}',            -- selected situation chips
    problem_tags        TEXT[] DEFAULT '{}',            -- selected problem chips
    emotional_tags      TEXT[] DEFAULT '{}',            -- selected emotional state
    intent_tags         TEXT[] DEFAULT '{}',            -- selected intent
    free_text           TEXT,                           -- optional open text (masked before logging if crisis)
    intensity           SMALLINT DEFAULT 3 CHECK (intensity BETWEEN 1 AND 5),

    -- Crisis detection result (client-side fast scan)
    crisis_risk_level   TEXT DEFAULT 'none',            -- 'none' | 'low' | 'medium' | 'high'
    is_crisis           BOOLEAN DEFAULT false,

    -- Session context
    session_id          TEXT,
    platform            TEXT DEFAULT 'web',

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_checkins_user_id ON public.user_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_checkins_created_at ON public.user_checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_checkins_is_crisis ON public.user_checkins(is_crisis) WHERE is_crisis = true;

-- ── 3. Recommendation Decisions ──────────────────────────────────────────────
-- Every recommendation generates a logged decision with full scoring breakdown.
-- Required for: explainability, analytics, future ML training data, audit.

CREATE TABLE IF NOT EXISTS public.recommendation_decisions (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    checkin_id              UUID REFERENCES public.user_checkins(id) ON DELETE SET NULL,

    -- What was recommended
    recommended_story_ids   TEXT[] NOT NULL,
    recommendation_mode     TEXT NOT NULL DEFAULT 'support',  -- 'support' | 'challenge' | 'continue' | 'mixed'

    -- Scoring breakdown for explainability (JSONB for flexibility)
    -- Structure: { story_id: { total_score, component_scores: { situation, emotional, dna_gap, ... }, explanation } }
    scoring_breakdown       JSONB DEFAULT '{}',

    -- Engine method used
    method                  TEXT DEFAULT 'structured',         -- 'structured' | 'semantic' | 'hybrid'

    -- Signal inputs used (snapshot at decision time)
    dna_traits_snapshot     JSONB DEFAULT '{}',               -- user's DNA at recommendation time
    session_prefs_snapshot  JSONB DEFAULT '{}',               -- session tag preferences
    checkin_snapshot        JSONB DEFAULT '{}',               -- what the user checked in with

    -- Outcome tracking
    clicked_story_id        TEXT,                              -- which story user clicked (null = no click)
    clicked_at              TIMESTAMP WITH TIME ZONE,

    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rec_decisions_user_id ON public.recommendation_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_decisions_created_at ON public.recommendation_decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rec_decisions_method ON public.recommendation_decisions(method);

-- ── 4. Story Reflections ─────────────────────────────────────────────────────
-- Deeper post-story reflection (step 2 after emoji feedback).
-- Extends, does NOT replace journey_feedback table.

CREATE TABLE IF NOT EXISTS public.story_reflections (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id            TEXT NOT NULL,                  -- matches level.scenarioId / level.id
    journey_feedback_id UUID,                           -- optional FK to journey_feedback if exists

    -- Reflection content
    reflection_text     TEXT,                           -- free-text: "What will you try differently?"
    selected_chips      TEXT[] DEFAULT '{}',            -- pre-set chip selections

    -- Surprise insight (if shown)
    showed_surprise_insight BOOLEAN DEFAULT false,
    surprise_trait          TEXT,                       -- which trait showed the gap
    surprise_delta          SMALLINT,                   -- how large the gap was

    -- Relevance feedback
    was_relevant        BOOLEAN,                        -- "Was this story relevant to you?"
    did_help            BOOLEAN,                        -- "Did this help?"

    -- Mood tracking
    mood_before         SMALLINT CHECK (mood_before BETWEEN 1 AND 5),
    mood_after          SMALLINT CHECK (mood_after BETWEEN 1 AND 5),

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_reflections_user_id ON public.story_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_story_reflections_story_id ON public.story_reflections(story_id);

-- ── 5. Weekly Recaps ─────────────────────────────────────────────────────────
-- Generated weekly snapshots of user progress and insights.

CREATE TABLE IF NOT EXISTS public.weekly_recaps (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Time period
    week_start              DATE NOT NULL,
    week_end                DATE NOT NULL,

    -- Content
    stories_played          INTEGER DEFAULT 0,
    stories_completed       INTEGER DEFAULT 0,
    lessons_explored        TEXT[] DEFAULT '{}',

    -- DNA trait movement (snapshot + delta from previous week)
    trait_snapshot          JSONB DEFAULT '{}',         -- { risk: 65, creativity: 72, ... }
    trait_deltas            JSONB DEFAULT '{}',         -- { risk: +3, creativity: -1, ... }

    -- Insights
    current_chapter         TEXT,                       -- 'Explorer' | 'Builder' | etc.
    dominant_challenge      TEXT,
    emerging_pattern        TEXT,
    next_recommendation_id  TEXT,                       -- pre-computed next story suggestion

    -- Engagement
    streak_at_recap         INTEGER DEFAULT 0,
    total_xp_earned         INTEGER DEFAULT 0,

    -- State
    generated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viewed_at               TIMESTAMP WITH TIME ZONE,   -- null = not yet seen by user
    shared_at               TIMESTAMP WITH TIME ZONE    -- null = not shared
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_recaps_user_week ON public.weekly_recaps(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_recaps_user_id ON public.weekly_recaps(user_id);

-- ── 6. Search Analytics ──────────────────────────────────────────────────────
-- Every search query logged with outcome — extends existing unmatched_searches with richer data.
-- The existing unmatched_searches table remains for backward compatibility.

CREATE TABLE IF NOT EXISTS public.search_analytics (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Query
    query               TEXT NOT NULL,
    query_normalized    TEXT,                           -- lowercased, trimmed

    -- Outcome
    results_count       INTEGER DEFAULT 0,              -- 0 = content gap
    matched_story_ids   TEXT[] DEFAULT '{}',
    clicked_story_id    TEXT,                           -- null = no click (low-confidence result)

    -- Classification
    is_zero_result      BOOLEAN DEFAULT false,
    is_low_confidence   BOOLEAN DEFAULT false,          -- results existed but none clicked

    -- Session
    session_id          TEXT,
    platform            TEXT DEFAULT 'web',

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON public.search_analytics(query_normalized);
CREATE INDEX IF NOT EXISTS idx_search_analytics_is_zero ON public.search_analytics(is_zero_result) WHERE is_zero_result = true;
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON public.search_analytics(created_at DESC);

-- ── 7. RLS Policies ─────────────────────────────────────────────────────────

-- story_metadata: publicly readable, admin-only write
ALTER TABLE public.story_metadata DISABLE ROW LEVEL SECURITY;

-- user_checkins: private to user
ALTER TABLE public.user_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_checkins_select" ON public.user_checkins;
DROP POLICY IF EXISTS "user_checkins_insert" ON public.user_checkins;

CREATE POLICY "user_checkins_select" ON public.user_checkins
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "user_checkins_insert" ON public.user_checkins
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- recommendation_decisions: user can read own, system writes
ALTER TABLE public.recommendation_decisions DISABLE ROW LEVEL SECURITY;

-- story_reflections: private to user
ALTER TABLE public.story_reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "story_reflections_all" ON public.story_reflections;

CREATE POLICY "story_reflections_all" ON public.story_reflections
    FOR ALL TO authenticated
    USING (user_id = auth.uid() OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
    WITH CHECK (user_id = auth.uid() OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- weekly_recaps: private to user
ALTER TABLE public.weekly_recaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "weekly_recaps_all" ON public.weekly_recaps;

CREATE POLICY "weekly_recaps_all" ON public.weekly_recaps
    FOR ALL TO authenticated
    USING (user_id = auth.uid() OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
    WITH CHECK (user_id = auth.uid() OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- search_analytics: open insert, admin reads
ALTER TABLE public.search_analytics DISABLE ROW LEVEL SECURITY;

-- ── 8. Grants ────────────────────────────────────────────────────────────────
GRANT ALL ON TABLE public.story_metadata TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_checkins TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.recommendation_decisions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.story_reflections TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.weekly_recaps TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.search_analytics TO anon, authenticated, service_role;
