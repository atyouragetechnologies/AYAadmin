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