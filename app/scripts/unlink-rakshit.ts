import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'https://boxuixgyxzbxdrvlevuu.supabase.co',
    process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveHVpeGd5eHpieGRydmxldnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTI2NDIsImV4cCI6MjA5Nzg4ODY0Mn0.ZyAIsgCALqauv1qr4BWu-LeYk8M5yNASgnV0rfioEPY'
);

async function unlinkGoogleFromRakshit() {
    // We update the Rakshit profile to remove the auth_user_id and email that was linked
    const { data, error } = await supabase
        .from('users')
        .update({ 
            auth_user_id: null,
            email: null 
        })
        .eq('mobile', '9111897728')
        .select();

    console.log("Unlinked!", data, error);
}

unlinkGoogleFromRakshit();
