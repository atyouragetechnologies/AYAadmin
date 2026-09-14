-- Migration to add level_scores to the users table
-- This allows the game to persistently save star progression for each level.

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS level_scores JSONB DEFAULT '{}'::jsonb;
