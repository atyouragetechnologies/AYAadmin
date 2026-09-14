-- ============================================================
-- Migration 012: Link public.users to Supabase auth.users
-- ============================================================
-- Adds auth_user_id column so mobile/phone users who are
-- migrated to Supabase Auth email/password can be correlated
-- back to their existing public.users row.
--
-- public.users.id remains unchanged — all foreign keys
-- (follow_requests, follows, personality_profiles, etc.) are
-- NOT affected.
--
-- auth_user_id = auth.users.id (UUID from Supabase Auth JWT)
-- This is the value returned by auth.uid() after sign-in.
-- ============================================================

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_auth_user_id
    ON public.users(auth_user_id);

COMMENT ON COLUMN public.users.auth_user_id IS
    'UUID from auth.users — set when user authenticates via Supabase Auth. '
    'Used by RLS policies and SECURITY DEFINER RPCs via auth.uid(). '
    'NULL for legacy rows not yet migrated to Supabase Auth.';

-- ── RLS: Allow authenticated users to read public user profiles ──────────────
-- (Follow status lookups need to read username/name for other users)

-- Drop old blanket anon policy if it existed
DROP POLICY IF EXISTS "users_select_public" ON public.users;

-- All authenticated users may read id, username, name (public social profile)
CREATE POLICY "users_select_authenticated"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

-- A user may update their own row only (uses auth_user_id = auth.uid())
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- ── search_users_by_username: updated to use auth_user_id ───────────────────
-- Re-create the search RPC to exclude caller by auth_user_id, not users.id,
-- because auth.uid() corresponds to auth_user_id (not users.id for mobile users).

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
    ORDER BY LOWER(u.username)
    LIMIT 20;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_users_by_username(TEXT) TO authenticated, anon;

-- ── follow_requests RLS: use auth_user_id for caller matching ────────────────
-- The requester_id / recipient_id in follow_requests refers to public.users.id,
-- NOT auth.uid(). We need a helper function to get the public.users.id from
-- auth.uid() (via auth_user_id column).

CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
    SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_user_id() TO authenticated;

-- ── Update RLS policies on follow_requests to use get_my_user_id() ───────────

-- INSERT: requester must be the calling user
DROP POLICY IF EXISTS "follow_requests_insert" ON public.follow_requests;
CREATE POLICY "follow_requests_insert"
    ON public.follow_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = public.get_my_user_id());

-- SELECT: either party can see their requests
DROP POLICY IF EXISTS "follow_requests_select" ON public.follow_requests;
CREATE POLICY "follow_requests_select"
    ON public.follow_requests
    FOR SELECT
    TO authenticated
    USING (
        requester_id = public.get_my_user_id()
        OR recipient_id = public.get_my_user_id()
    );

-- UPDATE: only recipient can accept/reject
DROP POLICY IF EXISTS "follow_requests_update" ON public.follow_requests;
CREATE POLICY "follow_requests_update"
    ON public.follow_requests
    FOR UPDATE
    TO authenticated
    USING (recipient_id = public.get_my_user_id())
    WITH CHECK (recipient_id = public.get_my_user_id());

-- DELETE: requester or recipient can delete
DROP POLICY IF EXISTS "follow_requests_delete" ON public.follow_requests;
CREATE POLICY "follow_requests_delete"
    ON public.follow_requests
    FOR DELETE
    TO authenticated
    USING (
        requester_id = public.get_my_user_id()
        OR recipient_id = public.get_my_user_id()
    );

-- ── Update RLS policies on follows to use get_my_user_id() ──────────────────

DROP POLICY IF EXISTS "follows_select" ON public.follows;
CREATE POLICY "follows_select"
    ON public.follows
    FOR SELECT
    TO authenticated
    USING (true);

-- NO INSERT policy — only accept_follow_request() SECURITY DEFINER inserts
DROP POLICY IF EXISTS "follows_insert" ON public.follows;

DROP POLICY IF EXISTS "follows_delete" ON public.follows;
CREATE POLICY "follows_delete"
    ON public.follows
    FOR DELETE
    TO authenticated
    USING (follower_id = public.get_my_user_id());

-- ── Update accept_follow_request to use get_my_user_id() ────────────────────

CREATE OR REPLACE FUNCTION public.accept_follow_request(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_requester_id UUID;
    v_recipient_id UUID;
    v_status       TEXT;
    v_my_user_id   UUID;
BEGIN
    -- Resolve calling user's public.users.id from auth session
    v_my_user_id := public.get_my_user_id();

    IF v_my_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: no user found for this session';
    END IF;

    -- Lock the request row
    SELECT requester_id, recipient_id, status
    INTO   v_requester_id, v_recipient_id, v_status
    FROM   public.follow_requests
    WHERE  id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Follow request % not found', p_request_id;
    END IF;

    -- Only the recipient may accept
    IF v_recipient_id <> v_my_user_id THEN
        RAISE EXCEPTION 'Only the recipient can accept a follow request';
    END IF;

    IF v_status <> 'pending' THEN
        RAISE EXCEPTION 'Follow request is not pending (status: %)', v_status;
    END IF;

    UPDATE public.follow_requests
    SET    status       = 'accepted',
           responded_at = NOW()
    WHERE  id = p_request_id;

    -- Insert follow relationship (only this SECURITY DEFINER function may do this)
    INSERT INTO public.follows (follower_id, following_id)
    VALUES (v_requester_id, v_recipient_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_follow_request(UUID) TO authenticated;

-- ── Update reject_follow_request to use get_my_user_id() ────────────────────

CREATE OR REPLACE FUNCTION public.reject_follow_request(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_recipient_id UUID;
    v_status       TEXT;
    v_my_user_id   UUID;
BEGIN
    v_my_user_id := public.get_my_user_id();

    IF v_my_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: no user found for this session';
    END IF;

    SELECT recipient_id, status
    INTO   v_recipient_id, v_status
    FROM   public.follow_requests
    WHERE  id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Follow request % not found', p_request_id;
    END IF;

    IF v_recipient_id <> v_my_user_id THEN
        RAISE EXCEPTION 'Only the recipient can reject a follow request';
    END IF;

    IF v_status <> 'pending' THEN
        RAISE EXCEPTION 'Follow request is not pending (status: %)', v_status;
    END IF;

    UPDATE public.follow_requests
    SET    status       = 'rejected',
           responded_at = NOW()
    WHERE  id = p_request_id;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reject_follow_request(UUID) TO authenticated;
