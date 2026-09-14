-- Migration 028: Story Requests & Content Demand Signals
-- Captures user requests when no matching story exists for a selected situation.
-- Provides demand analytics for admins to prioritize new story authoring.

CREATE TABLE IF NOT EXISTS public.story_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    requested_tag TEXT NOT NULL,
    requested_problem TEXT,
    requested_age INTEGER,
    status TEXT DEFAULT 'active', -- 'active' | 'notified' | 'dismissed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_story_requests_tag ON public.story_requests(requested_tag);
CREATE INDEX IF NOT EXISTS idx_story_requests_age ON public.story_requests(requested_age);
CREATE INDEX IF NOT EXISTS idx_story_requests_user ON public.story_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_story_requests_created_at ON public.story_requests(created_at DESC);

-- Enable access
ALTER TABLE public.story_requests DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.story_requests TO anon, authenticated, service_role;
