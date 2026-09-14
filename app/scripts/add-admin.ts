import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://boxuixgyxzbxdrvlevuu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveHVpeGd5eHpieGRydmxldnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTI2NDIsImV4cCI6MjA5Nzg4ODY0Mn0.ZyAIsgCALqauv1qr4BWu-LeYk8M5yNASgnV0rfioEPY'
);

async function addAdmin() {
    const email = 'rakshit.shrivastava73@gmail.com';
    
    // Insert into admin_users
    const { data, error } = await supabase
        .from('admin_users')
        .upsert({ email }, { onConflict: 'email' })
        .select();

    if (error) {
        console.error('Error adding admin:', error.message);
        // Try insert if upsert fails (might not have unique constraint on email)
        const { data: data2, error: error2 } = await supabase
            .from('admin_users')
            .insert({ email })
            .select();
        if (error2) {
            console.error('Insert also failed:', error2.message);
        } else {
            console.log('Admin added via insert:', data2);
        }
    } else {
        console.log('Admin added:', data);
    }
    
    // Verify
    const { data: admins } = await supabase.from('admin_users').select('*');
    console.log('Current admins:', admins);
}

addAdmin();
