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
