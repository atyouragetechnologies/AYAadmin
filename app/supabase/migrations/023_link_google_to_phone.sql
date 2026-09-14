-- Get the auth ID for the google account
DO $$ 
DECLARE
    google_auth_id UUID;
    phone_user_id UUID;
BEGIN
    -- 1. Find Google auth ID
    SELECT id INTO google_auth_id FROM auth.users WHERE email = 'anitadhakad333@gmail.com';
    
    -- 2. Find phone user ID in public.users
    SELECT id INTO phone_user_id FROM public.users WHERE mobile = '9111897728' LIMIT 1;
    
    -- 3. Update public.users to link them!
    IF google_auth_id IS NOT NULL AND phone_user_id IS NOT NULL THEN
        UPDATE public.users 
        SET auth_user_id = google_auth_id,
            email = 'anitadhakad333@gmail.com'
        WHERE id = phone_user_id;
    END IF;
END $$;
