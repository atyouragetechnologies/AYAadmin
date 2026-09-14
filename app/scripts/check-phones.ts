import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkPhones() {
    const { data: user1 } = await supabase.from('users').select('*').eq('mobile', '8103059448').maybeSingle();
    const { data: user2 } = await supabase.from('users').select('*').eq('mobile', '9111897728').maybeSingle();
    console.log("8103059448:", user1 ? "EXISTS" : "NOT FOUND");
    console.log("9111897728:", user2 ? "EXISTS" : "NOT FOUND");
}
checkPhones();
