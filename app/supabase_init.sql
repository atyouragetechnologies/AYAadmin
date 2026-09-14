-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO CREATE ALL REQUIRED TABLES

-- 1. Create the Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID,
  mobile TEXT,
  email TEXT,
  username TEXT,
  name TEXT,
  age INTEGER,
  access_type TEXT,
  access_start_date DATE,
  preferred_theme TEXT,
  preferred_map TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  stories_completed INTEGER DEFAULT 0,
  story_count INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  daily_challenge_completed BOOLEAN DEFAULT false,
  daily_challenge_personality TEXT,
  daily_struggle TEXT,
  last_struggle_update TIMESTAMP WITH TIME ZONE,
  level_scores JSONB DEFAULT '{}'::jsonb,
  onboarding_scores JSONB,
  gameplay_scores JSONB,
  onboarding_complete BOOLEAN DEFAULT false,
  assessment_completed BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the Personality Profiles table
CREATE TABLE IF NOT EXISTS public.personality_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  mobile TEXT,
  trait_risk_taker INTEGER DEFAULT 50,
  trait_creative INTEGER DEFAULT 50,
  trait_analytical INTEGER DEFAULT 50,
  trait_social INTEGER DEFAULT 50,
  trait_ambitious INTEGER DEFAULT 50,
  future_archetype TEXT,
  future_archetype_score NUMERIC,
  interest_goal TEXT,
  interest_struggle TEXT,
  interest_domain TEXT,
  life_resilience INTEGER DEFAULT 50,
  life_discipline INTEGER DEFAULT 50,
  life_courage INTEGER DEFAULT 50,
  life_creativity INTEGER DEFAULT 50,
  life_emotional_control INTEGER DEFAULT 50,
  life_leadership INTEGER DEFAULT 50,
  life_risk_intelligence INTEGER DEFAULT 50,
  life_consistency INTEGER DEFAULT 50,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  stories_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create the Quiz Responses table
CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  responses JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create the Game Sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  scenario_id TEXT,
  level_id TEXT,
  selected_personality TEXT,
  match_score INTEGER,
  stars INTEGER,
  score INTEGER,
  feedback TEXT,
  traits_impact JSONB,
  choices_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Push Subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS) and define access policies.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update their own profile
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id OR auth.uid() = auth_user_id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id OR auth.uid() = auth_user_id);
CREATE POLICY "Users can insert own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() = auth_user_id);

-- Similar policies for other tables
CREATE POLICY "Users can access own personality" ON public.personality_profiles FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can access own quiz responses" ON public.quiz_responses FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can access own game sessions" ON public.game_sessions FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can access own push subscriptions" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id OR user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
