-- Fix: Disable RLS on admin_users to match the rest of the app
-- (The app uses anon key without persistent Supabase auth sessions)
ALTER TABLE IF EXISTS admin_users DISABLE ROW LEVEL SECURITY;

-- Also add an id column if it doesn't exist (needed for admin management UI)
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
