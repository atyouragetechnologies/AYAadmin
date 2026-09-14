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
