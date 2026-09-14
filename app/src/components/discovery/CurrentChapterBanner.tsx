import { motion } from 'framer-motion';
import { Compass, Sparkles, ChevronRight } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { audioManager } from '../../utils/audioManager';

interface CurrentChapterBannerProps {
    onOpenCheckIn: () => void;
}

export function CurrentChapterBanner({ onOpenCheckIn }: CurrentChapterBannerProps) {
    const profile = useUserStore((state) => state.profile);
    const age = profile?.age || 18;

    // Derive chapter title & theme based on age
    const getChapterDetails = (userAge: number) => {
        if (userAge <= 14) {
            return {
                chapter: 'Chapter I: The Awakening Mind',
                tagline: 'Discovering your inner voice and natural curiosity',
                focus: 'Identity & Observation',
                icon: '🌱',
            };
        }
        if (userAge <= 17) {
            return {
                chapter: 'Chapter II: The Pressure Forge',
                tagline: 'Navigating expectations, high stakes, and early convictions',
                focus: 'Resilience & Courage',
                icon: '⚡',
            };
        }
        if (userAge <= 21) {
            return {
                chapter: 'Chapter III: The Crossroads of Autonomy',
                tagline: 'Choosing your path, questioning conventions, and testing boldness',
                focus: 'Independence & Vision',
                icon: '🧭',
            };
        }
        if (userAge <= 25) {
            return {
                chapter: 'Chapter IV: The Uncharted Craft',
                tagline: 'Building mastery, enduring obscurity, and taking calculated leaps',
                focus: 'Grit & Leadership',
                icon: '🔥',
            };
        }
        return {
            return: {
                chapter: 'Chapter V: The Master Trajectory',
                tagline: 'Synthesizing purpose, legacy, and multidimensional impact',
                focus: 'Strategic Vision & Wisdom',
                icon: '👑',
            }
        }.return;
    };

    const chapter = getChapterDetails(age);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mb-4">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#0d1024]/90 to-slate-900/90 border border-cyan-500/30 p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
                {/* Ambient glow */}
                <div className="absolute top-0 right-1/4 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Left Section: Chapter Info */}
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(0,242,255,0.2)] shrink-0">
                        {chapter.icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-black text-cyan-300 uppercase tracking-widest">
                                Age {age} Milestone
                            </span>
                            <span className="text-xs text-purple-300/80 font-bold flex items-center gap-1">
                                <Sparkles size={12} className="text-purple-400" /> Focus: {chapter.focus}
                            </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                            {chapter.chapter}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {chapter.tagline}
                        </p>
                    </div>
                </div>

                {/* Right Section: Check-In Action Button */}
                <button
                    onClick={() => {
                        audioManager.playClick();
                        onOpenCheckIn();
                    }}
                    className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,242,255,0.35)] hover:brightness-110 active:scale-95 transition-all"
                >
                    <Compass size={16} className="text-slate-950" />
                    <span>Navigate What's Next</span>
                    <ChevronRight size={14} />
                </button>
            </motion.div>
        </div>
    );
}
