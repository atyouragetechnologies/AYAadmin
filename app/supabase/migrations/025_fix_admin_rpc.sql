-- Fix admin access for all users
-- This updates the is_admin_user RPC to check both the users table and the admin_users table

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Check if the user has the is_admin flag directly
    SELECT 1 FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND is_admin = true
  ) OR EXISTS (
    -- Check if the user's auth email is in the admin_users table
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ) OR EXISTS (
    -- Check if the user's public email is in the admin_users table
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid()
    AND email IN (SELECT email FROM public.admin_users)
  );
$$;

-- Ensure all current admins in admin_users have their is_admin flag set in public.users
UPDATE public.users 
SET is_admin = true 
WHERE email IN (SELECT email FROM public.admin_users)
   OR auth_user_id IN (SELECT id FROM auth.users WHERE email IN (SELECT email FROM public.admin_users));
