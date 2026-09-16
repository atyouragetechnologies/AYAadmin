-- Migration: Push Notifications FCM Support & History
-- Add FCM token column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'fcm_token'
    ) THEN
        ALTER TABLE public.users ADD COLUMN fcm_token TEXT;
        CREATE INDEX IF NOT EXISTS idx_users_fcm_token ON public.users(fcm_token);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'fcm_token_updated_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN fcm_token_updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create notification_history table for admin broadcast tracking
CREATE TABLE IF NOT EXISTS public.notification_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    target_platform TEXT DEFAULT 'both',
    sent_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read notification history"
    ON public.notification_history FOR SELECT
    USING ( EXISTS (
        SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.email()
    ));

CREATE POLICY "Admin users can insert notification history"
    ON public.notification_history FOR INSERT
    WITH CHECK ( EXISTS (
        SELECT 1 FROM public.admin_users WHERE admin_users.email = auth.email()
    ));
