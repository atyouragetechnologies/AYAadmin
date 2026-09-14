import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, X, ArrowRight } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { audioManager } from '../../utils/audioManager';

interface WeeklyRecapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WeeklyRecapModal({ isOpen, onClose }: WeeklyRecapModalProps) {
    const profile = useUserStore((state) => state.profile);

    if (!isOpen) return null;

    const streak = profile?.current_streak || 1;
    const storiesPlayed = profile?.stories_completed || 0;
    const currentXp = (profile as any)?.xp || 0;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-gradient-to-b from-[#131627] via-[#0d0f1c] to-[#07080f] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,242,255,0.25)] text-white overflow-hidden"
                >
                    {/* Ambient Glow */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                    >
                        <X size={18} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                Life Navigation Journal
                            </span>
                            <h3 className="text-xl font-black text-white">Your Weekly Growth Recap</h3>
                        </div>
                    </div>

                    <p className="text-xs text-slate-300 font-medium mb-5">
                        Here is how your behavioral instincts and life navigation evolved over the past 7 days.
                    </p>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2.5 mb-5">
                        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                            <div className="text-xl font-black text-cyan-300">{streak} Days</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Active Streak</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                            <div className="text-xl font-black text-purple-300">{storiesPlayed}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Dilemmas Solved</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                            <div className="text-xl font-black text-emerald-300">+{currentXp}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Wisdom XP</div>
                        </div>
                    </div>

                    {/* Emerging Trajectory Highlight */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#191130] to-purple-950/40 border border-purple-400/40 mb-6 space-y-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-cyan-400" />
                            <span className="text-xs font-black text-purple-200 uppercase tracking-wider">
                                Emerging Trajectory Insight
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                            Your recent choices show increased conviction in unconventional paths and high-integrity decision making under pressure.
                        </p>
                    </div>

                    {/* Action button */}
                    <button
                        onClick={() => {
                            audioManager.playClick();
                            onClose();
                        }}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:brightness-110 active:scale-98 transition-all"
                    >
                        <span>Continue Navigating</span>
                        <ArrowRight size={16} />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
