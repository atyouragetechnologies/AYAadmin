import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://boxuixgyxzbxdrvlevuu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveHVpeGd5eHpieGRydmxldnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTI2NDIsImV4cCI6MjA5Nzg4ODY0Mn0.ZyAIsgCALqauv1qr4BWu-LeYk8M5yNASgnV0rfioEPY'
);

async function addUsernameAdmins() {
    // Add usernames of admin users to admin_users table
    // This allows the admin check to work for phone/username login users
    const usernames = ['tanishksuede2', 'rakshit'];
    
    for (const username of usernames) {
        const { data, error } = await supabase
            .from('admin_users')
            .insert({ email: username })
            .select();
        
        if (error) {
            console.log(`Username "${username}" - insert error: ${error.message}`);
            // Try upsert
            const { data: d2, error: e2 } = await supabase
                .from('admin_users')
                .upsert({ email: username }, { onConflict: 'email' })
                .select();
            if (e2) console.log(`  Upsert also failed: ${e2.message}`);
            else console.log(`  Upserted: ${JSON.stringify(d2)}`);
        } else {
            console.log(`Added username "${username}" to admin_users:`, data);
        }
    }
    
    // Show final state
    const { data: all } = await supabase.from('admin_users').select('*');
    console.log('\nFinal admin_users table:');
    all?.forEach((a: any) => console.log(`  - ${a.email}`));
}

addUsernameAdmins();
