import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export function SupabaseChecker() {
    const [status, setStatus] = useState<'checking' | 'ok' | 'error' | 'no-env'>('checking');
    const [details, setDetails] = useState('');

    useEffect(() => {
        const checkConnection = async () => {
            const url = import.meta.env.VITE_SUPABASE_URL;
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
            
            if (!url || !key || url === '' || key === '') {
                setStatus('no-env');
                setDetails('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in Environment Variables. Nothing will save.');
                return;
            }

            try {
                const { error } = await supabase.from('users').select('id, level_scores').limit(1);
                if (error) {
                    if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
                        setStatus('error');
                        setDetails(`Supabase API Key is invalid or expired. Error: ${error.message}`);
                    } else if (error.code === '42P01') {
                         setStatus('error');
                         setDetails(`Supabase connected, but users table is missing! Please run the SQL migrations.`);
                    } else if (error.code === '42703' || error.message?.includes('level_scores')) {
                         setStatus('error');
                         setDetails(`CRITICAL: The 'level_scores' column is missing from your users table! Please run the SQL migration to add it.`);
                    } else {
                        setStatus('error');
                        setDetails(`Supabase connected but returned error: ${error.message}`);
                    }
                } else {
                    setStatus('ok');
                }
            } catch (err: any) {
                setStatus('error');
                setDetails(`Network error connecting to Supabase: ${err.message}`);
            }
        };

        checkConnection();
    }, []);

    if (status === 'ok' || status === 'checking') return null;

    return (
        <div className="fixed top-0 left-0 w-full z-[9999] bg-red-600 text-white p-4 text-center font-bold shadow-xl">
            <h3 className="text-xl mb-1">⚠️ DATABASE CONNECTION FAILED</h3>
            <p className="text-sm opacity-90">{details}</p>
        </div>
    );
}
