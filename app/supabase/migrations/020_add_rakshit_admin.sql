-- Add rakshit.shrivastava73@gmail.com as an admin
INSERT INTO admin_users (email) VALUES ('rakshit.shrivastava73@gmail.com') ON CONFLICT DO NOTHING;
