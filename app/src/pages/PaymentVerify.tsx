import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { CheckCircle, XCircle } from 'lucide-react';
import { audioManager } from '../utils/audioManager';
import { MascotLoader } from '../components/ui/MascotLoader';

export function PaymentVerify() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('order_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Use a ref to prevent double-firing in strict mode
    const hasVerified = useRef(false);
    
    // We update the local state using the store, then sync it
    const profile = useUserStore(state => state.profile);
    const setProfile = useUserStore(state => state.setProfile);

    useEffect(() => {
        if (!orderId) {
            setStatus('error');
            setErrorMessage('No order ID found in the URL.');
            return;
        }

        if (hasVerified.current) return;
        hasVerified.current = true;

        const verifyOrder = async () => {
            try {
                const response = await fetch('/api/verify-cashfree-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: orderId })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Verification failed');
                }

                if (data.success && data.status === 'PAID') {
                    // Payment succeeded! Update local state
                    if (profile) {
                        const today = new Date().toISOString().split('T')[0];
                        setProfile({
                            ...profile,
                            access_type: data.plan || 'premium',
                            access_start_date: today
                        });
                    }
                    
                    audioSynth.playAchievementMajor();
                    setStatus('success');
                    
                    // Redirect back to game after 3 seconds
                    setTimeout(() => {
                        navigate('/game', { replace: true });
                    }, 3000);
                } else {
                    throw new Error('Payment was not marked as PAID. Status: ' + (data.status || 'Unknown'));
                }
            } catch (err: any) {
                console.error('Payment Verification Error:', err);
                setStatus('error');
                setErrorMessage(err.message || 'Something went wrong verifying your payment.');
            }
        };

        verifyOrder();
    }, [orderId, navigate, profile, setProfile]);

    const audioSynth = audioManager;

    return (
        <div className="fixed inset-0 w-full h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
                
                {status === 'loading' && (
                    <MascotLoader 
                        message="VERIFYING PAYMENT..." 
                        subMessage="Securing your cosmic access..." 
                        fullscreen={false} 
                        transparentBg 
                    />
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-6 animate-fade-in-up">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-widest text-shadow-sm">
                            Payment Successful!
                        </h2>
                        <p className="text-slate-300 text-sm">
                            Your account has been upgraded. Welcome to the Premium experience.
                        </p>
                        <p className="text-cyan-400 text-xs font-bold mt-2 animate-pulse">
                            Redirecting you back to the game...
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-6 animate-fade-in-up">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                            <XCircle className="w-10 h-10 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest">
                            Verification Failed
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {errorMessage}
                        </p>
                        <button
                            onClick={() => navigate('/game', { replace: true })}
                            className="mt-4 w-full py-4 rounded-full font-bold uppercase tracking-widest text-slate-900 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                        >
                            Return to Game
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
