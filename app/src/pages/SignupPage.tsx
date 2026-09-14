import { useState, useEffect, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Phone, Eye, EyeOff, Calendar, Loader2 } from 'lucide-react';
import { AuthMascot } from '../components/auth/AuthMascot';
import { AgeSelector } from '../components/auth/AgeSelector';
import { authService } from '../services/authService';
import { audioManager as audioSynth } from '../utils/audioManager';
import { supabase } from '../utils/supabase';

import { normalizePhone } from '../utils/authHelpers';

export function SignupPage() {
    const navigate = useNavigate();

    const [authMode, setAuthMode] = useState<'choice' | 'form'>('choice');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState<number | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isHoveringBtn, setIsHoveringBtn] = useState(false);

    useEffect(() => {
        let isMounted = true;
        supabase.auth.getSession().then(async (response: any) => {
            const session = response.data?.session;
            if (session?.user && isMounted) {
                try {
                    let { data: userRow } = await supabase.from('users').select('*').eq('auth_user_id', session.user.id).maybeSingle();
                    if (!userRow && session.user.email) {
                        const { data: emailRow } = await supabase.from('users').select('*').eq('email', session.user.email).maybeSingle();
                        if (emailRow) userRow = emailRow;
                    }
                    if (userRow && userRow.onboarding_complete) {
                        await authService.handlePostSignIn(userRow, session.user.id);
                        navigate('/game?alreadySignedIn=true');
                    }
                } catch (err) {
                    console.error('Session check error', err);
                }
            }
        });
        return () => { isMounted = false; };
    }, [navigate]);

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        // Allow only numeric digits, max 10
        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhone(digits);
    };

    const handleGoogleSignUp = async () => {
        audioSynth.playClick();
        setIsLoading(true);
        setError('');
        try {
            await authService.signInWithGoogle(`${window.location.origin}/signup/complete`);
        } catch (err: any) {
            console.error('Google Sign-Up Error:', err);
            setError(err.message || 'Failed to initialize Google Sign-Up.');
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        audioSynth.playClick();

        const cleanPhone = normalizePhone(phone);
        if (!cleanPhone || cleanPhone.length !== 10) {
            setError('Enter a valid 10-digit mobile number.');
            return;
        }

        if (!age || age < 13 || age > 30) {
            setError('Please select your age.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await authService.signUpWithPhonePassword({
                phone: cleanPhone,
                age,
                password,
                confirmPassword,
            });
            // Redirect to username setup — user still needs to choose a username
            navigate('/signup/complete');
        } catch (err: any) {
            console.error('Signup Error:', err);
            setError(err.message || 'Registration failed. Please try again.');
            setIsLoading(false);
        }
    };




    const baseInputClasses = "w-full bg-black/40 border border-[#2b2b38] rounded-xl px-4 py-3 text-white placeholder-[#76747f] font-medium outline-none transition-all duration-300 hover:border-[#9333ea]/50 hover:bg-black/60 focus:ring-2 focus:ring-[#00f1fe]/40 focus:border-[#00f1fe]";

    return (
        <div className="w-full bg-[#0a0a0f] selection:bg-[#00f1fe] selection:text-black">
            {/* Fixed ambient background layers */}
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

            {/* Main content container */}
            <div className="relative z-10 w-full min-h-[100dvh] flex flex-col md:flex-row items-center justify-center py-16 px-4 gap-8 lg:gap-16">
                
                {/* Auth Card Container */}
                <div className="w-full" style={{ maxWidth: '460px' }}>
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
                                Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f1fe] to-[#9333ea]">AYA</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 0.2 }}
                                className="text-white/60 text-sm mt-2 font-medium"
                            >
                                Create your account to start your journey
                            </motion.p>
                        </div>

                        {/* Error Alert */}
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

                        {/* Mode Choice View */}
                        {authMode === 'choice' && (
                            <div className="space-y-4 w-full">
                                {/* Google Sign Up */}
                                <motion.button
                                    onMouseEnter={() => setIsHoveringBtn(true)}
                                    onMouseLeave={() => setIsHoveringBtn(false)}
                                    onTouchStart={() => setIsHoveringBtn(true)}
                                    onTouchEnd={() => setIsHoveringBtn(false)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,255,255,0.3)' }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isLoading}
                                    onClick={handleGoogleSignUp}
                                    className="w-full py-4 bg-white text-black font-black text-lg rounded-2xl shadow-lg flex items-center justify-center space-x-3 transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span>INITIALIZING...</span>
                                    ) : (
                                        <>
                                            <img
                                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                                alt="Google"
                                                className="w-7 h-7"
                                            />
                                            <span>CONTINUE WITH GOOGLE</span>
                                        </>
                                    )}
                                </motion.button>

                                <div className="flex items-center gap-4 my-2 opacity-40 w-full">
                                    <div className="h-px bg-white flex-1" />
                                    <span className="text-white text-xs font-bold uppercase tracking-widest">OR</span>
                                    <div className="h-px bg-white flex-1" />
                                </div>

                                {/* Phone & Password Option */}
                                <motion.button
                                    onMouseEnter={() => setIsHoveringBtn(true)}
                                    onMouseLeave={() => setIsHoveringBtn(false)}
                                    onTouchStart={() => setIsHoveringBtn(true)}
                                    onTouchEnd={() => setIsHoveringBtn(false)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        audioSynth.playClick();
                                        setAuthMode('form');
                                    }}
                                    className="w-full py-4 bg-transparent border-2 border-[#2b2b38] text-white font-bold text-base rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all shadow-lg flex items-center justify-center space-x-2"
                                >
                                    <Phone size={20} className="text-[#00f1fe]" />
                                    <span>CONTINUE WITH PHONE & PASSWORD</span>
                                </motion.button>
                            </div>
                        )}

                        {/* Phone + Password Signup Form */}
                        {authMode === 'form' && (
                            <form onSubmit={handleFormSubmit} className="space-y-4 w-full">
                                {/* Phone Number */}
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#9333ea]/40 transition-all duration-300 hover:shadow-[0_8px_30px_-10px_rgba(147,51,234,0.4)]"
                                >
                                    <label className="block text-[11px] font-bold text-[#00f1fe] mb-2 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                        <Phone size={12} /> Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        required
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        className={baseInputClasses}
                                        placeholder="E.g. 9876543210"
                                        disabled={isLoading}
                                    />
                                </motion.div>

                                {/* Age Selection */}
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#00f1fe]/40 transition-all duration-300"
                                >
                                    <label className="block text-[11px] font-bold text-[#00f1fe] mb-2 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                        <Calendar size={12} /> Age
                                    </label>
                                    <AgeSelector
                                        value={age}
                                        onChange={setAge}
                                        disabled={isLoading}
                                        min={10}
                                        max={25}
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
                                            minLength={6}
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

                                {/* Confirm Password */}
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#00f1fe]/40 transition-all duration-300"
                                >
                                    <label className="block text-[11px] font-bold text-[#00f1fe] mb-2 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                        <Lock size={12} /> Confirm Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            minLength={6}
                                            value={confirmPassword}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                            className={`${baseInputClasses} pr-12`}
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 text-[#acaab5] hover:text-[#00f1fe] transition-colors p-1 rounded-lg"
                                            title={showConfirmPassword ? "Hide password" : "Show password"}
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                                    transition={{ delay: 0.35 }}
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(0,241,254,0.5)' }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isLoading || !phone.trim() || !age || !password || password !== confirmPassword}

                                    type="submit"
                                    className="w-full py-4 bg-[#00f1fe] text-[#004145] font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(0,241,254,0.35)] flex items-center justify-center space-x-2 relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7ff9ff] transition-all mt-4"
                                >
                                    <span>{isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
                                    {isLoading ? (
                                        <Loader2 size={22} className="animate-spin stroke-[2.5]" />
                                    ) : (
                                        <Check size={22} className="stroke-[3]" />
                                    )}
                                </motion.button>

                                {/* Toggle Back */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        audioSynth.playClick();
                                        setAuthMode('choice');
                                    }}
                                    className="w-full py-2 text-white/50 hover:text-white/80 font-semibold text-xs rounded-full transition-all text-center"
                                >
                                    ← Choose another method
                                </button>
                            </form>
                        )}

                        {/* Navigation link to Sign In */}
                        <div className="mt-8 text-center space-y-6">
                            <p className="text-white/60 text-sm font-medium">
                                Already have an account?{' '}
                                <Link
                                    to="/signin"
                                    onClick={() => audioSynth.playClick()}
                                    className="text-[#00f1fe] font-bold hover:underline ml-1"
                                >
                                    Sign In
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
