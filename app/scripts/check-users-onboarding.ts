import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function fixOnboarding() {
    const { data: users, error } = await supabase.from('users').select('id, name, username, onboarding_complete, total_xp, stories_completed, level, assessment_completed').limit(10);
    console.log(users);
}
fixOnboarding();
