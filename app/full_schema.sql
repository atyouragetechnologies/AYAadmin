-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO CREATE ALL REQUIRED TABLES

-- 1. Create the Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID,
  mobile TEXT,
  email TEXT,
  username TEXT,
  name TEXT,
  age INTEGER,
  access_type TEXT,
  access_start_date DATE,
  preferred_theme TEXT,
  preferred_map TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  stories_completed INTEGER DEFAULT 0,
  story_count INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  daily_free_stories INTEGER DEFAULT 0,
  last_story_date DATE,
  daily_challenge_completed BOOLEAN DEFAULT false,
  daily_challenge_personality TEXT,
  daily_struggle TEXT,
  last_struggle_update TIMESTAMP WITH TIME ZONE,
  level_scores JSONB DEFAULT '{}'::jsonb,
  onboarding_scores JSONB,
  gameplay_scores JSONB,
  onboarding_complete BOOLEAN DEFAULT false,
  assessment_completed BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the Personality Profiles table
CREATE TABLE IF NOT EXISTS public.personality_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  mobile TEXT,
  trait_risk_taker INTEGER DEFAULT 50,
  trait_creative INTEGER DEFAULT 50,
  trait_analytical INTEGER DEFAULT 50,
  trait_social INTEGER DEFAULT 50,
  trait_ambitious INTEGER DEFAULT 50,
  future_archetype TEXT,
  future_archetype_score NUMERIC,
  interest_goal TEXT,
  interest_struggle TEXT,
  interest_domain TEXT,
  life_resilience INTEGER DEFAULT 50,
  life_discipline INTEGER DEFAULT 50,
  life_courage INTEGER DEFAULT 50,
  life_creativity INTEGER DEFAULT 50,
  life_emotional_control INTEGER DEFAULT 50,
  life_leadership INTEGER DEFAULT 50,
  life_risk_intelligence INTEGER DEFAULT 50,
  life_consistency INTEGER DEFAULT 50,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  stories_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create the Quiz Responses table
CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  responses JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create the Game Sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  scenario_id TEXT,
  level_id TEXT,
  selected_personality TEXT,
  match_score INTEGER,
  stars INTEGER,
  score INTEGER,
  feedback TEXT,
  traits_impact JSONB,
  choices_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Push Subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS) and define access policies.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update their own profile
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id OR auth.uid() = auth_user_id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id OR auth.uid() = auth_user_id);
CREATE POLICY "Users can insert own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() = auth_user_id);

-- Similar policies for other tables
CREATE POLICY "Users can access own personality" ON public.personality_profiles FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can access own quiz responses" ON public.quiz_responses FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can access own game sessions" ON public.game_sessions FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can access own push subscriptions" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO CREATE THE SCENARIOS AND LEVELS TABLES

