import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { useNavigate, useLocation } from 'react-router-dom';
// Removed MascotQuizGuide import
import { audioManager as audioSynth } from "../../utils/audioManager";
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { saveSession } from '../../utils/session';
import { supabase } from '../../utils/supabase';
import { deriveMobileEmail, deriveMobilePassword, derivePhoneEmail, normalizePhone } from '../../utils/authHelpers';
import { useUsernameAvailability } from '../../hooks/useUsernameAvailability';
import { UsernameField } from './UsernameField';
import { authService } from '../../services/authService';

import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import clsx from 'clsx';

const AgeSelector = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => {
    const MIN = 10;
    const MAX = 25;

    const handleNudge = (direction: -1 | 1) => {
        audioSynth.playClick();
        const newValue = Math.max(MIN, Math.min(MAX, value + direction));
        onChange(newValue);
    };

    const displayVal = Math.max(MIN, Math.min(MAX, value || 18));

    return (
        <div className="relative w-full max-w-sm mx-auto flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-4">
                <button 
                    type="button"
                    onClick={() => handleNudge(-1)} 
                    disabled={displayVal <= MIN}
                    className="p-3 bg-[#191923]/80 rounded-2xl hover:bg-[#2b2b38] transition-colors text-[#acaab5] hover:text-[#00f1fe] disabled:opacity-40"
                    aria-label="Decrease age"
                >
                    <ChevronLeft size={24} />
                </button>
                
                <div className="flex flex-col items-center relative">
                    <motion.div 
                        key={displayVal}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f1fe] to-[#99f7ff] tracking-tight drop-shadow-[0_0_15px_rgba(0,241,254,0.6)]"
                    >
                        {displayVal}
                    </motion.div>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#00f1fe] absolute -bottom-4 font-bold opacity-80">Years</span>
                </div>

                <button 
                    type="button"
                    onClick={() => handleNudge(1)} 
                    disabled={displayVal >= MAX}
                    className="p-3 bg-[#191923]/80 rounded-2xl hover:bg-[#2b2b38] transition-colors text-[#acaab5] hover:text-[#00f1fe] disabled:opacity-40"
                    aria-label="Increase age"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <input
                type="range"
                min={MIN}
                max={MAX}
                value={displayVal}
                onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (val !== value) {
                        audioSynth.playClick();
                        onChange(val);
                    }
                }}
                className="w-full h-2 bg-[#191923] rounded-lg appearance-none cursor-pointer accent-[#00f1fe]"
            />

            <div className="flex justify-between w-full text-[10px] text-slate-500 font-mono select-none px-1 mt-2">
                {[10, 13, 16, 19, 22, 25].map(tick => (
                    <button
                        key={tick}
                        type="button"
                        onClick={() => {
                            audioSynth.playClick();
                            onChange(tick);
                        }}
                        className={clsx(
                            "transition-colors hover:text-[#00f1fe] cursor-pointer font-bold",
                            displayVal === tick ? "text-[#00f1fe] scale-110" : "text-slate-500"
                        )}
                    >
                        {tick}
                    </button>
                ))}
            </div>
        </div>
    );
};

