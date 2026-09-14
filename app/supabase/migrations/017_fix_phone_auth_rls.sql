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

-- C. set_username SECURITY DEFINER RPC
-- Uses UPSERT so it works whether or not the user row exists yet.
-- Bypasses RLS because SECURITY DEFINER runs as the DB owner.
-- Internally validates auth.uid() so users can only update their own row.
CREATE OR REPLACE FUNCTION public.set_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_auth_uid  UUID;
    v_clean     TEXT;
    v_existing  UUID;
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
    LIMIT  1;

    IF FOUND THEN
        RAISE EXCEPTION 'Username is already taken. Please choose another.';
    END IF;

    -- UPSERT: update if row exists, insert if not
    INSERT INTO public.users (auth_user_id, username, name, onboarding_complete)
    VALUES (v_auth_uid, v_clean, v_clean, true)
    ON CONFLICT (auth_user_id) DO UPDATE
        SET username            = EXCLUDED.username,
            name                = COALESCE(NULLIF(users.name, ''), EXCLUDED.name),
            onboarding_complete = true;

    RETURN 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_username(TEXT) TO authenticated;