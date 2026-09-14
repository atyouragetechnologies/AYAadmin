-- Add is_admin column to users table (backend-driven admin check)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set is_admin = true for users whose email matches the admin_users table
UPDATE users
SET is_admin = true
WHERE email IN (SELECT email FROM admin_users);

-- Also match by auth_user_id -> auth.users.email
UPDATE users
SET is_admin = true
WHERE auth_user_id IN (
    SELECT id FROM auth.users WHERE email IN (SELECT email FROM admin_users)
);
