import { useState, useEffect, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthMascot } from '../components/auth/AuthMascot';
import { MascotLoader } from '../components/ui/MascotLoader';
import { authService } from '../services/authService';
import { useUserStore } from '../store/userStore';
import { supabase } from '../utils/supabase';
import { audioManager as audioSynth } from '../utils/audioManager';

import { normalizePhone } from '../utils/authHelpers';

export function SigninPage() {
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isHoveringBtn, setIsHoveringBtn] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const processUserSession = async (session: any) => {
            if (!session?.user || !isMounted) return;
            try {
                let { data: userRow } = await supabase
                    .from('users')
                    .select('*')
                    .eq('auth_user_id', session.user.id)
                    .maybeSingle();

                if (!userRow && session.user.email) {
                    const { data: emailRow } = await supabase
                        .from('users')
                        .select('*')
                        .eq('email', session.user.email)
                        .maybeSingle();
                    if (emailRow) userRow = emailRow;
                }

                if (userRow) {
                    const { onboardingComplete } = await authService.handlePostSignIn(userRow, session.user.id);
                    if (onboardingComplete) {
                        navigate('/game');
                    } else {
                        navigate('/signup/complete');
                    }
                } else {
                    const defaultName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Player';
                    useUserStore.getState().setProfile({
                        id: session.user.id,
                        auth_user_id: session.user.id,
                        username: undefined,
                        name: defaultName,
                        email: session.user.email,
                        onboarding_complete: false,
                        age: 18,
                        total_xp: 0,
                        level: 1,
                        stories_completed: 0,
                        current_streak: 0,
                        longest_streak: 0,
                        daily_challenge_completed: false,
                        assessmentCompleted: false,
                        traits: { discipline: 50, resilience: 50, risk: 50, leadership: 50, creativity: 50, empathy: 50, vision: 50 },
                    } as any);
                    navigate('/signup/complete');
                }
            } catch (err) {
                console.error('Error hydrating session:', err);
                if (isMounted) setIsLoading(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
            if (session?.user) {
                await processUserSession(session);
            } else {
                if (!window.location.hash.includes('access_token') && !window.location.search.includes('code=')) {
                    if (isMounted) setIsLoading(false);
                }
            }
        });

        supabase.auth.getSession().then(async (response: any) => {
            const session = response.data?.session;
            if (session?.user) {
                // If they have a session on load, check onboarding and navigate with pop-up flag
                try {
                    let { data: userRow } = await supabase.from('users').select('*').eq('auth_user_id', session.user.id).maybeSingle();
                    if (!userRow && session.user.email) {
                        const { data: emailRow } = await supabase.from('users').select('*').eq('email', session.user.email).maybeSingle();
                        if (emailRow) userRow = emailRow;
                    }
                    if (userRow && userRow.onboarding_complete) {
                        await authService.handlePostSignIn(userRow, session.user.id);
                        navigate('/game?alreadySignedIn=true');
                    } else {
                        await processUserSession(session);
                    }
                } catch {
                    await processUserSession(session);
                }
            } else {
                if (!window.location.hash.includes('access_token') && !window.location.search.includes('code=')) {
                    if (isMounted) setIsLoading(false);
                }
            }
        }).catch((err: any) => {
            console.error('Failed to get session:', err);
            if (isMounted) setIsLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [navigate]);

    const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
        setIdentifier(e.target.value);
    };

    const handleGoogleSignIn = async () => {
        audioSynth.playClick();
        setIsLoading(true);
        setError('');
        try {
            await authService.signInWithGoogle(`${window.location.origin}/game/welcome`);
        } catch (err: any) {
            console.error('Google Sign-In Error:', err);
            setError(err.message || 'Failed to launch Google Sign-In.');
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        audioSynth.playClick();

        const trimmedIdentifier = identifier.trim();
        if (!trimmedIdentifier) {
            setError('Please enter your username or phone number.');
            return;
        }

        if (!password) {
            setError('Please enter your password.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const cleanPhone = normalizePhone(trimmedIdentifier);
            const isPhone = cleanPhone && cleanPhone.length === 10 && /^\d+$/.test(cleanPhone);

            let result;
            if (isPhone) {
                result = await authService.signInWithPhonePassword({
                    phone: cleanPhone,
                    password,
                });
            } else {
                result = await authService.signInWithUsernamePassword({
                    username: trimmedIdentifier,
                    password,
                });
            }

            if (result.onboardingComplete) {
                // Redirect to existing AYA game dashboard
                navigate('/game');
            } else {
                navigate('/signup/complete');
            }
        } catch (err: any) {
            console.error('Signin Error:', err);
            setError(err.message || 'Invalid credentials.');
            setIsLoading(false);
        }
    };


    const baseInputClasses = "w-full bg-black/40 border border-[#2b2b38] rounded-xl px-4 py-3 text-white placeholder-[#76747f] font-medium outline-none transition-all duration-300 hover:border-[#9333ea]/50 hover:bg-black/60 focus:ring-2 focus:ring-[#00f1fe]/40 focus:border-[#00f1fe]";

    if (isLoading && !identifier) {
        return <MascotLoader message="ENTERING AYA..." subMessage="Checking your traveler clearance..." />;
    }

    return (
        <div className="w-full bg-[#0a0a0f] selection:bg-[#00f1fe] selection:text-black">
            {/* Fixed background layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                    className="absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#9333ea] opacity-20 blur-[120px] rounded-full" />
                <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] bg-[#00f1fe] opacity-10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-[10%] left-[20%] w-[80%] h-[50%] bg-[#ff00ff] opacity-10 blur-[150px] rounded-full" />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full min-h-[100dvh] flex flex-col md:flex-row items-center justify-center py-16 px-4 gap-8 lg:gap-16">
                
                {/* Signin Form Card */}
                <div className="w-full" style={{ maxWidth: '440px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="w-full"
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <motion.h2
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl font-black text-white drop-shadow-[0_0_20px_rgba(0,241,254,0.4)] leading-tight"
                            >
                                Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f1fe] to-[#9333ea]">AYA</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 0.2 }}
                                className="text-white/60 text-sm mt-2 font-medium"
                            >
                                Sign in to continue your journey
                            </motion.p>
                        </div>

                        {/* Error Banner */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 p-4 bg-red-900/40 text-red-200 rounded-2xl border border-red-500/50 backdrop-blur-md text-center text-sm font-bold shadow-xl"
                                >
                                    ⚠️ {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Phone + Password Form */}
                        <form onSubmit={handleFormSubmit} className="space-y-4 w-full">
                            {/* Identifier */}
                            <motion.div
                                whileHover={{ y: -2 }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                                className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#9333ea]/40 transition-all duration-300 hover:shadow-[0_8px_30px_-10px_rgba(147,51,234,0.4)]"
                            >
                                <label className="block text-[11px] font-bold text-[#00f1fe] mb-2 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                    <User size={12} /> Username or Phone
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={identifier}
                                    onChange={handleIdentifierChange}
                                    className={baseInputClasses}
                                    placeholder="Enter your username or phone"
                                    disabled={isLoading}
                                />
                            </motion.div>

                            {/* Password */}
                            <motion.div
                                whileHover={{ y: -2 }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#00f1fe]/40 transition-all duration-300"
                            >
                                <label className="block text-[11px] font-bold text-[#00f1fe] mb-2 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                    <Lock size={12} /> Password
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                        className={`${baseInputClasses} pr-12`}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 text-[#acaab5] hover:text-[#00f1fe] transition-colors p-1 rounded-lg"
                                        title={showPassword ? "Hide password" : "Show password"}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.button
                                onMouseEnter={() => setIsHoveringBtn(true)}
                                onMouseLeave={() => setIsHoveringBtn(false)}
                                onTouchStart={() => setIsHoveringBtn(true)}
                                onTouchEnd={() => setIsHoveringBtn(false)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(0,241,254,0.5)' }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoading || !identifier.trim() || !password}
                                type="submit"
                                className="w-full py-4 bg-[#00f1fe] text-[#004145] font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(0,241,254,0.35)] flex items-center justify-center space-x-2 relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7ff9ff] transition-all mt-2"
                            >
                                <span>{isLoading ? 'SIGNING IN...' : 'SIGN IN'}</span>
                                {isLoading ? (
                                    <Loader2 size={22} className="animate-spin stroke-[2.5]" />
                                ) : (
                                    <Check size={22} className="stroke-[3]" />
                                )}
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6 opacity-40 w-full">
                            <div className="h-px bg-white flex-1" />
                            <span className="text-white text-xs font-bold uppercase tracking-widest">OR</span>
                            <div className="h-px bg-white flex-1" />
                        </div>

                        {/* Google Sign In */}
                        <motion.button
                            onMouseEnter={() => setIsHoveringBtn(true)}
                            onMouseLeave={() => setIsHoveringBtn(false)}
                            onTouchStart={() => setIsHoveringBtn(true)}
                            onTouchEnd={() => setIsHoveringBtn(false)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,255,255,0.3)' }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            onClick={handleGoogleSignIn}
                            className="w-full py-4 bg-white text-black font-black text-base rounded-2xl shadow-lg flex items-center justify-center space-x-3 transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <img
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                alt="Google"
                                className="w-6 h-6"
                            />
                            <span>CONTINUE WITH GOOGLE</span>
                        </motion.button>

                        {/* Link to Sign Up */}
                        <div className="mt-8 text-center space-y-6">
                            <p className="text-white/60 text-sm font-medium">
                                Don't have an account?{' '}
                                <Link
                                    to="/signup"
                                    onClick={() => audioSynth.playClick()}
                                    className="text-[#00f1fe] font-bold hover:underline ml-1"
                                >
                                    Sign Up
                                </Link>
                            </p>
                            
                            <p className="text-white/40 text-[11px] font-medium uppercase tracking-wider leading-relaxed">
                                Signup or Signin to agree Terms and Conditions <br/>
                                <a href="/game/docs/AYA_Terms_and_Conditions.pdf" download target="_blank" rel="noopener noreferrer" className="text-[#00f1fe] font-bold hover:underline">T&C</a>
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* AYA Mascot Sidekick */}
                <AuthMascot isHappy={isHoveringBtn} />
            </div>
        </div>
    );
}
