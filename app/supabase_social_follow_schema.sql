-- ============================================================
-- Complete Social Follow System & Auth-User Link Setup
-- Run this in your Supabase SQL Editor to enable Follows / Requests.
-- ============================================================

-- 1. Ensure auth_user_id column exists on public.users
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_auth_user_id
    ON public.users(auth_user_id);

-- 2. Create follow_requests Table
CREATE TABLE IF NOT EXISTS public.follow_requests (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at  TIMESTAMPTZ,

    CONSTRAINT no_self_follow_request CHECK (requester_id <> recipient_id),
    CONSTRAINT unique_follow_request UNIQUE (requester_id, recipient_id)
);

-- 3. Create follows Table
CREATE TABLE IF NOT EXISTS public.follows (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT no_self_follow CHECK (follower_id <> following_id),
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_follow_requests_requester ON public.follow_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_recipient ON public.follow_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_status    ON public.follow_requests(status);
CREATE INDEX IF NOT EXISTS idx_follows_follower  ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- 5. Enable Row Level Security
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows          ENABLE ROW LEVEL SECURITY;

-- 6. Helper Function: get_my_user_id()
-- Maps Supabase Auth JWT (auth.uid()) -> public.users.id
CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
    SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_user_id() TO authenticated, anon;

-- 7. Search Users RPC: search_users_by_username()
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

-- 8. Accept Follow Request RPC: accept_follow_request()
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
    v_my_user_id := public.get_my_user_id();

    IF v_my_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: no user found for this session';
    END IF;

    SELECT requester_id, recipient_id, status
    INTO   v_requester_id, v_recipient_id, v_status
    FROM   public.follow_requests
    WHERE  id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Follow request % not found', p_request_id;
    END IF;

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

    INSERT INTO public.follows (follower_id, following_id)
    VALUES (v_requester_id, v_recipient_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_follow_request(UUID) TO authenticated, anon;

-- 9. Reject Follow Request RPC: reject_follow_request()
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

GRANT EXECUTE ON FUNCTION public.reject_follow_request(UUID) TO authenticated, anon;

-- 10. RLS Policies
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;
CREATE POLICY "users_select_authenticated"
    ON public.users FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
    ON public.users FOR UPDATE TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "follow_requests_insert" ON public.follow_requests;
CREATE POLICY "follow_requests_insert"
    ON public.follow_requests FOR INSERT TO authenticated, anon
    WITH CHECK (requester_id = public.get_my_user_id());

DROP POLICY IF EXISTS "follow_requests_select" ON public.follow_requests;
CREATE POLICY "follow_requests_select"
    ON public.follow_requests FOR SELECT TO authenticated, anon
    USING (requester_id = public.get_my_user_id() OR recipient_id = public.get_my_user_id());

DROP POLICY IF EXISTS "follow_requests_update" ON public.follow_requests;
CREATE POLICY "follow_requests_update"
    ON public.follow_requests FOR UPDATE TO authenticated, anon
    USING (recipient_id = public.get_my_user_id()) WITH CHECK (recipient_id = public.get_my_user_id());

DROP POLICY IF EXISTS "follow_requests_delete" ON public.follow_requests;
CREATE POLICY "follow_requests_delete"
    ON public.follow_requests FOR DELETE TO authenticated, anon
    USING (requester_id = public.get_my_user_id() OR recipient_id = public.get_my_user_id());

DROP POLICY IF EXISTS "follows_select" ON public.follows;
CREATE POLICY "follows_select" ON public.follows FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "follows_delete" ON public.follows;
CREATE POLICY "follows_delete" ON public.follows FOR DELETE TO authenticated, anon
    USING (follower_id = public.get_my_user_id());
