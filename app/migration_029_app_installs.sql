-- Migration 029: App Installations & PWA Adoption Tracking
-- Run this in Supabase SQL Editor if you want the dedicated app_installs table.
-- Note: The application also logs to journey_events and users automatically.

CREATE TABLE IF NOT EXISTS public.app_installs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    visitor_id TEXT,
    platform TEXT, -- 'ios' | 'android' | 'windows' | 'mac' | 'other'
    browser TEXT,  -- 'chrome' | 'safari' | 'edge' | 'firefox' | 'other'
    device_type TEXT, -- 'mobile' | 'tablet' | 'desktop'
    install_method TEXT, -- 'native_prompt' | 'ios_guide' | 'desktop_guide' | 'android_guide' | 'standalone_verified'
    is_standalone BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT false,
    user_agent TEXT,
    screen_size TEXT,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_installs_platform ON public.app_installs(platform);
CREATE INDEX IF NOT EXISTS idx_app_installs_user ON public.app_installs(user_id);
CREATE INDEX IF NOT EXISTS idx_app_installs_visitor ON public.app_installs(visitor_id);
CREATE INDEX IF NOT EXISTS idx_app_installs_created ON public.app_installs(installed_at DESC);

ALTER TABLE public.app_installs DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.app_installs TO anon, authenticated, service_role;
