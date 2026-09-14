import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Calendar, Smartphone, Loader2 } from 'lucide-react';
import { AuthMascot } from '../components/auth/AuthMascot';
import { UsernameField } from '../components/game/UsernameField';
import { AgeSelector } from '../components/auth/AgeSelector';
import { useUsernameAvailability } from '../hooks/useUsernameAvailability';
import { authService } from '../services/authService';
import { useUserStore } from '../store/userStore';
import { supabase } from '../utils/supabase';
import { audioManager as audioSynth } from '../utils/audioManager';

export function SignupCompletePage() {
    const navigate = useNavigate();
    const profile = useUserStore((state) => state.profile);

    const [username, setUsername] = useState(profile?.username || '');
    const [age, setAge] = useState<number | null>(profile?.mobile ? profile.age : null);
    const [mobile, setMobile] = useState(profile?.mobile || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isHoveringBtn, setIsHoveringBtn] = useState(false);

    const needsMobile = !profile?.mobile;

    const usernameAvailability = useUsernameAvailability(
        username,
        profile?.id || null
    );

    useEffect(() => {
        if (!profile) {
            supabase.auth.getSession().then((resp: any) => {
                const session = resp.data?.session;
                if (session?.user) {
                    const defaultName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Player';
                    useUserStore.getState().setProfile({
                        id: session.user.id,
                        auth_user_id: session.user.id,
                        username: undefined,
                        name: defaultName,
                        email: session.user.email,
                        mobile: session.user.phone || null,
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
                }
            });
        }

        if (profile?.onboarding_complete && profile?.username && profile?.assessmentCompleted) {
            // Already fully onboarded returning user, send directly to roadmap
            navigate('/game');
        }
    }, [profile, navigate]);

    const handleCompleteSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        audioSynth.playClick();

        if (!username || username.trim().length < 3) {
            setError('Please enter a username with at least 3 characters.');
            return;
        }

        if (usernameAvailability.status !== 'available') {
            setError('Please choose an available username.');
            return;
        }

        if (needsMobile) {
            const cleanPhone = mobile.replace(/\D/g, '');
            if (cleanPhone.length !== 10) {
                setError('Please enter a valid 10-digit mobile number.');
                return;
            }
        }

        if (!age || age < 13 || age > 30) {
            setError('Please select your age.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await authService.completeProfileSetup({
                username,
                age: age ? age : undefined,
                mobile: needsMobile ? mobile.replace(/\D/g, '') : undefined,
            });
            
            // Check if user is a returning user with completed assessment vs a new user
            const currentProfile = useUserStore.getState().profile;
            if (currentProfile?.assessmentCompleted) {
                // Returning user -> Roadmap
                navigate('/game');
            } else {
                // New user -> Existing AYA Onboarding Page
                navigate('/game/onboarding/1');
            }
        } catch (err: any) {
            console.error('Complete Setup Error:', err);
            setError(err.message || 'Failed to complete profile. Please try again.');
            setIsLoading(false);
        }
    };



    return (
        <div className="w-full bg-[#0a0a0f] selection:bg-[#00f1fe] selection:text-black">
            {/* Ambient Background Layers */}
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

            <div className="relative z-10 w-full min-h-[100dvh] flex flex-col md:flex-row items-center justify-center py-16 px-4 gap-8 lg:gap-16">
                
                {/* Form Card */}
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
                                Create your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f1fe] to-[#9333ea]">AYA Profile</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 0.2 }}
                                className="text-white/60 text-sm mt-2 font-medium"
                            >
                                Set up your profile to complete setup
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

                        <form onSubmit={handleCompleteSetup} className="space-y-4 w-full">
                            {/* Username */}
                            <motion.div
                                whileHover={{ y: -2 }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                                className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#9333ea]/40 transition-all duration-300 hover:shadow-[0_8px_30px_-10px_rgba(147,51,234,0.4)]"
                            >
                                <UsernameField
                                    value={username}
                                    onChange={setUsername}
                                    status={usernameAvailability.status}
                                    errorMessage={usernameAvailability.errorMessage}
                                    disabled={isLoading}
                                    label="Username"
                                    helperText="Select a unique username for your AYA account"
                                />
                            </motion.div>

                                {needsMobile && (
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.18 }}
                                        className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#00f1fe]/40 transition-all duration-300"
                                    >
                                        <label className="block text-[11px] font-bold text-[#00f1fe] mb-2 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                            <Smartphone size={12} /> Mobile Number
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-black">+91</span>
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                value={mobile}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setMobile(val);
                                                }}
                                                placeholder="Enter 10 digit number"
                                                disabled={isLoading}
                                                className="w-full pl-14 pr-4 py-3 bg-black/20 border-2 border-white/10 focus:border-[#00f1fe] rounded-xl text-white font-black text-sm tracking-widest placeholder:text-white/20 outline-none transition-all"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                  <motion.div
                                      whileHover={{ y: -2 }}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.2 }}
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


                            {/* Submit Button */}
                            <motion.button
                                onMouseEnter={() => setIsHoveringBtn(true)}
                                onMouseLeave={() => setIsHoveringBtn(false)}
                                onTouchStart={() => setIsHoveringBtn(true)}
                                onTouchEnd={() => setIsHoveringBtn(false)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(0,241,254,0.5)' }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoading || username.trim().length < 3 || usernameAvailability.status !== 'available' || !age || (needsMobile && mobile.replace(/\D/g, '').length !== 10)}
                                type="submit"
                                className="w-full py-4 bg-[#00f1fe] text-[#004145] font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(0,241,254,0.35)] flex items-center justify-center space-x-2 relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7ff9ff] transition-all mt-4"
                            >
                                <span>{isLoading ? 'SAVING PROFILE...' : 'SET USERNAME'}</span>
                                {isLoading ? (
                                    <Loader2 size={22} className="animate-spin stroke-[2.5]" />
                                ) : (
                                    <Check size={22} className="stroke-[3]" />
                                )}
                            </motion.button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={async () => {
                                    await authService.signOut();
                                    navigate('/signin');
                                }}
                                className="text-[#00f1fe]/60 text-xs font-bold tracking-widest uppercase hover:text-[#00f1fe] transition-colors"
                            >
                                Cancel & Sign Out
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* AYA Mascot */}
                <AuthMascot isHappy={isHoveringBtn} />
            </div>
        </div>
    );
}


