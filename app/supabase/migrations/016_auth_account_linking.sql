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
