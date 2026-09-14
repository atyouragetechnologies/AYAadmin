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
