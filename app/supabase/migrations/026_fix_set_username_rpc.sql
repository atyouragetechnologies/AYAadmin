-- Migration 026: Fix set_username RPC and ensure unique index on auth_user_id

-- 1. Ensure unique index on auth_user_id
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_user_id_key ON public.users(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- 2. Update set_username SECURITY DEFINER RPC to support age, mobile, and safe update/insert
CREATE OR REPLACE FUNCTION public.set_username(
    p_username TEXT,
    p_age INTEGER DEFAULT NULL,
    p_mobile TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS 
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
;

GRANT EXECUTE ON FUNCTION public.set_username(TEXT, INTEGER, TEXT) TO authenticated;

-- Backwards-compatible 1-arg wrapper
CREATE OR REPLACE FUNCTION public.set_username(p_username TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS 
    SELECT public.set_username(p_username, NULL, NULL);
;

GRANT EXECUTE ON FUNCTION public.set_username(TEXT) TO authenticated;
