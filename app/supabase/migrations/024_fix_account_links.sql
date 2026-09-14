-- STEP 1: Get the exact auth user IDs for both Google emails
DO $$ 
DECLARE
    anita_auth_id UUID;
    rakshit_auth_id UUID;
    anita_phone_id UUID;
    rakshit_phone_id UUID;
    rakshit_email TEXT := 'REPLACE_WITH_RAKSHITS_EMAIL@gmail.com'; -- <--- CHANGE THIS TO HIS EXACT EMAIL
BEGIN
    -- 1. Find the Auth IDs from Google Logins
    SELECT id INTO anita_auth_id FROM auth.users WHERE email = 'anitadhakad333@gmail.com' LIMIT 1;
    SELECT id INTO rakshit_auth_id FROM auth.users WHERE email = rakshit_email LIMIT 1;
    
    -- 2. Find the User Profiles for the phone numbers
    SELECT id INTO anita_phone_id FROM public.users WHERE mobile = '8103059448' LIMIT 1;
    SELECT id INTO rakshit_phone_id FROM public.users WHERE mobile = '9111897728' LIMIT 1;
    
    -- 3. Clear any existing incorrect links on these two phone numbers to prevent unique constraint errors
    UPDATE public.users SET auth_user_id = null, email = null WHERE id IN (anita_phone_id, rakshit_phone_id);

    -- 4. Link Anita's profile (8103059448) to her Google Email
    IF anita_auth_id IS NOT NULL AND anita_phone_id IS NOT NULL THEN
        UPDATE public.users 
        SET auth_user_id = anita_auth_id, email = 'anitadhakad333@gmail.com'
        WHERE id = anita_phone_id;
    END IF;

    -- 5. Link Rakshit's profile (9111897728) to his Google Email
    IF rakshit_auth_id IS NOT NULL AND rakshit_phone_id IS NOT NULL THEN
        UPDATE public.users 
        SET auth_user_id = rakshit_auth_id, email = rakshit_email
        WHERE id = rakshit_phone_id;
    END IF;
END $$;
