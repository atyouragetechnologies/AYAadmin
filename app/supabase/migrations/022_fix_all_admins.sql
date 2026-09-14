-- Update public.users for any auth.users that have admin emails
UPDATE public.users 
SET is_admin = true 
WHERE auth_user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN (
        'anitadhakad333@gmail.com', 
        'tanishksocials@hotmail.com', 
        'tanishkproductivity@gmail.com',
        'rakshit.shrivastava73@gmail.com',
        'dhairya185@gmail.com'
    )
);
