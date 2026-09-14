-- Run this inside your Supabase Project's SQL Editor to enable the new XP level system!
-- We decided to use the `personality_profiles` table since the game already fetches and updates traits there.

ALTER TABLE public.personality_profiles 
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

ALTER TABLE public.personality_profiles 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

ALTER TABLE public.personality_profiles 
ADD COLUMN IF NOT EXISTS stories_completed INTEGER DEFAULT 0;

-- Daily Challenge and Streak System
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_date DATE,
ADD COLUMN IF NOT EXISTS daily_challenge_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS daily_challenge_personality TEXT;

-- Push Subscriptions Table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert" ON push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select" ON push_subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow delete" ON push_subscriptions FOR DELETE USING (true);