export function OnboardingWizard() {
    const setProfile = useUserStore((state) => state.setProfile);
    const navigate = useNavigate();
    const location = useLocation();
    
    const isRegisterMode = location.pathname === '/game/setup';

    const [name, setName] = useState("");
    const [age, setAge] = useState<number>(20);
    const [mobile, setMobile] = useState("");
    const [username, setUsername] = useState("");
    const [prefLang, setPrefLang] = useState<'en' | 'hi'>('en');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isHoveringBtn, setIsHoveringBtn] = useState(false);
    
    // Google Auth State
    const [googleAuthId, setGoogleAuthId] = useState<string | null>(null);

    const isSubmitting = useRef(false);

    // Live username availability check (only used in register mode)
    const usernameAvailability = useUsernameAvailability(
        isRegisterMode ? username : '',
        null // no exclude for new users
    );

    // Sync googleAuthId and name on register mode mount
    useEffect(() => {
        if (isRegisterMode) {
            const tempGoogleId = sessionStorage.getItem('aya_temp_google_id');
            const tempGoogleName = sessionStorage.getItem('aya_temp_google_name');
            const tempGoogleAge = sessionStorage.getItem('aya_temp_google_age');
            const tempGoogleMobile = sessionStorage.getItem('aya_temp_google_mobile');
            const tempGoogleUsername = sessionStorage.getItem('aya_temp_google_username');
            if (tempGoogleId) {
                setGoogleAuthId(tempGoogleId);
                setName(tempGoogleName || "");
                if (tempGoogleAge) setAge(Number(tempGoogleAge));
                if (tempGoogleMobile) setMobile(tempGoogleMobile);
                if (tempGoogleUsername) setUsername(tempGoogleUsername);
            }
            setIsLoading(false);
        }
    }, [isRegisterMode]);

    // Handle Google OAuth check ONLY in welcome/login mode
    useEffect(() => {
        if (isRegisterMode) return;

        const checkGoogleAuth = async () => {
            try {
                // If OAuth returned an error in the hash, catch it!
                const hash = window.location.hash;
                if (hash && hash.includes('error=')) {
                    const params = new URLSearchParams(hash.substring(1));
                    const errorDesc = params.get('error_description') || 'Authentication failed.';
                    setError(`Google Auth Error: ${errorDesc.replace(/\+/g, ' ')}`);
                    window.history.replaceState(null, '', window.location.pathname);
                    setIsLoading(false);
                    return;
                }

                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    setError(`Session Error: ${sessionError.message}`);
                    setIsLoading(false);
                    return;
                }

                if (session && session.user) {
                    const googleId = session.user.id;
                    // Persist Google email for admin check (Supabase auth session is transient)
                    if (session.user.email) {
                        try { localStorage.setItem('aya_google_email', session.user.email); } catch {}
                    }
                    // See if they already have an account linked to this google_id
                    const { data: existingUser, error: dbError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('google_id', googleId)
                        .is('deleted_at', null)
                        .maybeSingle();

                    if (dbError) {
                        console.error("DB Error checking Google ID:", dbError);
                        if (dbError.code === '42703' || dbError.message?.includes('google_id')) {
                            setError("CRITICAL ERROR: 'google_id' column missing! Run in Supabase SQL: ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;");
                        } else {
                            setError(`Database error: ${dbError.message}`);
                        }
                        setIsLoading(false);
                        return;
                    }

                    if (existingUser) {
                        // EXISTING USER: Directly log them in!
                        await performLogin(existingUser, googleId, true);
                        return;
                    } else {
                        // NEW USER: Redirect to setup page
                        sessionStorage.setItem('aya_temp_google_id', googleId);
                        sessionStorage.setItem('aya_temp_google_name', session.user.user_metadata.full_name || "");
                        sessionStorage.setItem('aya_temp_existing_user', 'false');
                        navigate('/game/setup');
                        return;
                    }
                }
            } catch (err: any) {
                console.error("Fatal Google Auth Error:", err);
                setError(`Unexpected Error: ${err.message || 'Check console'}`);
            }
            setIsLoading(false);
        };
        
        checkGoogleAuth();
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            if (session && session.user) {
                setIsLoading(true);
                checkGoogleAuth();
            }
        });
        
        return () => subscription.unsubscribe();
    }, [isRegisterMode]);



    /**
     * Ensure this mobile user has a Supabase Auth session.
     * Creates one via signUp (new) or restores via signInWithPassword (existing).
     * Sets auth_user_id on the public.users row so RLS get_my_user_id() works.
     *
     * This is called for ALL mobile users — Google OAuth users already have
     * an auth session from signInWithOAuth and do NOT go through this path.
     */
    const ensureMobileAuthSession = async (userData: any): Promise<void> => {
        if (!userData.mobile) return;

        const email = deriveMobileEmail(userData.mobile);
        const legacyEmail = derivePhoneEmail(userData.mobile);
        const newPassword = deriveMobilePassword(userData.mobile);
        const cleanPhone = normalizePhone(userData.mobile);
        const legacyPassword = `Ayaaya-fall${cleanPhone}!Auth`; // The hardcoded old fallback salt password
        
        const strategies = [
            { email, password: newPassword },
            { email: legacyEmail, password: newPassword },
            { email, password: legacyPassword },
            { email: legacyEmail, password: legacyPassword }
        ];

        let signInData: any = null;
        let signInError: any = null;
        let successfulStrategy: any = null;

        for (const strategy of strategies) {
            const response = await supabase.auth.signInWithPassword({
                email: strategy.email,
                password: strategy.password,
            });
            
            if (response.data?.session) {
                signInData = response.data;
                signInError = null;
                successfulStrategy = strategy;
                break;
            } else {
                signInError = response.error;
            }
        }

        if (signInData?.session) {
            // MIGRATION: If we succeeded using the old legacy password, seamlessly upgrade them to the new secure password!
            if (successfulStrategy.password === legacyPassword && newPassword !== legacyPassword) {
                await supabase.auth.updateUser({ password: newPassword }).catch((e: any) => console.error("Password migration failed:", e));
            }

            // Session restored — link auth_user_id if not already set
            const authUid = signInData.session.user.id;
            if (!userData.auth_user_id) {
                await supabase
                    .from('users')
                    .update({ auth_user_id: authUid })
                    .eq('id', userData.id);
            }
            return;
        }

        // 2. signIn failed (no auth account yet) — create one
        const isInvalidCredentials =
            signInError?.message?.includes('Invalid login credentials') ||
            signInError?.status === 400;

        if (!isInvalidCredentials) {
            // Unexpected error — log but don't block login
            console.warn('[Auth] signInWithPassword unexpected error:', signInError?.message);
            return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: newPassword,
        });

        if (signUpError) {
            console.warn('[Auth] signUp failed:', signUpError.message);
            return;
        }

        if (signUpData?.session) {
            const authUid = signUpData.session.user.id;
            await supabase
                .from('users')
                .update({ auth_user_id: authUid })
                .eq('id', userData.id);
        } else {
            // signUp succeeded but no session — likely email confirmation is still ON
            // in the Supabase Dashboard. Log a clear error for the developer.
            console.error(
                '[Auth] signUp returned no session. ' +
                'Please disable email confirmation in Supabase Dashboard: ' +
                'Authentication → Settings → Enable email confirmations → OFF'
            );
        }
    };

    const performLogin = async (userData: any, gId: string | null, isExisting: boolean) => {
        let userId = userData.id;
        let existingProfile: any = null;

        // Fetch personality profile if it exists
        if (isExisting) {
            const { data: profileCheck } = await supabase
                .from('personality_profiles')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();
            existingProfile = profileCheck;
            
            // If they just linked a Google account, update the users table
            if (gId && !userData.google_id) {
                await supabase.from('users').update({ google_id: gId }).eq('id', userId);
                userData.google_id = gId;
            }
        } else {
            // New user - create personality profile
            const { error: profileError } = await supabase.from('personality_profiles').upsert({
                user_id: userId,
                mobile: userData.mobile,
                trait_risk_taker: 50,
                trait_creative: 50,
                trait_analytical: 50,
                trait_social: 50,
                trait_ambitious: 50,
                future_archetype: 'Explorer',
                total_xp: 0,
                level: 1,
                stories_completed: 0
            }, { onConflict: 'user_id' });
            if (profileError) console.warn('Supabase personality upsert failed', profileError);
        }

        // ── Ensure Supabase Auth session for mobile users ─────────────────────
        // Google OAuth users already have a session from signInWithOAuth.
        // Mobile-only users need one created here so auth.uid() works for RLS.
        const { data: { session: existingAuthSession } } = await supabase.auth.getSession();
        const isGoogleSession = existingAuthSession?.user?.app_metadata?.provider === 'google';

        if (!isGoogleSession && userData.mobile) {
            await ensureMobileAuthSession(userData);
        }

        // Persist session to localStorage + sessionStorage
        saveSession({ id: userId, mobile: userData.mobile, name: userData.name, age: userData.age, username: userData.username });

        // Extract level_scores from userData if they exist
        const dbScores: Record<string, number> = {};
        if (userData.level_scores) {
            const parsed = typeof userData.level_scores === 'string' 
                ? (() => { try { return JSON.parse(userData.level_scores); } catch { return {}; } })()
                : userData.level_scores;
            Object.entries(parsed).forEach(([id, stars]) => {
                dbScores[id] = Math.max(dbScores[id] || 0, Number(stars) || 0);
            });
        }

        // Check if user is an admin (by querying admin_users table)
        let isAdmin = false;
        try {
            const { checkIsAdmin } = await import('../../utils/adminCheck');
            isAdmin = await checkIsAdmin();
        } catch (err) {
            console.error('Failed to check admin status during login:', err);
        }

        // Merge into store BEFORE setting profile so it's ready when Map loads
        useUserStore.setState((state) => ({
            levelScores: { ...state.levelScores, ...dbScores }
        }));

        // Delay setProfile & transition by 1500ms so user sees the Happy Mascot reaction!
        setTimeout(() => {
            setProfile({
                id: userId, 
                mobile: userData.mobile, 
                name: userData.name, 
                username: userData.username,
                age: userData.age,
                access_type: userData.access_type || 'open',
                access_start_date: userData.access_start_date,
                preferred_map: userData.preferred_map || 'solar',
                interests: [], 
                roleModels: [],
                traits: existingProfile ? {
                    discipline: existingProfile.trait_discipline || 50,
                    resilience: existingProfile.trait_resilience || 50,
                    risk: existingProfile.trait_risk_taker || 50,
                    leadership: existingProfile.trait_ambitious || 50,
                    creativity: existingProfile.trait_creative || 50,
                    empathy: existingProfile.trait_social || 50,
                    vision: existingProfile.trait_vision || 50
                } : { discipline: 50, resilience: 50, risk: 50, leadership: 50, creativity: 50, empathy: 50, vision: 50 },
                assessmentCompleted: !!existingProfile || (userData.total_xp > 0 || userData.stories_completed > 0 || userData.level > 1),
                total_xp: userData.total_xp || 0,
                level: userData.level || 1,
                stories_completed: userData.stories_completed || 0,
                current_streak: userData.current_streak || 0,
                longest_streak: userData.longest_streak || 0,
                last_active_date: userData.last_active_date || new Date().toISOString().split('T')[0],
                daily_challenge_completed: userData.daily_challenge_completed || false,
                isAdmin
            });
        }, 1500);
    };

    const handleComplete = async () => {
        audioSynth.playClick();
        if (!mobile.trim() || age < 13) return;
        if (isSubmitting.current) return;
        isSubmitting.current = true;
        
        useUserStore.getState().setAppLanguage(prefLang);
        setIsLoading(true);
        setError("");

        const cleanMobile = normalizePhone(mobile);
        const cleanUsername = username.trim();

        if (isRegisterMode) {
                if (!name.trim() || !cleanMobile || !cleanUsername) {
                    setIsLoading(false);
                    isSubmitting.current = false;
                    setError("Please fill in all required fields (Name, Username, Mobile).");
                    return;
                }
                if (cleanUsername.length < 3) {
                    setIsLoading(false);
                    isSubmitting.current = false;
                    setError("Username must be at least 3 characters long.");
                    return;
                }

                // Check username availability
                const { data: existingUsername, error: usernameError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('username', cleanUsername)
                    .maybeSingle();

                if (usernameError) throw usernameError;
                if (existingUsername) {
                    setIsLoading(false);
                    isSubmitting.current = false;
                    setError("This username is not available");
                    return;
                }
            } else {
                if (!cleanMobile) {
                    setIsLoading(false);
                    isSubmitting.current = false;
                    setError("Please enter your mobile number.");
                    return;
                }
            }

        // 20s escape hatch
        const fallback = setTimeout(() => {
            setIsLoading(false);
            isSubmitting.current = false;
            setError('Connection failed. Please check your internet and try again.');
        }, 20000);

        try {
            // Check if they are existing user logging in
            const isExistingGoogle = sessionStorage.getItem('aya_temp_existing_user') === 'true';
            if (isExistingGoogle) {
                const userDataRaw = sessionStorage.getItem('aya_temp_user_data');
                if (userDataRaw) {
                    try {
                        const userData = JSON.parse(userDataRaw);
                        const cleanMobile = normalizePhone(mobile);
                        // Update details if changed
                        if (userData.name !== name.trim() || userData.age !== age || userData.mobile !== cleanMobile) {
                            const { error: updateError } = await supabase
                                .from('users')
                                .update({
                                    name: name.trim(),
                                    age: age,
                                    mobile: cleanMobile,
                                    username: cleanUsername
                                })
                                .eq('id', userData.id);
                            if (updateError) console.warn("Failed to update user details on login", updateError);
                            userData.name = name.trim();
                            userData.age = age;
                            userData.mobile = cleanMobile;
                            userData.username = cleanUsername;
                        }
                        clearTimeout(fallback);
                        await performLogin(userData, googleAuthId, true);
                        
                        // Clean up
                        sessionStorage.removeItem('aya_temp_google_id');
                        sessionStorage.removeItem('aya_temp_google_name');
                        sessionStorage.removeItem('aya_temp_google_age');
                        sessionStorage.removeItem('aya_temp_google_mobile');
                        sessionStorage.removeItem('aya_temp_google_username');
                        sessionStorage.removeItem('aya_temp_existing_user');
                        sessionStorage.removeItem('aya_temp_user_data');
                        return;
                    } catch (e: any) {
                        console.error("Failed to process existing Google user", e);
                    }
                }
            }

            // Check if user exists by mobile
            const { data: existingUser, error: searchError } = await supabase
                .from('users')
                .select('*')
                .eq('mobile', cleanMobile)
                .is('deleted_at', null)
                .maybeSingle();

            if (searchError) throw searchError;

            if (existingUser) {
                if (googleAuthId && existingUser.google_id && existingUser.google_id !== googleAuthId) {
                    clearTimeout(fallback);
                    setIsLoading(false);
                    isSubmitting.current = false;
                    setError("This phone number is already linked to a different Google account. Please log in with that account or use a different phone number.");
                    return;
                }

                clearTimeout(fallback);
                await performLogin(existingUser, googleAuthId, true);
            } else {
                if (!name.trim()) {
                    clearTimeout(fallback);
                    setIsLoading(false);
                    isSubmitting.current = false;
                    setError("Please enter your name to create a new account.");
                    return;
                }
                
                // Insert new user
                const insertPayload: any = {
                    mobile: cleanMobile,
                    name: name.trim(),
                    username: cleanUsername,
                    age: age,
                    access_type: 'open',
                    access_start_date: new Date().toISOString().split('T')[0],
                    preferred_theme: 'city_dark',
                    total_xp: 0,
                    level: 1,
                    stories_completed: 0
                };
                if (googleAuthId) {
                    insertPayload.google_id = googleAuthId;
                    insertPayload.auth_user_id = googleAuthId;
                    insertPayload.id = googleAuthId;
                }

                const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert(insertPayload)
                    .select()
                    .single();

                if (insertError) {
                    console.warn('[Register] Supabase insert failed (likely RLS). Falling back to local-only mode:', insertError);
                    clearTimeout(fallback);
                    const localUser = { ...insertPayload, id: crypto.randomUUID() };
                    await performLogin(localUser, googleAuthId, false);
                } else {
                    clearTimeout(fallback);
                    await performLogin(newUser, googleAuthId, false);
                }
            }
        } catch (err: any) {
            clearTimeout(fallback);
            setIsLoading(false);
            isSubmitting.current = false;
            setError(err.message || 'An error occurred during sign in.');
        }
    };

    const handleGoogleSignIn = async () => {
        audioSynth.playClick();
        setIsLoading(true);
        setError('');
        try {
            await authService.signInWithGoogle(window.location.origin + '/game/welcome');
        } catch (err: any) {
            console.error("OAuth Init Error:", err);
            setError(`Failed to launch Google Sign-In: ${err.message}. Ensure Google Auth is enabled in your Supabase Dashboard.`);
            setIsLoading(false);
        }
    };

    // Derived style classes
    const baseInputClasses = "w-full bg-black/40 border border-[#2b2b38] rounded-xl px-4 py-3 text-white placeholder-[#76747f] font-medium outline-none transition-all duration-300 hover:border-[#9333ea]/50 hover:bg-black/60";

    return (
        /* Outermost: just the background color, no overflow restriction */
        <div className="w-full bg-[#0a0a0f] selection:bg-[#00f1fe] selection:text-black">

            {/* Fixed background layers — won't scroll */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Grid overlay */}
                <div style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }} className="absolute inset-0" />
                {/* Gradient fade on edges */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
                {/* Cinematic blobs */}
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#9333ea] opacity-20 blur-[120px] rounded-full" />
                <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] bg-[#00f1fe] opacity-10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-[10%] left-[20%] w-[80%] h-[50%] bg-[#ff00ff] opacity-10 blur-[150px] rounded-full" />
            </div>

            {/* Scrollable content — this is the actual scrolling wrapper */}
            <div className="relative z-10 w-full min-h-[100dvh] flex flex-col md:flex-row items-center justify-center py-16 px-4 gap-8 lg:gap-16">

                {/* ── 1. WELCOME PAGE ("Welcome to AYA") ── */}
                {!isRegisterMode && (
                    <div className="w-full" style={{ maxWidth: '420px' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="w-full text-center"
                        >
                            <h2 className="text-4xl font-black text-white drop-shadow-[0_0_20px_rgba(0,241,254,0.4)] text-center mb-8 leading-tight">
                                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f1fe] to-[#9333ea]">AYA</span>
                            </h2>

                            <div className="flex flex-col gap-4 w-full">
                                <motion.button
                                    onMouseEnter={() => setIsHoveringBtn(true)}
                                    onMouseLeave={() => setIsHoveringBtn(false)}
                                    onTouchStart={() => setIsHoveringBtn(true)}
                                    onTouchEnd={() => setIsHoveringBtn(false)}
                                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,255,255,0.3)' }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isLoading}
                                    onClick={handleGoogleSignIn}
                                    className="w-full py-4 bg-white text-black font-black text-lg rounded-2xl shadow-lg flex items-center justify-center space-x-3 transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span>INITIALIZING...</span>
                                    ) : (
                                        <>
                                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-7 h-7" />
                                            <span>SIGN IN WITH GOOGLE</span>
                                        </>
                                    )}
                                </motion.button>

                                {!isLoading && (
                                    <>
                                        <div className="flex items-center gap-4 my-1 opacity-40 w-full">
                                            <div className="h-px bg-white flex-1" />
                                            <span className="text-white text-sm font-bold uppercase tracking-widest">OR</span>
                                            <div className="h-px bg-white flex-1" />
                                        </div>
                                        <motion.button
                                            onMouseEnter={() => setIsHoveringBtn(true)}
                                            onMouseLeave={() => setIsHoveringBtn(false)}
                                            onTouchStart={() => setIsHoveringBtn(true)}
                                            onTouchEnd={() => setIsHoveringBtn(false)}
                                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => { audioSynth.playClick(); navigate('/signin'); }}
                                            className="w-full py-4 bg-transparent border-2 border-[#2b2b38] text-white font-bold text-lg rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all shadow-lg"
                                        >
                                            SIGN IN WITH USERNAME
                                        </motion.button>
                                        <div className="mt-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => { audioSynth.playClick(); navigate('/signup'); }}
                                                className="text-[#00f1fe] font-bold hover:underline text-sm"
                                            >
                                                Don't have an account? Sign Up
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* ── 2. SETUP FORM ("Let's get to know you!") ── */}
                {isRegisterMode && (
                    <div className="w-full" style={{ maxWidth: '480px' }}>
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
                                    {googleAuthId ? 'Link Your Account' : "Let's get to know you!"}
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.6 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-white/60 text-sm mt-2"
                                >
                                    Fill in your details to begin the journey
                                </motion.p>
                            </div>

                            {/* Google Auth Banner */}
                            {googleAuthId && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="mb-6 p-4 bg-emerald-900/40 text-emerald-100 rounded-2xl border border-emerald-500/50 backdrop-blur-md text-center shadow-xl relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
                                    <h3 className="font-black text-lg text-emerald-400 mb-1">✓ Google Authenticated!</h3>
                                    <p className="text-xs font-medium opacity-80">Enter your mobile number to restore progress or start fresh.</p>
                                </motion.div>
                            )}

                            {/* Form Fields */}
                            <div className="space-y-4 w-full">

                                {/* Name */}
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                                    className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#9333ea]/40 transition-all duration-300 hover:shadow-[0_8px_30px_-10px_rgba(147,51,234,0.4)]"
                                >
                                    <label className="block text-[11px] font-bold text-[#00f1fe] mb-2 uppercase tracking-[0.15em]">Identity</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`${baseInputClasses} focus:ring-2 focus:ring-[#9333ea]/40 focus:border-[#9333ea]`}
                                        placeholder="Enter your full name"
                                        disabled={isLoading}
                                    />
                                </motion.div>

                                {/* Username — live availability check */}
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                                    className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#9333ea]/40 transition-all duration-300 hover:shadow-[0_8px_30px_-10px_rgba(147,51,234,0.4)]"
                                >
                                    <UsernameField
                                        value={username}
                                        onChange={setUsername}
                                        status={usernameAvailability.status}
                                        errorMessage={usernameAvailability.errorMessage}
                                        disabled={isLoading}
                                        label="Username"
                                        helperText="3–20 characters · letters, numbers and underscores only"
                                    />
                                </motion.div>

                                {/* Age Selector */}
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                                    className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#00f1fe]/40 transition-all duration-300 hover:shadow-[0_8px_30px_-10px_rgba(0,241,254,0.2)]"
                                >
                                    <label className="block text-[11px] font-bold text-[#00f1fe] mb-4 uppercase tracking-[0.15em]">Your Age</label>
                                    <AgeSelector value={age} onChange={setAge} />
                                </motion.div>

                                {/* Language */}
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                                    className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#00f1fe]/40 transition-all duration-300 hover:shadow-[0_8px_30px_-10px_rgba(0,241,254,0.2)]"
                                >
                                    <label className="block text-[11px] font-bold text-[#00f1fe] mb-3 uppercase tracking-[0.15em]">Preferred Language</label>
                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={() => { audioSynth.playClick(); setPrefLang('en'); }}
                                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${prefLang === 'en' ? 'bg-[#00f1fe] text-[#004145] border-[#00f1fe] shadow-[0_0_15px_rgba(0,241,254,0.4)]' : 'bg-black/40 text-white/60 border-white/10 hover:border-[#00f1fe]/50 hover:text-white'}`}
                                        >
                                            English
                                        </button>
                                        <button
                                            onClick={() => { audioSynth.playClick(); setPrefLang('hi'); }}
                                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${prefLang === 'hi' ? 'bg-[#00f1fe] text-[#004145] border-[#00f1fe] shadow-[0_0_15px_rgba(0,241,254,0.4)]' : 'bg-black/40 text-white/60 border-white/10 hover:border-[#00f1fe]/50 hover:text-white'}`}
                                        >
                                            हिंदी (Hindi)
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Mobile */}
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
                                    className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#00f1fe]/40 transition-all duration-300 hover:shadow-[0_8px_30px_-10px_rgba(0,241,254,0.2)]"
                                >
                                    <label className="block text-[11px] font-bold text-[#00f1fe] mb-2 uppercase tracking-[0.15em]">Mobile Number</label>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="tel"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        className={`${baseInputClasses} focus:ring-2 focus:ring-[#00f1fe]/40 focus:border-[#00f1fe]`}
                                        placeholder="E.g. 9876543210"
                                        disabled={isLoading}
                                    />
                                </motion.div>
                            </div>

                            {/* Error message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="mt-4 p-4 bg-red-900/40 text-red-200 rounded-xl border border-red-500/50 backdrop-blur-md text-center text-sm font-bold"
                                    >
                                        ⚠️ {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 mt-6">
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(0,241,254,0.5)' }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!mobile.trim() || isLoading || (isRegisterMode && sessionStorage.getItem('aya_temp_existing_user') !== 'true' && usernameAvailability.status !== 'available' && username.trim().length >= 3)}
                                    onClick={handleComplete}
                                    className="w-full py-4 bg-[#00f1fe] text-[#004145] font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(0,241,254,0.35)] flex items-center justify-center space-x-2 relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7ff9ff] transition-all"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-white"
                                        animate={{ opacity: [0, 0.25, 0] }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                    />
                                    <span className="relative z-10">
                                        {isLoading ? 'INITIALIZING...' : (
                                            sessionStorage.getItem('aya_temp_existing_user') === 'true'
                                                ? 'CONFIRM & ENTER GAME'
                                                : googleAuthId ? 'LINK ACCOUNT' : 'START MY JOURNEY'
                                        )}
                                    </span>
                                    {!isLoading && <Check size={22} className="relative z-10 stroke-[3]" />}
                                </motion.button>

                                <motion.button
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                                    disabled={isLoading}
                                    onClick={() => {
                                        audioSynth.playClick();
                                        sessionStorage.removeItem('aya_temp_google_id');
                                        sessionStorage.removeItem('aya_temp_google_name');
                                        sessionStorage.removeItem('aya_temp_google_age');
                                        sessionStorage.removeItem('aya_temp_google_mobile');
                                        sessionStorage.removeItem('aya_temp_existing_user');
                                        sessionStorage.removeItem('aya_temp_user_data');
                                        navigate('/game/welcome');
                                    }}
                                    className="w-full py-2 text-white/50 hover:text-white/80 font-semibold text-sm rounded-full transition-all"
                                >
                                    ← Back
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Onboarding Sidekick Mascot Container (Right Side, Hidden on Mobile) */}
                <div className="hidden md:flex flex-col items-center justify-center shrink-0 pointer-events-none select-none z-20">
                    <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-[360px] lg:h-[360px] flex items-center justify-center drop-shadow-2xl">
                        {/* Glowing Background Aura */}
                        <div
                            className={`absolute inset-4 rounded-full blur-3xl opacity-35 transition-colors duration-500 ${
                                isHoveringBtn ? 'bg-amber-400 opacity-70 animate-pulse' : 'bg-purple-500 opacity-40'
                            }`}
                        />

                        <DotLottieReact
                            key={isHoveringBtn ? 'happy' : 'waving'}
                            src={encodeURI(isHoveringBtn ? 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/Macot/happy mascot.lottie' : 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/Macot/waving mascot.lottie')}
                            loop
                            autoplay
                            style={{ width: '100%', height: '100%' }}
                            className="w-full h-full object-contain relative z-10"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

