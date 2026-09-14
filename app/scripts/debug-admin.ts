import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://boxuixgyxzbxdrvlevuu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveHVpeGd5eHpieGRydmxldnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTI2NDIsImV4cCI6MjA5Nzg4ODY0Mn0.ZyAIsgCALqauv1qr4BWu-LeYk8M5yNASgnV0rfioEPY'
);

async function debugAdmin() {
    // Get admin emails
    const { data: admins } = await supabase.from('admin_users').select('email');
    console.log('Admin emails:', admins?.map((a: any) => a.email));

    // Find users with admin emails
    const adminEmails = admins!.map((a: any) => a.email);
    
    for (const email of adminEmails) {
        const { data: users } = await supabase
            .from('users')
            .select('id, name, email, username, mobile, auth_user_id')
            .eq('email', email);
        
        console.log(`\nUsers with email "${email}":`, users);
    }

    // Also search by username for tanishk
    const { data: tanishk } = await supabase
        .from('users')
        .select('id, name, email, username, mobile, auth_user_id')
        .ilike('username', '%tanishk%');
    console.log('\nUsers with username containing "tanishk":', tanishk);

    // Search for rakshit
    const { data: rakshit } = await supabase
        .from('users')
        .select('id, name, email, username, mobile, auth_user_id')
        .ilike('name', '%rakshit%');
    console.log('\nUsers with name containing "rakshit":', rakshit);
    
    const { data: rakshit2 } = await supabase
        .from('users')
        .select('id, name, email, username, mobile, auth_user_id')
        .ilike('email', '%rakshit%');
    console.log('Users with email containing "rakshit":', rakshit2);
}

debugAdmin();