CREATE TABLE IF NOT EXISTS public.scenarios (
  id TEXT PRIMARY KEY,
  title TEXT,
  source TEXT,
  frames JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.levels (
  id TEXT PRIMARY KEY,
  day_number INTEGER,
  title TEXT,
  description TEXT,
  personality TEXT,
  required_stars INTEGER,
  year INTEGER,
  age INTEGER,
  theme TEXT,
  archetype TEXT,
  bio TEXT,
  fame TEXT,
  achievements JSONB,
  lesson TEXT,
  avatar_url TEXT,
  scenario_id TEXT,
  idol_traits JSONB,
  status TEXT,
  is_locked BOOLEAN,
  stars INTEGER,
  part1 TEXT,
  part2 TEXT,
  placeholder BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security (RLS) so your frontend can read the levels/scenarios freely
ALTER TABLE public.scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels DISABLE ROW LEVEL SECURITY;
-- ============================================================
-- Complete Live Analytics & Feedback Setup for Supabase
-- Run this script in your Supabase SQL Editor to make sure all data
-- is stored live in Supabase and instantly accessible on Admin Panel!
-- ============================================================

-- 1. CREATE ALL TABLES (IF THEY DO NOT EXIST)

CREATE TABLE IF NOT EXISTS personality_wishlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  personality_name text NOT NULL,
  vote_count integer DEFAULT 1,
  requested_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS journey_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  journey_id text NOT NULL,
  sentiment_score integer NOT NULL,
  emoji text,
  session_duration_seconds integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS story_difficulty_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  journey_id text NOT NULL,
  difficulty_rating integer NOT NULL,
  part integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS feature_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  feature_name text NOT NULL,
  session_id text,
  accessed_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS unmatched_searches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  search_query text NOT NULL,
  searched_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS search_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  query text NOT NULL,
  query_original text,
  matched boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS journey_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  journey_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS user_topic_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  topic text NOT NULL,
  selected_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  question_key text NOT NULL,
  response_text text,
  response_rating integer,
  responded_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. REMOVE CONSTRAINTS & DISABLE RLS TO GUARANTEE LIVE SUPABASE SAVES

-- Disable RLS on feedback tables so inserts & selects NEVER get blocked by policies
ALTER TABLE personality_wishlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE journey_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE story_difficulty_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE unmatched_searches DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE journey_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses DISABLE ROW LEVEL SECURITY;

-- Grant permissions to public/anon/authenticated roles
GRANT ALL ON TABLE personality_wishlist TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE journey_feedback TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE story_difficulty_feedback TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE feature_usage TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE unmatched_searches TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE search_logs TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE journey_events TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE user_topic_preferences TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE survey_responses TO anon, authenticated, postgres, service_role;
-- Migration to add level_scores to the users table
-- This allows the game to persistently save star progression for each level.

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS level_scores JSONB DEFAULT '{}'::jsonb;
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their own subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_push_subscriptions_updated_at();
CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow anyone authenticated to read their own record (or actually, we can just allow read to authenticated if it matches their email)
CREATE POLICY "Admins can read own record" ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- Insert the default founder admin
INSERT INTO admin_users (email) VALUES ('anitadhakad@gmail.com') ON CONFLICT DO NOTHING;
-- Fix: Disable RLS on admin_users to match the rest of the app
-- (The app uses anon key without persistent Supabase auth sessions)
ALTER TABLE IF EXISTS admin_users DISABLE ROW LEVEL SECURITY;

-- Also add an id column if it doesn't exist (needed for admin management UI)
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
-- Update founder email from anitadhakad@gmail.com to anitadhakad333@gmail.com
UPDATE admin_users SET email = 'anitadhakad333@gmail.com' WHERE email = 'anitadhakad@gmail.com';
-- Insert if it doesn't exist yet
INSERT INTO admin_users (email) VALUES ('anitadhakad333@gmail.com') ON CONFLICT DO NOTHING;
-- Phase 1: Database Schema Restructuring for Psychometric Profiling Engine

-- Add new columns for the Dynamic Accumulator with a Prior Floor approach
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS onboarding_scores JSONB,
ADD COLUMN IF NOT EXISTS gameplay_scores JSONB,
ADD COLUMN IF NOT EXISTS story_count INTEGER DEFAULT 0;

-- Add strict comments to enforce immutability of the onboarding survey scores
COMMENT ON COLUMN public.users.onboarding_scores IS 'Immutable structure storing the exact scores from the 9-question onboarding survey across 5 traits. MUST NEVER BE OVERWRITTEN.';
COMMENT ON COLUMN public.users.gameplay_scores IS 'Rolling variables to store ongoing gameplay scores for the 5 traits. Updated via Exponential Moving Average (EMA).';
COMMENT ON COLUMN public.users.story_count IS 'Total narrative events played. Used for calculating the decay weight of onboarding scores.';

-- (Optional: Note that existing trait columns like trait_risk_taker, trait_creative, etc. 
-- are now considered deprecated by the new JSONB profile system.)
-- Migration 010: Add username support to public.users

-- 1. Add nullable username column. Existing users are unaffected.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Case-insensitive unique index.
-- JohnDoe, johndoe, JOHNDOE, JoHnDoE are treated as the same username.
-- NULL usernames are allowed for existing users who have not selected one yet.
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx
ON public.users (LOWER(username))
WHERE username IS NOT NULL;

-- 3. Username availability function.
-- Uses exact LOWER() comparison rather than ILIKE because "_" is a wildcard in ILIKE.
-- p_exclude_user_id is used when an existing user checks their own username from Settings.
CREATE OR REPLACE FUNCTION public.is_username_available(
    p_username TEXT,
    p_exclude_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_clean TEXT;
BEGIN
    v_clean := LOWER(TRIM(p_username));

    -- Basic database-level validation.
    IF v_clean IS NULL THEN
        RETURN FALSE;
    END IF;

    IF v_clean !~ '^[a-z0-9_]{3,20}$' THEN
        RETURN FALSE;
    END IF;

    -- New user: check whether anyone owns the username.
    IF p_exclude_user_id IS NULL THEN
        RETURN NOT EXISTS (
            SELECT 1
            FROM public.users
            WHERE LOWER(username) = v_clean
              AND username IS NOT NULL
        );
    END IF;

    -- Existing user: exclude their own record.
    RETURN NOT EXISTS (
        SELECT 1
        FROM public.users
        WHERE LOWER(username) = v_clean
          AND username IS NOT NULL
          AND id <> p_exclude_user_id
    );
END;
$$;

-- 4. Allow the frontend to perform availability checks.
GRANT EXECUTE
ON FUNCTION public.is_username_available(TEXT, UUID)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.is_username_available(TEXT, UUID)
TO anon;
-- ============================================================
-- Migration 011: Social Follow System (Strict RLS & SECURITY DEFINER)
-- ============================================================
-- Depends on: public.users (from base migration)
--             username column (from migration 010)
-- Does NOT modify migration 010 or the username system.
-- ============================================================

-- ── 1. follow_requests ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.follow_requests (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at  TIMESTAMPTZ,

    -- No self-follow
    CONSTRAINT no_self_follow_request CHECK (requester_id <> recipient_id),

    -- One active request per pair (prevents duplicate requests)
    CONSTRAINT unique_follow_request UNIQUE (requester_id, recipient_id)
);

-- ── 2. follows ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.follows (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- No self-follow at DB level
    CONSTRAINT no_self_follow CHECK (follower_id <> following_id),

    -- A user can only follow another user once
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- ── 3. Indexes ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_follow_requests_requester ON public.follow_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_recipient ON public.follow_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_status    ON public.follow_requests(status);

CREATE INDEX IF NOT EXISTS idx_follows_follower  ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- ── 4. Enable Row Level Security ─────────────────────────────

ALTER TABLE public.follow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows          ENABLE ROW LEVEL SECURITY;

-- ── 5. Strict RLS Policies: follow_requests ──────────────────

-- Requester can create a request ONLY for themselves (requester_id MUST equal auth.uid())
DROP POLICY IF EXISTS "follow_requests_insert" ON public.follow_requests;
CREATE POLICY "follow_requests_insert"
    ON public.follow_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = auth.uid());

-- Both parties can see requests involving themselves
DROP POLICY IF EXISTS "follow_requests_select" ON public.follow_requests;
CREATE POLICY "follow_requests_select"
    ON public.follow_requests
    FOR SELECT
    TO authenticated
    USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- Only the RECIPIENT can update (accept/reject) — requester cannot touch status
DROP POLICY IF EXISTS "follow_requests_update" ON public.follow_requests;
CREATE POLICY "follow_requests_update"
    ON public.follow_requests
    FOR UPDATE
    TO authenticated
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

-- Requester or recipient can delete pending requests
DROP POLICY IF EXISTS "follow_requests_delete" ON public.follow_requests;
CREATE POLICY "follow_requests_delete"
    ON public.follow_requests
    FOR DELETE
    TO authenticated
    USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- ── 6. Strict RLS Policies: follows ──────────────────────────

-- SELECT is readable by authenticated users
DROP POLICY IF EXISTS "follows_select" ON public.follows;
CREATE POLICY "follows_select"
    ON public.follows
    FOR SELECT
    TO authenticated
    USING (true);

-- NO INSERT policy for authenticated/public users.
-- Rows are ONLY inserted by the accept_follow_request() SECURITY DEFINER RPC.
-- Prevents any client from forging follow relationships.
DROP POLICY IF EXISTS "follows_insert" ON public.follows;

-- A user can only unfollow themselves (delete their own follower relationship)
DROP POLICY IF EXISTS "follows_delete" ON public.follows;
CREATE POLICY "follows_delete"
    ON public.follows
    FOR DELETE
    TO authenticated
    USING (follower_id = auth.uid());

-- ── 7. accept_follow_request() — SECURITY DEFINER RPC ────────

CREATE OR REPLACE FUNCTION public.accept_follow_request(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_requester_id UUID;
    v_recipient_id UUID;
    v_status       TEXT;
BEGIN
    SELECT requester_id, recipient_id, status
    INTO   v_requester_id, v_recipient_id, v_status
    FROM   public.follow_requests
    WHERE  id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Follow request % not found', p_request_id;
    END IF;

    -- Strict authentication check: caller MUST be recipient
    IF v_recipient_id <> auth.uid() THEN
        RAISE EXCEPTION 'Only the recipient can accept a follow request';
    END IF;

    IF v_status <> 'pending' THEN
        RAISE EXCEPTION 'Follow request is not pending (status: %)', v_status;
    END IF;

    UPDATE public.follow_requests
    SET    status       = 'accepted',
           responded_at = NOW()
    WHERE  id = p_request_id;

    INSERT INTO public.follows (follower_id, following_id)
    VALUES (v_requester_id, v_recipient_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_follow_request(UUID) TO authenticated;

-- ── 8. search_users_by_username() — SECURITY DEFINER RPC ─────

CREATE OR REPLACE FUNCTION public.search_users_by_username(p_query TEXT)
RETURNS TABLE (
    id       UUID,
    username TEXT,
    name     TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_clean TEXT;
BEGIN
    v_clean := LOWER(TRIM(LEADING '@' FROM TRIM(p_query)));

    IF v_clean = '' THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT  u.id,
            u.username,
            u.name
    FROM    public.users u
    WHERE   u.username IS NOT NULL
      AND   LOWER(u.username) LIKE (v_clean || '%')
      AND   u.id <> auth.uid()   -- Exclude current authenticated user
    ORDER BY LOWER(u.username)
    LIMIT 20;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_users_by_username(TEXT) TO authenticated;

-- ── 9. reject_follow_request() — SECURITY DEFINER RPC ────────

CREATE OR REPLACE FUNCTION public.reject_follow_request(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_recipient_id UUID;
    v_status       TEXT;
BEGIN
    SELECT recipient_id, status
    INTO   v_recipient_id, v_status
    FROM   public.follow_requests
    WHERE  id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Follow request % not found', p_request_id;
    END IF;

    -- Strict authentication check: caller MUST be recipient
    IF v_recipient_id <> auth.uid() THEN
        RAISE EXCEPTION 'Only the recipient can reject a follow request';
    END IF;

    IF v_status <> 'pending' THEN
        RAISE EXCEPTION 'Follow request is not pending (status: %)', v_status;
    END IF;

    UPDATE public.follow_requests
    SET    status       = 'rejected',
           responded_at = NOW()
    WHERE  id = p_request_id;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reject_follow_request(UUID) TO authenticated;
-- ============================================================
-- Migration 012: Link public.users to Supabase auth.users
-- ============================================================
-- Adds auth_user_id column so mobile/phone users who are
-- migrated to Supabase Auth email/password can be correlated
-- back to their existing public.users row.
--
-- public.users.id remains unchanged — all foreign keys
-- (follow_requests, follows, personality_profiles, etc.) are
-- NOT affected.
--
-- auth_user_id = auth.users.id (UUID from Supabase Auth JWT)
-- This is the value returned by auth.uid() after sign-in.
-- ============================================================

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_auth_user_id
    ON public.users(auth_user_id);

COMMENT ON COLUMN public.users.auth_user_id IS
    'UUID from auth.users — set when user authenticates via Supabase Auth. '
    'Used by RLS policies and SECURITY DEFINER RPCs via auth.uid(). '
    'NULL for legacy rows not yet migrated to Supabase Auth.';

-- ── RLS: Allow authenticated users to read public user profiles ──────────────
-- (Follow status lookups need to read username/name for other users)

-- Drop old blanket anon policy if it existed
DROP POLICY IF EXISTS "users_select_public" ON public.users;

-- All authenticated users may read id, username, name (public social profile)
CREATE POLICY "users_select_authenticated"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

-- A user may update their own row only (uses auth_user_id = auth.uid())
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- ── search_users_by_username: updated to use auth_user_id ───────────────────
-- Re-create the search RPC to exclude caller by auth_user_id, not users.id,
-- because auth.uid() corresponds to auth_user_id (not users.id for mobile users).

CREATE OR REPLACE FUNCTION public.search_users_by_username(p_query TEXT)
RETURNS TABLE (
    id       UUID,
    username TEXT,
    name     TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_clean TEXT;
BEGIN
    v_clean := LOWER(TRIM(LEADING '@' FROM TRIM(p_query)));

    IF v_clean = '' THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT  u.id,
            u.username,
            u.name
    FROM    public.users u
    WHERE   u.username IS NOT NULL
      AND   LOWER(u.username) LIKE (v_clean || '%')
      AND   (auth.uid() IS NULL OR u.auth_user_id <> auth.uid())
    ORDER BY LOWER(u.username)
    LIMIT 20;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_users_by_username(TEXT) TO authenticated, anon;

-- ── follow_requests RLS: use auth_user_id for caller matching ────────────────
-- The requester_id / recipient_id in follow_requests refers to public.users.id,
-- NOT auth.uid(). We need a helper function to get the public.users.id from
-- auth.uid() (via auth_user_id column).

CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
    SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_user_id() TO authenticated;

-- ── Update RLS policies on follow_requests to use get_my_user_id() ───────────

-- INSERT: requester must be the calling user
DROP POLICY IF EXISTS "follow_requests_insert" ON public.follow_requests;
CREATE POLICY "follow_requests_insert"
    ON public.follow_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = public.get_my_user_id());

-- SELECT: either party can see their requests
DROP POLICY IF EXISTS "follow_requests_select" ON public.follow_requests;
CREATE POLICY "follow_requests_select"
    ON public.follow_requests
    FOR SELECT
    TO authenticated
    USING (
        requester_id = public.get_my_user_id()
        OR recipient_id = public.get_my_user_id()
    );

-- UPDATE: only recipient can accept/reject
DROP POLICY IF EXISTS "follow_requests_update" ON public.follow_requests;
CREATE POLICY "follow_requests_update"
    ON public.follow_requests
    FOR UPDATE
    TO authenticated
    USING (recipient_id = public.get_my_user_id())
    WITH CHECK (recipient_id = public.get_my_user_id());

-- DELETE: requester or recipient can delete
DROP POLICY IF EXISTS "follow_requests_delete" ON public.follow_requests;
CREATE POLICY "follow_requests_delete"
    ON public.follow_requests
    FOR DELETE
    TO authenticated
    USING (
        requester_id = public.get_my_user_id()
        OR recipient_id = public.get_my_user_id()
    );

-- ── Update RLS policies on follows to use get_my_user_id() ──────────────────

DROP POLICY IF EXISTS "follows_select" ON public.follows;
CREATE POLICY "follows_select"
    ON public.follows
    FOR SELECT
    TO authenticated
    USING (true);

-- NO INSERT policy — only accept_follow_request() SECURITY DEFINER inserts
DROP POLICY IF EXISTS "follows_insert" ON public.follows;

DROP POLICY IF EXISTS "follows_delete" ON public.follows;
CREATE POLICY "follows_delete"
    ON public.follows
    FOR DELETE
    TO authenticated
    USING (follower_id = public.get_my_user_id());

-- ── Update accept_follow_request to use get_my_user_id() ────────────────────

CREATE OR REPLACE FUNCTION public.accept_follow_request(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_requester_id UUID;
    v_recipient_id UUID;
    v_status       TEXT;
    v_my_user_id   UUID;
BEGIN
    -- Resolve calling user's public.users.id from auth session
    v_my_user_id := public.get_my_user_id();

    IF v_my_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: no user found for this session';
    END IF;

    -- Lock the request row
    SELECT requester_id, recipient_id, status
    INTO   v_requester_id, v_recipient_id, v_status
    FROM   public.follow_requests
    WHERE  id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Follow request % not found', p_request_id;
    END IF;

    -- Only the recipient may accept
    IF v_recipient_id <> v_my_user_id THEN
        RAISE EXCEPTION 'Only the recipient can accept a follow request';
    END IF;

    IF v_status <> 'pending' THEN
        RAISE EXCEPTION 'Follow request is not pending (status: %)', v_status;
    END IF;

    UPDATE public.follow_requests
    SET    status       = 'accepted',
           responded_at = NOW()
    WHERE  id = p_request_id;

    -- Insert follow relationship (only this SECURITY DEFINER function may do this)
    INSERT INTO public.follows (follower_id, following_id)
    VALUES (v_requester_id, v_recipient_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_follow_request(UUID) TO authenticated;

-- ── Update reject_follow_request to use get_my_user_id() ────────────────────

CREATE OR REPLACE FUNCTION public.reject_follow_request(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_recipient_id UUID;
    v_status       TEXT;
    v_my_user_id   UUID;
BEGIN
    v_my_user_id := public.get_my_user_id();

    IF v_my_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: no user found for this session';
    END IF;

    SELECT recipient_id, status
    INTO   v_recipient_id, v_status
    FROM   public.follow_requests
    WHERE  id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Follow request % not found', p_request_id;
    END IF;

    IF v_recipient_id <> v_my_user_id THEN
        RAISE EXCEPTION 'Only the recipient can reject a follow request';
    END IF;

    IF v_status <> 'pending' THEN
        RAISE EXCEPTION 'Follow request is not pending (status: %)', v_status;
    END IF;

    UPDATE public.follow_requests
    SET    status       = 'rejected',
           responded_at = NOW()
    WHERE  id = p_request_id;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reject_follow_request(UUID) TO authenticated;
-- ============================================================
-- Migration 013: Soft Delete & Cascade Constraints for Accounts
-- ============================================================
-- Adds soft delete columns (deleted_at, status) to public.users
-- Ensures all related tables have ON DELETE CASCADE constraints
-- ============================================================

-- 1. Add soft delete columns to public.users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Index for soft delete filtering / retention cleanup background jobs
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

COMMENT ON COLUMN public.users.deleted_at IS 'Timestamp when the account was soft-deleted. Accounts are purged after 30 days.';
COMMENT ON COLUMN public.users.status IS 'Account status: active, deactivated, or deleted.';

-- 2. Verify / Ensure ON DELETE CASCADE on all user-referencing foreign keys

-- personality_profiles
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'personality_profiles_user_id_fkey'
    ) THEN
        ALTER TABLE public.personality_profiles DROP CONSTRAINT personality_profiles_user_id_fkey;
    END IF;
END $$;

ALTER TABLE public.personality_profiles
ADD CONSTRAINT personality_profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- quiz_responses
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'quiz_responses_user_id_fkey'
    ) THEN
        ALTER TABLE public.quiz_responses DROP CONSTRAINT quiz_responses_user_id_fkey;
    END IF;
END $$;

ALTER TABLE public.quiz_responses
ADD CONSTRAINT quiz_responses_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- game_sessions
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'game_sessions_user_id_fkey'
    ) THEN
        ALTER TABLE public.game_sessions DROP CONSTRAINT game_sessions_user_id_fkey;
    END IF;
END $$;

ALTER TABLE public.game_sessions
ADD CONSTRAINT game_sessions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- push_subscriptions
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'push_subscriptions_user_id_fkey'
    ) THEN
        ALTER TABLE public.push_subscriptions DROP CONSTRAINT push_subscriptions_user_id_fkey;
    END IF;
END $$;

ALTER TABLE public.push_subscriptions
ADD CONSTRAINT push_subscriptions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- ============================================================
-- Migration 014: Add deleted_at and status columns for soft delete
-- ============================================================

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- 1. Update is_username_available to ignore soft-deleted accounts
CREATE OR REPLACE FUNCTION public.is_username_available(
    p_username TEXT,
    p_exclude_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_clean TEXT;
BEGIN
    v_clean := LOWER(TRIM(p_username));

    IF v_clean IS NULL OR v_clean !~ '^[a-z0-9_]{3,20}$' THEN
        RETURN FALSE;
    END IF;

    IF p_exclude_user_id IS NULL THEN
        RETURN NOT EXISTS (
            SELECT 1
            FROM public.users
            WHERE LOWER(username) = v_clean
              AND username IS NOT NULL
              AND deleted_at IS NULL
        );
    END IF;

    RETURN NOT EXISTS (
        SELECT 1
        FROM public.users
        WHERE LOWER(username) = v_clean
          AND username IS NOT NULL
          AND id <> p_exclude_user_id
          AND deleted_at IS NULL
    );
END;
$$;

-- 2. Update search_users_by_username to filter out soft-deleted accounts
CREATE OR REPLACE FUNCTION public.search_users_by_username(p_query TEXT)
RETURNS TABLE (
    id       UUID,
    username TEXT,
    name     TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_clean TEXT;
BEGIN
    v_clean := LOWER(TRIM(LEADING '@' FROM TRIM(p_query)));

    IF v_clean = '' THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT  u.id,
            u.username,
            u.name
    FROM    public.users u
    WHERE   u.username IS NOT NULL
      AND   LOWER(u.username) LIKE (v_clean || '%')
      AND   (auth.uid() IS NULL OR u.auth_user_id <> auth.uid())
      AND   u.deleted_at IS NULL
    ORDER BY LOWER(u.username)
    LIMIT 20;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_username_available(TEXT, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.search_users_by_username(TEXT) TO authenticated, anon;
-- ============================================================
-- AYA Push Subscription Table — Production-Ready Schema Patch
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/boxuixgyxzbxdrvlevuu/editor
-- ============================================================

-- 1. Ensure the push_subscriptions table exists with correct schema
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Add updated_at column if it doesn't exist (for environments using older schema)
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

-- 3. Ensure RLS is enabled
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Drop conflicting old policies if they exist and recreate permissive ones
--    (service-role bypasses RLS anyway, but anon key needs SELECT/INSERT)
DO $$
BEGIN
  -- Drop old restrictive policies that block anon access
  DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;
  DROP POLICY IF EXISTS "Users can access own push subscriptions" ON public.push_subscriptions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 5. Create permissive policies (server-side service role bypasses RLS)
CREATE POLICY "Allow service role insert" ON public.push_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role select" ON public.push_subscriptions
  FOR SELECT USING (true);

CREATE POLICY "Allow service role update" ON public.push_subscriptions
  FOR UPDATE USING (true);

CREATE POLICY "Allow service role delete" ON public.push_subscriptions
  FOR DELETE USING (true);

-- 6. Create or replace the updated_at trigger
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Verification: Check current table status
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(user_id) as with_user_id
FROM public.push_subscriptions;
-- ============================================================
-- Migration 016: Auth Account Linking and Metadata
-- ============================================================
-- Ensures public.users has columns for email, google_id, and onboarding_complete.
-- Preserves all existing user records and sets onboarding_complete = true
-- for users who already have active profiles.
-- ============================================================

-- 1. Add email column if not exists
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Add google_id column if not exists
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS google_id TEXT;

-- 3. Add onboarding_complete column if not exists
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- 4. Mark existing users as onboarding_complete = true if they have data
UPDATE public.users
SET onboarding_complete = true
WHERE (name IS NOT NULL AND name <> '')
   OR (username IS NOT NULL AND username <> '')
   OR (mobile IS NOT NULL AND mobile <> '')
   OR total_xp > 0
   OR stories_completed > 0
   OR level > 1;

-- 5. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_mobile ON public.users(mobile) WHERE mobile IS NOT NULL;

-- 6. Ensure username case-insensitive unique index exists (safety check from migration 010)
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx
ON public.users (LOWER(username))
WHERE username IS NOT NULL;

-- 7. Comment on new columns
COMMENT ON COLUMN public.users.email IS 'User primary email address for auth and profile';
COMMENT ON COLUMN public.users.google_id IS 'Google OAuth subject ID when authenticated via Google';
COMMENT ON COLUMN public.users.onboarding_complete IS 'Flag indicating whether user has completed account creation and profile setup';
-- ============================================================
-- Migration 017: Fix RLS for phone auth + set_username RPC
-- ============================================================

-- A. INSERT policy: authenticated user may only insert their OWN row
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own"
    ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth_user_id = auth.uid());

-- B. UPDATE policy (recreated from 012 to be safe)
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING    (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- C. Ensure unique index on auth_user_id
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_user_id_key ON public.users(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- D. set_username SECURITY DEFINER RPC
-- Safely inserts or updates user profile and initializes personality profile.
-- Bypasses RLS because SECURITY DEFINER runs as the DB owner.
-- Internally validates auth.uid() so users can only update their own row.
CREATE OR REPLACE FUNCTION public.set_username(
    p_username TEXT,
    p_age INTEGER DEFAULT NULL,
    p_mobile TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_auth_uid   UUID;
    v_clean      TEXT;
    v_existing   UUID;
    v_user_id    UUID;
    v_email      TEXT;
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    v_clean := TRIM(p_username);
    IF LENGTH(v_clean) < 3 THEN
        RAISE EXCEPTION 'Username must be at least 3 characters.';
    END IF;
    IF LENGTH(v_clean) > 30 THEN
        RAISE EXCEPTION 'Username must be 30 characters or fewer.';
    END IF;
    IF v_clean !~ '^[A-Za-z0-9_]+$' THEN
        RAISE EXCEPTION 'Username may only contain letters, numbers, and underscores.';
    END IF;

    -- Check uniqueness (case-insensitive), excluding caller's own row
    SELECT id INTO v_existing
    FROM   public.users
    WHERE  LOWER(username) = LOWER(v_clean)
      AND  auth_user_id IS DISTINCT FROM v_auth_uid
      AND  deleted_at IS NULL
    LIMIT  1;

    IF FOUND THEN
        RAISE EXCEPTION 'Username is already taken. Please choose another.';
    END IF;

    -- Get caller email from JWT if available
    v_email := NULLIF(auth.jwt()->>'email', '');

    -- Check if user row already exists for this auth_user_id
    SELECT id INTO v_user_id
    FROM   public.users
    WHERE  auth_user_id = v_auth_uid
    LIMIT  1;

    IF FOUND THEN
        UPDATE public.users
        SET    username            = v_clean,
               name                = COALESCE(NULLIF(users.name, ''), v_clean),
               onboarding_complete = true,
               age                 = COALESCE(p_age, users.age, 18),
               mobile              = COALESCE(p_mobile, users.mobile),
               email               = COALESCE(v_email, users.email)
        WHERE  id = v_user_id;
    ELSE
        INSERT INTO public.users (
            auth_user_id,
            username,
            name,
            email,
            mobile,
            age,
            onboarding_complete,
            total_xp,
            level,
            stories_completed
        )
        VALUES (
            v_auth_uid,
            v_clean,
            v_clean,
            v_email,
            p_mobile,
            COALESCE(p_age, 18),
            true,
            0,
            1,
            0
        )
        RETURNING id INTO v_user_id;
    END IF;

    -- Ensure personality_profiles row exists
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.personality_profiles (user_id, mobile)
        VALUES (v_user_id, p_mobile)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_username(TEXT, INTEGER, TEXT) TO authenticated;

-- Backwards-compatible 1-arg wrapper
CREATE OR REPLACE FUNCTION public.set_username(p_username TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT public.set_username(p_username, NULL, NULL);
$$;

GRANT EXECUTE ON FUNCTION public.set_username(TEXT) TO authenticated;
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Table for story tags (Topics, Themes, Traits, etc.)
CREATE TABLE IF NOT EXISTS public.story_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id TEXT NOT NULL,
    tag_name TEXT NOT NULL,
    weight FLOAT NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, tag_name)
);

-- Table for story embeddings
CREATE TABLE IF NOT EXISTS public.story_embeddings (
    story_id TEXT PRIMARY KEY,
    embedding vector(384),
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for user tag preferences (long term profile)
CREATE TABLE IF NOT EXISTS public.user_tag_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    score FLOAT NOT NULL DEFAULT 0.0,
    interaction_count INTEGER DEFAULT 1,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tag_name)
);

-- Table for user embeddings
CREATE TABLE IF NOT EXISTS public.user_embeddings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    embedding vector(384),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendation logs for analytics
CREATE TABLE IF NOT EXISTS public.recommendation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recommended_story_ids TEXT[] NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to match stories by embedding
CREATE OR REPLACE FUNCTION match_stories(
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  exclude_story_ids text[] DEFAULT '{}'::text[]
)
RETURNS TABLE (
  story_id text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    se.story_id,
    1 - (se.embedding <=> query_embedding) AS similarity
  FROM story_embeddings se
  WHERE 1 - (se.embedding <=> query_embedding) > match_threshold
    AND NOT (se.story_id = ANY(exclude_story_ids))
  ORDER BY se.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Allow public read/write temporarily for easy client integration (mirroring existing AYA setup)
ALTER TABLE public.story_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_embeddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tag_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_embeddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_logs DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.story_tags TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.story_embeddings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_tag_preferences TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_embeddings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.recommendation_logs TO anon, authenticated, service_role;
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
-- Add rakshit.shrivastava73@gmail.com as an admin
INSERT INTO admin_users (email) VALUES ('rakshit.shrivastava73@gmail.com') ON CONFLICT DO NOTHING;
-- Add is_admin column to users table (backend-driven admin check)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set is_admin = true for users whose email matches the admin_users table
UPDATE users
SET is_admin = true
WHERE email IN (SELECT email FROM admin_users);

-- Also match by auth_user_id -> auth.users.email
UPDATE users
SET is_admin = true
WHERE auth_user_id IN (
    SELECT id FROM auth.users WHERE email IN (SELECT email FROM admin_users)
);
-- Update public.users for any auth.users that have admin emails
UPDATE public.users 
SET is_admin = true 
WHERE auth_user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN (
        'anitadhakad333@gmail.com', 
        'tanishksocials@hotmail.com', 
        'tanishkproductivity@gmail.com',
        'rakshit.shrivastava73@gmail.com',
        'dhairya185@gmail.com'
    )
);
-- Get the auth ID for the google account
DO $$ 
DECLARE
    google_auth_id UUID;
    phone_user_id UUID;
BEGIN
    -- 1. Find Google auth ID
    SELECT id INTO google_auth_id FROM auth.users WHERE email = 'anitadhakad333@gmail.com';
    
    -- 2. Find phone user ID in public.users
    SELECT id INTO phone_user_id FROM public.users WHERE mobile = '9111897728' LIMIT 1;
    
    -- 3. Update public.users to link them!
    IF google_auth_id IS NOT NULL AND phone_user_id IS NOT NULL THEN
        UPDATE public.users 
        SET auth_user_id = google_auth_id,
            email = 'anitadhakad333@gmail.com'
        WHERE id = phone_user_id;
    END IF;
END $$;
-- STEP 1: Get the exact auth user IDs for both Google emails
DO $$ 
DECLARE
    anita_auth_id UUID;
    rakshit_auth_id UUID;
    anita_phone_id UUID;
    rakshit_phone_id UUID;
    rakshit_email TEXT := 'REPLACE_WITH_RAKSHITS_EMAIL@gmail.com'; -- <--- CHANGE THIS TO HIS EXACT EMAIL
BEGIN
    -- 1. Find the Auth IDs from Google Logins
    SELECT id INTO anita_auth_id FROM auth.users WHERE email = 'anitadhakad333@gmail.com' LIMIT 1;
    SELECT id INTO rakshit_auth_id FROM auth.users WHERE email = rakshit_email LIMIT 1;
    
    -- 2. Find the User Profiles for the phone numbers
    SELECT id INTO anita_phone_id FROM public.users WHERE mobile = '8103059448' LIMIT 1;
    SELECT id INTO rakshit_phone_id FROM public.users WHERE mobile = '9111897728' LIMIT 1;
    
    -- 3. Clear any existing incorrect links on these two phone numbers to prevent unique constraint errors
    UPDATE public.users SET auth_user_id = null, email = null WHERE id IN (anita_phone_id, rakshit_phone_id);

    -- 4. Link Anita's profile (8103059448) to her Google Email
    IF anita_auth_id IS NOT NULL AND anita_phone_id IS NOT NULL THEN
        UPDATE public.users 
        SET auth_user_id = anita_auth_id, email = 'anitadhakad333@gmail.com'
        WHERE id = anita_phone_id;
    END IF;

    -- 5. Link Rakshit's profile (9111897728) to his Google Email
    IF rakshit_auth_id IS NOT NULL AND rakshit_phone_id IS NOT NULL THEN
        UPDATE public.users 
        SET auth_user_id = rakshit_auth_id, email = rakshit_email
        WHERE id = rakshit_phone_id;
    END IF;
END $$;
-- Fix admin access for all users
-- This updates the is_admin_user RPC to check both the users table and the admin_users table

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Check if the user has the is_admin flag directly
    SELECT 1 FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND is_admin = true
  ) OR EXISTS (
    -- Check if the user's auth email is in the admin_users table
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ) OR EXISTS (
    -- Check if the user's public email is in the admin_users table
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid()
    AND email IN (SELECT email FROM public.admin_users)
  );
$$;

-- Ensure all current admins in admin_users have their is_admin flag set in public.users
UPDATE public.users 
SET is_admin = true 
WHERE email IN (SELECT email FROM public.admin_users)
   OR auth_user_id IN (SELECT id FROM auth.users WHERE email IN (SELECT email FROM public.admin_users));
-- Future Self Match columns — additive migration, safe on existing rows
ALTER TABLE personality_profiles
  ADD COLUMN IF NOT EXISTS future_archetype TEXT,
  ADD COLUMN IF NOT EXISTS future_archetype_score INTEGER,
  ADD COLUMN IF NOT EXISTS life_resilience INTEGER,
  ADD COLUMN IF NOT EXISTS life_discipline INTEGER,
  ADD COLUMN IF NOT EXISTS life_courage INTEGER,
  ADD COLUMN IF NOT EXISTS life_creativity INTEGER,
  ADD COLUMN IF NOT EXISTS life_emotional_control INTEGER,
  ADD COLUMN IF NOT EXISTS life_leadership INTEGER,
  ADD COLUMN IF NOT EXISTS life_risk_intelligence INTEGER,
  ADD COLUMN IF NOT EXISTS life_consistency INTEGER;
-- Prevent duplicate game_sessions for the same user + personality on the same day.
-- This acts as a database-level safety net in addition to the application-level useRef guard.
CREATE UNIQUE INDEX IF NOT EXISTS unique_game_session 
ON game_sessions(user_id, selected_personality, ((created_at AT TIME ZONE 'UTC')::date));
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_struggle TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_struggle_update TIMESTAMP WITH TIME ZONE;

-- ============================================================
-- Migration 027: AYA Life-Navigation and Self-Discovery Schema
-- ============================================================
CREATE TABLE IF NOT EXISTS public.problem_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    situation_text TEXT NOT NULL,
    situation_tags TEXT[] DEFAULT '{}',
    life_stage TEXT,
    feeling_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problem_checkins_user_id ON public.problem_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_problem_checkins_created_at ON public.problem_checkins(created_at DESC);

CREATE TABLE IF NOT EXISTS public.story_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id TEXT NOT NULL UNIQUE,
    dilemma_type TEXT,
    life_theme TEXT,
    situational_tags TEXT[] DEFAULT '{}',
    protagonist_lens TEXT,
    historical_context TEXT,
    reflection_prompt TEXT,
    micro_action_prompt TEXT,
    is_premium BOOLEAN DEFAULT false,
    difficulty TEXT DEFAULT 'moderate',
    target_traits JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_metadata_scenario_id ON public.story_metadata(scenario_id);
CREATE INDEX IF NOT EXISTS idx_story_metadata_theme ON public.story_metadata(life_theme);

CREATE TABLE IF NOT EXISTS public.recommendation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    scenario_id TEXT NOT NULL,
    score NUMERIC,
    explanation TEXT,
    search_query TEXT,
    clicked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_logs_user ON public.recommendation_logs(user_id);

CREATE TABLE IF NOT EXISTS public.search_demand_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    normalized_topic TEXT,
    match_count INTEGER DEFAULT 0,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_demand_created_at ON public.search_demand_analytics(created_at DESC);

CREATE TABLE IF NOT EXISTS public.reflections_and_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    scenario_id TEXT NOT NULL,
    decision_selected TEXT,
    dissonance_detected BOOLEAN DEFAULT false,
    dissonance_insight TEXT,
    micro_action_committed TEXT,
    action_completed BOOLEAN DEFAULT false,
    relevance_rating INTEGER,
    user_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reflections_user ON public.reflections_and_actions(user_id);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    tier TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

ALTER TABLE public.problem_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_demand_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections_and_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "problem_checkins_all" ON public.problem_checkins;
CREATE POLICY "problem_checkins_all" ON public.problem_checkins
    FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "story_metadata_select" ON public.story_metadata;
CREATE POLICY "story_metadata_select" ON public.story_metadata FOR SELECT USING (true);

DROP POLICY IF EXISTS "story_metadata_admin" ON public.story_metadata;
CREATE POLICY "story_metadata_admin" ON public.story_metadata
    FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "recommendation_logs_all" ON public.recommendation_logs;
CREATE POLICY "recommendation_logs_all" ON public.recommendation_logs
    FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "search_demand_insert" ON public.search_demand_analytics;
CREATE POLICY "search_demand_insert" ON public.search_demand_analytics FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "search_demand_admin" ON public.search_demand_analytics;
CREATE POLICY "search_demand_admin" ON public.search_demand_analytics FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "reflections_all" ON public.reflections_and_actions;
CREATE POLICY "reflections_all" ON public.reflections_and_actions
    FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
CREATE POLICY "subscriptions_select" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "subscriptions_admin" ON public.subscriptions;
CREATE POLICY "subscriptions_admin" ON public.subscriptions
    FOR ALL USING (public.is_admin_user());

- -   M i g r a t i o n   0 2 8 :   S t o r y   R e q u e s t s   &   C o n t e n t   D e m a n d   S i g n a l s  
 - -   C a p t u r e s   u s e r   r e q u e s t s   w h e n   n o   m a t c h i n g   s t o r y   e x i s t s   f o r   a   s e l e c t e d   s i t u a t i o n .  
 - -   P r o v i d e s   d e m a n d   a n a l y t i c s   f o r   a d m i n s   t o   p r i o r i t i z e   n e w   s t o r y   a u t h o r i n g .  
  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . s t o r y _ r e q u e s t s   (  
         i d   U U I D   P R I M A R Y   K E Y   D E F A U L T   g e n _ r a n d o m _ u u i d ( ) ,  
         u s e r _ i d   U U I D   R E F E R E N C E S   a u t h . u s e r s ( i d )   O N   D E L E T E   S E T   N U L L ,  
         r e q u e s t e d _ t a g   T E X T   N O T   N U L L ,  
         r e q u e s t e d _ p r o b l e m   T E X T ,  
         s t a t u s   T E X T   D E F A U L T   ' a c t i v e ' ,   - -   ' a c t i v e '   |   ' n o t i f i e d '   |   ' d i s m i s s e d '  
         c r e a t e d _ a t   T I M E S T A M P   W I T H   T I M E   Z O N E   D E F A U L T   N O W ( ) ,  
         n o t i f i e d _ a t   T I M E S T A M P   W I T H   T I M E   Z O N E  
 ) ;  
  
 C R E A T E   I N D E X   I F   N O T   E X I S T S   i d x _ s t o r y _ r e q u e s t s _ t a g   O N   p u b l i c . s t o r y _ r e q u e s t s ( r e q u e s t e d _ t a g ) ;  
 C R E A T E   I N D E X   I F   N O T   E X I S T S   i d x _ s t o r y _ r e q u e s t s _ u s e r   O N   p u b l i c . s t o r y _ r e q u e s t s ( u s e r _ i d ) ;  
 C R E A T E   I N D E X   I F   N O T   E X I S T S   i d x _ s t o r y _ r e q u e s t s _ c r e a t e d _ a t   O N   p u b l i c . s t o r y _ r e q u e s t s ( c r e a t e d _ a t   D E S C ) ;  
  
 - -   E n a b l e   a c c e s s  
 A L T E R   T A B L E   p u b l i c . s t o r y _ r e q u e s t s   D I S A B L E   R O W   L E V E L   S E C U R I T Y ;  
 G R A N T   A L L   O N   T A B L E   p u b l i c . s t o r y _ r e q u e s t s   T O   a n o n ,   a u t h e n t i c a t e d ,   s e r v i c e _ r o l e ;  
 