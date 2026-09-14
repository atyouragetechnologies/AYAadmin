-- Run this script in your Supabase SQL Editor

-- 1. Add level_scores JSONB column to the users table to track level completions
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS level_scores JSONB DEFAULT '{}'::jsonb;

-- 2. Make sure total_xp, level, stories_completed exist on users table as well
-- (Previously they were put on personality_profiles, but users table is the main hub)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS stories_completed INTEGER DEFAULT 0;
