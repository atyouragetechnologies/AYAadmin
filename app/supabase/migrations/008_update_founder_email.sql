-- Update founder email from anitadhakad@gmail.com to anitadhakad333@gmail.com
UPDATE admin_users SET email = 'anitadhakad333@gmail.com' WHERE email = 'anitadhakad@gmail.com';
-- Insert if it doesn't exist yet
INSERT INTO admin_users (email) VALUES ('anitadhakad333@gmail.com') ON CONFLICT DO NOTHING;
