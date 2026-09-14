-- ============================================================
-- AYA Push Subscription Table — Production-Ready Schema Patch
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/boxuixgyxzbxdrvlevuu/editor
-- ============================================================

-- 1. Ensure the push_subscriptions table exists with correct schema
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Add updated_at column if it doesn't exist (for environments using older schema)
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

-- 3. Ensure RLS is enabled
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Drop conflicting old policies if they exist and recreate permissive ones
--    (service-role bypasses RLS anyway, but anon key needs SELECT/INSERT)
DO $$
BEGIN
  -- Drop old restrictive policies that block anon access
  DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;
  DROP POLICY IF EXISTS "Users can access own push subscriptions" ON public.push_subscriptions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 5. Create permissive policies (server-side service role bypasses RLS)
CREATE POLICY "Allow service role insert" ON public.push_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role select" ON public.push_subscriptions
  FOR SELECT USING (true);

CREATE POLICY "Allow service role update" ON public.push_subscriptions
  FOR UPDATE USING (true);

CREATE POLICY "Allow service role delete" ON public.push_subscriptions
  FOR DELETE USING (true);

-- 6. Create or replace the updated_at trigger
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Verification: Check current table status
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(user_id) as with_user_id
FROM public.push_subscriptions;
