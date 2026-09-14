-- ============================================================
-- Migration 019: Persistent DNA Traits & Scoring Idempotency
-- ============================================================
-- 1. Fix RLS policies on personality_profiles and game_sessions
--    to link via public.get_my_user_id() (auth_user_id = auth.uid())
-- 2. Add atomic RPC save_story_completion_dna() for idempotent,
--    session-backed story completion and DNA score persistence.
-- ============================================================

-- ── 1. Update RLS on personality_profiles ─────────────────────────────────────

ALTER TABLE public.personality_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access own personality" ON public.personality_profiles;
DROP POLICY IF EXISTS "personality_profiles_select" ON public.personality_profiles;
DROP POLICY IF EXISTS "personality_profiles_insert" ON public.personality_profiles;
DROP POLICY IF EXISTS "personality_profiles_update" ON public.personality_profiles;
DROP POLICY IF EXISTS "personality_profiles_all" ON public.personality_profiles;

-- Allow authenticated users to view their own personality profile
CREATE POLICY "personality_profiles_select"
    ON public.personality_profiles
    FOR SELECT
    TO authenticated
    USING (
        user_id = public.get_my_user_id()
        OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Allow authenticated users to insert their own personality profile
CREATE POLICY "personality_profiles_insert"
    ON public.personality_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = public.get_my_user_id()
        OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Allow authenticated users to update their own personality profile
CREATE POLICY "personality_profiles_update"
    ON public.personality_profiles
    FOR UPDATE
    TO authenticated
    USING (
        user_id = public.get_my_user_id()
        OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    )
    WITH CHECK (
        user_id = public.get_my_user_id()
        OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- ── 2. Update RLS on game_sessions ────────────────────────────────────────────

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access own game sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "game_sessions_select" ON public.game_sessions;
DROP POLICY IF EXISTS "game_sessions_insert" ON public.game_sessions;
DROP POLICY IF EXISTS "game_sessions_update" ON public.game_sessions;

CREATE POLICY "game_sessions_select"
    ON public.game_sessions
    FOR SELECT
    TO authenticated
    USING (
        user_id = public.get_my_user_id()
        OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "game_sessions_insert"
    ON public.game_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = public.get_my_user_id()
        OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- ── 3. Atomic Idempotent RPC for Story Completion & DNA Persistence ──────────

CREATE OR REPLACE FUNCTION public.save_story_completion_dna(
    p_level_id               TEXT,
    p_selected_personality   TEXT,
    p_match_score            INTEGER,
    p_stars                  INTEGER,
    p_session_xp             INTEGER,
    p_trait_risk_taker       INTEGER,
    p_trait_creative         INTEGER,
    p_trait_analytical       INTEGER,
    p_trait_social           INTEGER,
    p_trait_ambitious        INTEGER,
    p_future_archetype       TEXT DEFAULT NULL,
    p_future_archetype_score NUMERIC DEFAULT NULL,
    p_life_traits            JSONB DEFAULT NULL,
    p_gameplay_scores        JSONB DEFAULT NULL,
    p_choices_log            JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_user_id           UUID;
    v_current_xp        INTEGER;
    v_current_level     INTEGER;
    v_current_stories   INTEGER;
    v_current_scount    INTEGER;
    v_current_scores    JSONB;
    v_new_xp            INTEGER;
    v_new_level         INTEGER;
    v_new_stories       INTEGER;
    v_new_scount        INTEGER;
    v_updated_scores    JSONB;
    v_existing_session  UUID;
    v_is_first_for_node BOOLEAN := false;
BEGIN
    -- 1. Dynamic authenticated user resolution
    v_user_id := public.get_my_user_id();
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: session user not found';
    END IF;

    -- 2. Lock user record
    SELECT total_xp, level, stories_completed, story_count, level_scores
    INTO   v_current_xp, v_current_level, v_current_stories, v_current_scount, v_current_scores
    FROM   public.users
    WHERE  id = v_user_id
    FOR UPDATE;

    v_current_xp      := COALESCE(v_current_xp, 0);
    v_current_level   := COALESCE(v_current_level, 1);
    v_current_stories := COALESCE(v_current_stories, 0);
    v_current_scount  := COALESCE(v_current_scount, 0);
    v_current_scores  := COALESCE(v_current_scores, '{}'::jsonb);

    -- Check if this specific level has stars recorded
    IF NOT (v_current_scores ? p_level_id) OR (v_current_scores->>p_level_id)::integer = 0 THEN
        v_is_first_for_node := true;
    END IF;

    -- 3. Check for existing identical game_session in the last 60 seconds (anti-double-click / idempotency)
    SELECT id INTO v_existing_session
    FROM   public.game_sessions
    WHERE  user_id = v_user_id
      AND  level_id = p_level_id
      AND  created_at >= NOW() - INTERVAL '30 seconds'
    ORDER BY created_at DESC
    LIMIT 1;

    -- 4. Calculate updated stats
    IF v_existing_session IS NULL THEN
        v_new_xp      := v_current_xp + GREATEST(COALESCE(p_session_xp, 0), 20);
        v_new_stories := v_current_stories + 1;
        v_new_scount  := v_current_scount + 1;
    ELSE
        v_new_xp      := v_current_xp;
        v_new_stories := v_current_stories;
        v_new_scount  := v_current_scount;
    END IF;

    -- Level calculation: Level = floor(xp / 100) + 1 (safe ceiling)
    v_new_level := GREATEST(1, FLOOR(v_new_xp / 150) + 1);

    -- Update level_scores JSONB
    v_updated_scores := jsonb_set(
        v_current_scores,
        ARRAY[p_level_id],
        to_jsonb(GREATEST(COALESCE((v_current_scores->>p_level_id)::integer, 0), p_stars))
    );

    -- 5. Update users table
    UPDATE public.users
    SET    total_xp = v_new_xp,
           level = v_new_level,
           stories_completed = v_new_stories,
           story_count = v_new_scount,
           level_scores = v_updated_scores,
           gameplay_scores = COALESCE(p_gameplay_scores, gameplay_scores)
    WHERE  id = v_user_id;

    -- 6. Upsert personality_profiles table
    INSERT INTO public.personality_profiles (
        user_id,
        trait_risk_taker,
        trait_creative,
        trait_analytical,
        trait_social,
        trait_ambitious,
        future_archetype,
        future_archetype_score,
        life_resilience,
        life_discipline,
        life_courage,
        life_creativity,
        life_emotional_control,
        life_leadership,
        life_risk_intelligence,
        life_consistency,
        total_xp,
        level,
        stories_completed,
        last_updated
    )
    VALUES (
        v_user_id,
        p_trait_risk_taker,
        p_trait_creative,
        p_trait_analytical,
        p_trait_social,
        p_trait_ambitious,
        p_future_archetype,
        p_future_archetype_score,
        COALESCE((p_life_traits->>'resilience')::integer, 50),
        COALESCE((p_life_traits->>'discipline')::integer, 50),
        COALESCE((p_life_traits->>'courage')::integer, 50),
        COALESCE((p_life_traits->>'creativity')::integer, 50),
        COALESCE((p_life_traits->>'emotional_control')::integer, 50),
        COALESCE((p_life_traits->>'leadership')::integer, 50),
        COALESCE((p_life_traits->>'risk_intelligence')::integer, 50),
        COALESCE((p_life_traits->>'consistency')::integer, 50),
        v_new_xp,
        v_new_level,
        v_new_stories,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        trait_risk_taker       = EXCLUDED.trait_risk_taker,
        trait_creative         = EXCLUDED.trait_creative,
        trait_analytical       = EXCLUDED.trait_analytical,
        trait_social           = EXCLUDED.trait_social,
        trait_ambitious        = EXCLUDED.trait_ambitious,
        future_archetype       = COALESCE(EXCLUDED.future_archetype, public.personality_profiles.future_archetype),
        future_archetype_score = COALESCE(EXCLUDED.future_archetype_score, public.personality_profiles.future_archetype_score),
        life_resilience        = EXCLUDED.life_resilience,
        life_discipline        = EXCLUDED.life_discipline,
        life_courage           = EXCLUDED.life_courage,
        life_creativity        = EXCLUDED.life_creativity,
        life_emotional_control = EXCLUDED.life_emotional_control,
        life_leadership        = EXCLUDED.life_leadership,
        life_risk_intelligence = EXCLUDED.life_risk_intelligence,
        life_consistency       = EXCLUDED.life_consistency,
        total_xp               = EXCLUDED.total_xp,
        level                  = EXCLUDED.level,
        stories_completed      = EXCLUDED.stories_completed,
        last_updated           = NOW();

    -- 7. Insert game_sessions log (if not duplicate within 30s)
    IF v_existing_session IS NULL THEN
        INSERT INTO public.game_sessions (
            user_id,
            level_id,
            selected_personality,
            match_score,
            stars,
            traits_impact,
            created_at
        ) VALUES (
            v_user_id,
            p_level_id,
            p_selected_personality,
            p_match_score,
            p_stars,
            p_choices_log,
            NOW()
        );
    END IF;

    -- 8. Return comprehensive state payload
    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'total_xp', v_new_xp,
        'level', v_new_level,
        'stories_completed', v_new_stories,
        'traits', jsonb_build_object(
            'risk', p_trait_risk_taker,
            'creativity', p_trait_creative,
            'vision', p_trait_analytical,
            'empathy', p_trait_social,
            'leadership', p_trait_ambitious
        ),
        'is_first_run', v_is_first_for_node,
        'idempotent_duplicate', (v_existing_session IS NOT NULL)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_story_completion_dna TO authenticated;
