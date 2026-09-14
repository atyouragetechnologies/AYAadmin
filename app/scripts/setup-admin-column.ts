import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://boxuixgyxzbxdrvlevuu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveHVpeGd5eHpieGRydmxldnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTI2NDIsImV4cCI6MjA5Nzg4ODY0Mn0.ZyAIsgCALqauv1qr4BWu-LeYk8M5yNASgnV0rfioEPY'
);

async function setupAdminColumn() {
    console.log('=== Setting up is_admin column on users table ===\n');

    // Step 1: Get the admin emails from admin_users table
    const { data: admins, error: adminErr } = await supabase
        .from('admin_users')
        .select('email');
    
    if (adminErr) {
        console.error('Failed to fetch admin_users:', adminErr.message);
        return;
    }
    
    const adminEmails = admins!.map((a: any) => a.email);
    console.log('Admin emails from admin_users table:', adminEmails);

    // Step 2: Try to add is_admin column via RPC/raw query
    // Since we can't run ALTER TABLE with the anon key, we'll use the update approach
    // The column might already exist or need to be added via Supabase dashboard
    
    // Step 3: Find users that match admin emails and set is_admin = true
    // First, get all users
    const { data: allUsers, error: usersErr } = await supabase
        .from('users')
        .select('id, email, auth_user_id, username, name');
    
    if (usersErr) {
        console.error('Failed to fetch users:', usersErr.message);
        return;
    }

    console.log(`\nTotal users: ${allUsers!.length}`);
    
    // Check if is_admin column exists by trying to select it
    const { data: testRow, error: testErr } = await supabase
        .from('users')
        .select('is_admin')
        .limit(1);
    
    if (testErr) {
        console.log('\n⚠️  is_admin column does NOT exist yet on users table.');
        console.log('You need to run this SQL in Supabase Dashboard SQL Editor:\n');
        console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;');
        console.log('\nThen re-run this script.\n');
        
        // Try to add it via RPC
        console.log('Attempting to add column via RPC...');
        const { error: rpcErr } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;'
        });
        if (rpcErr) {
            console.log('RPC not available:', rpcErr.message);
            console.log('\n>>> Please add the column manually in Supabase SQL Editor <<<');
        } else {
            console.log('Column added successfully via RPC!');
        }
        return;
    }
    
    console.log('✓ is_admin column exists on users table');

    // Match users by email
    for (const adminEmail of adminEmails) {
        // Find matching user rows
        const matchingUsers = allUsers!.filter((u: any) => u.email === adminEmail);
        
        for (const user of matchingUsers) {
            const { error: updateErr } = await supabase
                .from('users')
                .update({ is_admin: true })
                .eq('id', user.id);
            
            if (updateErr) {
                console.error(`  Failed to update user ${user.id} (${user.email}):`, updateErr.message);
            } else {
                console.log(`  ✓ Set is_admin=true for: ${user.name} (${user.email}, id: ${user.id})`);
            }
        }
        
        if (matchingUsers.length === 0) {
            console.log(`  ⚠ No user row found with email: ${adminEmail}`);
        }
    }

    // Verify
    const { data: adminUsers } = await supabase
        .from('users')
        .select('id, name, email, username, is_admin')
        .eq('is_admin', true);
    
    console.log('\n=== Users with is_admin=true ===');
    console.log(adminUsers);
    
    // Also show admin_users table
    console.log('\n=== admin_users table ===');
    console.log(admins);
}

setupAdminColumn();
