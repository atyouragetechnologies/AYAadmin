-- ============================================================
-- AYA Daily Story Quota System — Full Migration
-- Run this once in the Supabase SQL Editor.
-- Fully idempotent: safe to re-run on an existing database.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. app_config — runtime settings (no deploy required)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_config (
    key          TEXT        PRIMARY KEY,
    value        JSONB       NOT NULL,
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by   UUID        REFERENCES public.users(id) ON DELETE SET NULL
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Admins can read and write config
DROP POLICY IF EXISTS "Admin users can read app_config"   ON public.app_config;
DROP POLICY IF EXISTS "Admin users can write app_config"  ON public.app_config;

CREATE POLICY "Admin users can read app_config"
    ON public.app_config FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.email = auth.email()
        )
    );

CREATE POLICY "Admin users can write app_config"
    ON public.app_config FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.email = auth.email()
        )
    );

-- Seed default values (INSERT … ON CONFLICT DO NOTHING = safe re-run)
INSERT INTO public.app_config (key, value) VALUES
    ('daily_quota_enabled',    'true'::jsonb),
    ('daily_quota_limit',      '2'::jsonb),
    ('premium_bypass_enabled', 'true'::jsonb),
    ('quota_reset_hour_utc',   '0'::jsonb)
ON CONFLICT (key) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 2. user_daily_quota — one row per user per UTC calendar day
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_daily_quota (
    user_id          UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    quota_date       DATE        NOT NULL,   -- always UTC, server-assigned
    stories_played   INT         NOT NULL DEFAULT 0,
    story_ids_played UUID[]      NOT NULL DEFAULT '{}',
    last_played_at   TIMESTAMP WITH TIME ZONE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (user_id, quota_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_quota_date
    ON public.user_daily_quota (quota_date);

CREATE INDEX IF NOT EXISTS idx_user_daily_quota_user
    ON public.user_daily_quota (user_id, quota_date DESC);

ALTER TABLE public.user_daily_quota ENABLE ROW LEVEL SECURITY;

-- Users can read their own quota row
DROP POLICY IF EXISTS "Users can read own quota"   ON public.user_daily_quota;
DROP POLICY IF EXISTS "Service role manages quota" ON public.user_daily_quota;

CREATE POLICY "Users can read own quota"
    ON public.user_daily_quota FOR SELECT
    USING (auth.uid() = user_id);

-- Service role (used by API functions) has full access — no RLS restriction needed
-- The API layer enforces JWT verification before any write


-- ────────────────────────────────────────────────────────────
-- 3. Alter users — add daily_quota_override column
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name  = 'users'
          AND column_name = 'daily_quota_override'
    ) THEN
        ALTER TABLE public.users
            ADD COLUMN daily_quota_override INT DEFAULT NULL;

        COMMENT ON COLUMN public.users.daily_quota_override IS
            'NULL = use global app_config daily_quota_limit. '
            '-1 = unlimited. 0 = fully blocked. 1-20 = personal cap.';
    END IF;
END $$;


-- ────────────────────────────────────────────────────────────
-- 4. admin_audit_log — tracks admin actions for accountability
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    action          TEXT        NOT NULL,           -- e.g. 'quota_reset', 'config_update'
    target_user_id  UUID        REFERENCES public.users(id) ON DELETE SET NULL,
    performed_by    UUID        REFERENCES public.users(id) ON DELETE SET NULL,
    payload         JSONB,                          -- before/after values or action details
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action
    ON public.admin_audit_log (action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target
    ON public.admin_audit_log (target_user_id, created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users can read audit log"   ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admin users can insert audit log" ON public.admin_audit_log;

CREATE POLICY "Admin users can read audit log"
    ON public.admin_audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.email = auth.email()
        )
    );

CREATE POLICY "Admin users can insert audit log"
    ON public.admin_audit_log FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.email = auth.email()
        )
    );


