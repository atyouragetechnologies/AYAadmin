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
