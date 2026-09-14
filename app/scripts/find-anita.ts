import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://boxuixgyxzbxdrvlevuu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveHVpeGd5eHpieGRydmxldnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTI2NDIsImV4cCI6MjA5Nzg4ODY0Mn0.ZyAIsgCALqauv1qr4BWu-LeYk8M5yNASgnV0rfioEPY'
);

async function findAnita() {
    const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, mobile, username, auth_user_id, is_admin')
        .eq('email', 'anitadhakad333@gmail.com');
        
    console.log("Anita Rows:", users);
    
    // Also, try to find anita by auth.users using an RPC or something if we can't find her in public.users
}

findAnita();