-- ────────────────────────────────────────────────────────────
-- 5. Helper function — consume one quota slot atomically
--    Called by /api/consume-quota via service role.
--    Returns the updated row.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.consume_quota_slot(
    p_user_id  UUID,
    p_story_id UUID
)
RETURNS TABLE (
    stories_played   INT,
    story_ids_played UUID[],
    already_counted  BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER   -- runs as owner (service role), bypasses RLS
AS $$
DECLARE
    v_today       DATE := (NOW() AT TIME ZONE 'UTC')::DATE;
    v_existing    public.user_daily_quota;
BEGIN
    -- Fetch today's row if it exists
    SELECT * INTO v_existing
    FROM public.user_daily_quota
    WHERE user_daily_quota.user_id    = p_user_id
      AND user_daily_quota.quota_date = v_today;

    -- If story was already counted today, return without incrementing (idempotent)
    IF v_existing IS NOT NULL AND p_story_id = ANY(v_existing.story_ids_played) THEN
        RETURN QUERY SELECT
            v_existing.stories_played,
            v_existing.story_ids_played,
            TRUE;
        RETURN;
    END IF;

    -- Upsert: increment counter and append story_id
    INSERT INTO public.user_daily_quota
        (user_id, quota_date, stories_played, story_ids_played, last_played_at)
    VALUES
        (p_user_id, v_today, 1, ARRAY[p_story_id], NOW())
    ON CONFLICT (user_id, quota_date) DO UPDATE SET
        stories_played   = public.user_daily_quota.stories_played + 1,
        story_ids_played = public.user_daily_quota.story_ids_played || p_story_id,
        last_played_at   = NOW()
    RETURNING
        public.user_daily_quota.stories_played,
        public.user_daily_quota.story_ids_played,
        FALSE
    INTO stories_played, story_ids_played, already_counted;

    RETURN NEXT;
END;
$$;


-- ────────────────────────────────────────────────────────────
-- 6. Helper view — admin quota stats for today
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.v_quota_stats_today AS
SELECT
    COUNT(*)                                          AS total_active_today,
    COUNT(*) FILTER (
        WHERE udq.stories_played >= (
            SELECT (ac.value::INT)
            FROM   public.app_config ac
            WHERE  ac.key = 'daily_quota_limit'
        )
    )                                                 AS exhausted_count,
    COUNT(*) FILTER (
        WHERE udq.stories_played > 0
          AND udq.stories_played < (
            SELECT (ac.value::INT)
            FROM   public.app_config ac
            WHERE  ac.key = 'daily_quota_limit'
        )
    )                                                 AS partial_count,
    ROUND(AVG(udq.stories_played)::NUMERIC, 2)        AS avg_stories_played
FROM public.user_daily_quota udq
WHERE udq.quota_date = (NOW() AT TIME ZONE 'UTC')::DATE;


-- ────────────────────────────────────────────────────────────
-- 7. Optional: pg_cron job for quota-reset notifications
--    Uncomment if pg_cron extension is enabled in your project.
--    Supabase Dashboard → Database → Extensions → pg_cron
-- ────────────────────────────────────────────────────────────

-- SELECT cron.schedule(
--     'aya-quota-reset-notify',           -- job name
--     '5 0 * * *',                        -- 00:05 UTC every day
--     $$
--         SELECT net.http_post(
--             url     := 'https://your-deployment-url.com/api/send-quota-reset-notifications',
--             headers := '{"Content-Type": "application/json"}'::jsonb,
--             body    := json_build_object(
--                 'adminSecret', current_setting('app.quota_notify_secret')
--             )::text
--         );
--     $$
-- );


-- ────────────────────────────────────────────────────────────
-- 8. Verification — run this block to confirm everything landed
-- ────────────────────────────────────────────────────────────
DO $$
DECLARE
    t TEXT;
    tables_ok BOOLEAN := TRUE;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'app_config',
        'user_daily_quota',
        'admin_audit_log'
    ]
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = t
        ) THEN
            RAISE WARNING 'MISSING TABLE: %', t;
            tables_ok := FALSE;
        END IF;
    END LOOP;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'daily_quota_override'
    ) THEN
        RAISE WARNING 'MISSING COLUMN: users.daily_quota_override';
        tables_ok := FALSE;
    END IF;

    IF tables_ok THEN
        RAISE NOTICE '✓ AYA Daily Quota migration completed successfully.';
        RAISE NOTICE '✓ app_config seeded with % rows.', (SELECT COUNT(*) FROM public.app_config);
        RAISE NOTICE '✓ consume_quota_slot() function ready.';
        RAISE NOTICE '✓ v_quota_stats_today view ready.';
    END IF;
END $$;
