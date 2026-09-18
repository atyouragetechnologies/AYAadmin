/**
 * FirebaseChecker.tsx (formerly SupabaseChecker)
 *
 * Checks Firebase/Firestore connectivity at startup and shows a banner if failed.
 * Replaces the old Supabase connectivity checker.
 */
import { useEffect, useState } from 'react';
import { db } from '../lib/firestore';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export function SupabaseChecker() {
    const [status, setStatus] = useState<'checking' | 'ok' | 'error' | 'no-env'>('checking');
    const [details, setDetails] = useState('');

    useEffect(() => {
        const checkConnection = async () => {
            const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

            if (!projectId) {
                setStatus('no-env');
                setDetails('VITE_FIREBASE_PROJECT_ID is missing in Environment Variables. Firestore will not work.');
                return;
            }

            try {
                // Try reading one doc from the users collection to verify connectivity
                await getDocs(query(collection(db, 'users'), limit(1)));
                setStatus('ok');
            } catch (err: any) {
                setStatus('error');
                setDetails(`Firebase/Firestore connection failed: ${err.message}`);
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
