import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://boxuixgyxzbxdrvlevuu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveHVpeGd5eHpieGRydmxldnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTI2NDIsImV4cCI6MjA5Nzg4ODY0Mn0.ZyAIsgCALqauv1qr4BWu-LeYk8M5yNASgnV0rfioEPY'
);

async function checkAdminUser() {
    const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, mobile, username, auth_user_id, is_admin')
        .or('mobile.eq.9111897728,mobile.eq.911189772865');
        
    console.log("User Rows:", users);
    
    // Also check how the adminCheck evaluates manually
    const { data: adminUsers } = await supabase
        .from('users')
        .select('*')
        .eq('is_admin', true);
        
    console.log("All Admins:", adminUsers?.map(u => ({ id: u.id, name: u.name, auth_user_id: u.auth_user_id, is_admin: u.is_admin })));
}

checkAdminUser();
