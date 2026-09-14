import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://boxuixgyxzbxdrvlevuu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveHVpeGd5eHpieGRydmxldnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTI2NDIsImV4cCI6MjA5Nzg4ODY0Mn0.ZyAIsgCALqauv1qr4BWu-LeYk8M5yNASgnV0rfioEPY'
);

async function findAnitaByAuth() {
    // We can't query auth.users from client, so let's query all users in public.users to see if any have anita's name or something
    const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, mobile, username, auth_user_id, is_admin')
        .ilike('name', '%anita%');
        
    console.log("Anita Name Rows:", users);
    
    const { data: users2 } = await supabase
        .from('users')
        .select('id, name, email, mobile, username, auth_user_id, is_admin')
        .ilike('username', '%anita%');
        
    console.log("Anita Username Rows:", users2);
}

findAnitaByAuth();
