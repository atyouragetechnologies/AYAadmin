-- Migration 027: AYA Life-Navigation and Self-Discovery Schema
-- Supports Problem Check-ins, Story Metadata, Explainable Recommendations,
-- Reflections/Micro-actions, Search Demand Analytics, and Subscriptions.

-- 1. Problem Check-ins Table
CREATE TABLE IF NOT EXISTS public.problem_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    situation_text TEXT NOT NULL,
    situation_tags TEXT[] DEFAULT '{}',
    life_stage TEXT,
    feeling_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problem_checkins_user_id ON public.problem_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_problem_checkins_created_at ON public.problem_checkins(created_at DESC);

-- 2. Extended Story Metadata Table
CREATE TABLE IF NOT EXISTS public.story_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id TEXT NOT NULL UNIQUE,
    dilemma_type TEXT,
    life_theme TEXT,
    situational_tags TEXT[] DEFAULT '{}',
    protagonist_lens TEXT,
    historical_context TEXT,
    reflection_prompt TEXT,
    micro_action_prompt TEXT,
    is_premium BOOLEAN DEFAULT false,
    difficulty TEXT DEFAULT 'moderate',
    target_traits JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_metadata_scenario_id ON public.story_metadata(scenario_id);
CREATE INDEX IF NOT EXISTS idx_story_metadata_theme ON public.story_metadata(life_theme);

-- 3. Recommendation Logs Table (Explainability & ML readiness)
CREATE TABLE IF NOT EXISTS public.recommendation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    scenario_id TEXT NOT NULL,
    score NUMERIC,
    explanation TEXT,
    search_query TEXT,
    clicked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_logs_user ON public.recommendation_logs(user_id);

-- 4. Search Demand & Content Gap Analytics
CREATE TABLE IF NOT EXISTS public.search_demand_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    normalized_topic TEXT,
    match_count INTEGER DEFAULT 0,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_demand_created_at ON public.search_demand_analytics(created_at DESC);

-- 5. User Reflections & Micro-actions Table
CREATE TABLE IF NOT EXISTS public.reflections_and_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    scenario_id TEXT NOT NULL,
    decision_selected TEXT,
    dissonance_detected BOOLEAN DEFAULT false,
    dissonance_insight TEXT,
    micro_action_committed TEXT,
    action_completed BOOLEAN DEFAULT false,
    relevance_rating INTEGER,
    user_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reflections_user ON public.reflections_and_actions(user_id);

-- 6. User Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    tier TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

-- Enable RLS on all new tables
ALTER TABLE public.problem_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_demand_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections_and_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Problem Checkins: Users access own data
DROP POLICY IF EXISTS "problem_checkins_all" ON public.problem_checkins;
CREATE POLICY "problem_checkins_all" ON public.problem_checkins
    FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Story Metadata: Everyone can read, admins can modify
DROP POLICY IF EXISTS "story_metadata_select" ON public.story_metadata;
CREATE POLICY "story_metadata_select" ON public.story_metadata FOR SELECT USING (true);

DROP POLICY IF EXISTS "story_metadata_admin" ON public.story_metadata;
CREATE POLICY "story_metadata_admin" ON public.story_metadata
    FOR ALL USING (public.is_admin_user());

-- Recommendation Logs: Users access own data
DROP POLICY IF EXISTS "recommendation_logs_all" ON public.recommendation_logs;
CREATE POLICY "recommendation_logs_all" ON public.recommendation_logs
    FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Search Demand: Authenticated / anon can insert, admins can view
DROP POLICY IF EXISTS "search_demand_insert" ON public.search_demand_analytics;
CREATE POLICY "search_demand_insert" ON public.search_demand_analytics FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "search_demand_admin" ON public.search_demand_analytics;
CREATE POLICY "search_demand_admin" ON public.search_demand_analytics FOR SELECT USING (public.is_admin_user());

-- Reflections & Actions: Users access own data
DROP POLICY IF EXISTS "reflections_all" ON public.reflections_and_actions;
CREATE POLICY "reflections_all" ON public.reflections_and_actions
    FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Subscriptions: Users can read own subscription, admins can manage
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
CREATE POLICY "subscriptions_select" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "subscriptions_admin" ON public.subscriptions;
CREATE POLICY "subscriptions_admin" ON public.subscriptions
    FOR ALL USING (public.is_admin_user());
