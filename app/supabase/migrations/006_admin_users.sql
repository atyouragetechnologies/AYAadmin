CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow anyone authenticated to read their own record (or actually, we can just allow read to authenticated if it matches their email)
CREATE POLICY "Admins can read own record" ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- Insert the default founder admin
INSERT INTO admin_users (email) VALUES ('anitadhakad@gmail.com') ON CONFLICT DO NOTHING;
