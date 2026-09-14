import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartCrack, Zap, ShieldAlert, Coins, Target, Moon } from 'lucide-react';
import { audioManager as audioSynth } from "../../utils/audioManager";

export type MoodArchetype = 'Heartbreak' | 'Motivation' | 'Confidence' | 'Money' | 'Purpose' | 'Loneliness';

interface DailyChallengeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartChallenge: (mood: MoodArchetype) => void;
}

const MOODS: { id: MoodArchetype; title: string; icon: React.ReactNode; color: string }[] = [
    { id: 'Heartbreak', title: 'Heartbreak & Relationships', icon: <HeartCrack className="w-8 h-8" />, color: 'from-pink-500 to-rose-600' },
    { id: 'Motivation', title: 'Motivation & Drive', icon: <Zap className="w-8 h-8" />, color: 'from-amber-400 to-orange-600' },
    { id: 'Confidence', title: 'Confidence & Fear', icon: <ShieldAlert className="w-8 h-8" />, color: 'from-emerald-400 to-teal-600' },
    { id: 'Money', title: 'Money & Ambition', icon: <Coins className="w-8 h-8" />, color: 'from-lime-400 to-green-600' },
    { id: 'Purpose', title: 'Finding My Purpose', icon: <Target className="w-8 h-8" />, color: 'from-cyan-400 to-blue-600' },
    { id: 'Loneliness', title: 'Loneliness & Connection', icon: <Moon className="w-8 h-8" />, color: 'from-indigo-400 to-purple-600' }
];

export function DailyChallengeModal({ isOpen, onClose, onStartChallenge }: DailyChallengeModalProps) {
    const [selectedMood, setSelectedMood] = useState<MoodArchetype | null>(null);

    // Escape listener
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                audioSynth.playBack();
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Mount sound
    React.useEffect(() => {
        if (isOpen) audioSynth.playReveal();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 sm:backdrop-blur-2xl px-4 py-8"
                onClick={onClose}
            >
                {/* Cinematic Background Glows & Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full sm:blur-[120px] blur-[60px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/30 rounded-full sm:blur-[120px] blur-[60px]" />
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.7 + 0.1,
                                animationDuration: `${Math.random() * 3 + 2}s`,
                                animationDelay: `${Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide rounded-3xl bg-slate-900/50 border border-slate-700/50 shadow-2xl p-8 lg:p-12"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tight text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            WHAT'S ON YOUR MIND <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">TODAY?</span>
                        </h2>
                        <p className="text-lg text-slate-300 font-medium tracking-wide">
                            Choose your focus and we'll find your perfect story
                        </p>
                    </div>

                    {/* Mood Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {MOODS.map((mood, idx) => {
                            const isSelected = selectedMood === mood.id;
                            
                            return (
                                <motion.button
                                    key={mood.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    onClick={() => {
                                        audioSynth.playClick();
                                        setSelectedMood(mood.id);
                                    }}
                                    className={`relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-500 group overflow-hidden
                                        ${isSelected 
                                            ? `bg-slate-800/90 border-2 border-white ring-4 ring-white/20 shadow-[0_0_50px_rgba(255,255,255,0.4)] -translate-y-4 scale-105 z-10` 
                                            : `bg-slate-800/40 sm:backdrop-blur-md border border-slate-700/50 hover:bg-slate-800/90 hover:-translate-y-3 hover:scale-105 hover:rotate-1 hover:shadow-2xl hover:border-white/30 hover:z-10`
                                        }
                                    `}
                                    style={{ transformStyle: 'preserve-3d', perspective: '1000px', minHeight: '180px' }}
                                >
                                    {/* Neon Glow underlay when selected */}
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${mood.color} opacity-0 transition-opacity duration-500 ${isSelected ? 'opacity-30 blur-2xl' : 'group-hover:opacity-10 blur-xl'} pointer-events-none`} />
                                    
                                    <div className={`relative z-10 w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-gradient-to-br ${mood.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {mood.icon}
                                    </div>
                                    <h3 className={`relative z-10 text-center font-bold tracking-wide transition-colors ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                        {mood.title}
                                    </h3>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Call to Action - Always Rendered */}
                    <div className="flex justify-center mt-6">
                        <button
                            disabled={!selectedMood}
                            onClick={() => {
                                if (selectedMood) {
                                    audioSynth.playAchievementMinor();
                                    onStartChallenge(selectedMood);
                                }
                            }}
                            className={`relative group px-12 py-5 rounded-full font-black text-xl tracking-widest uppercase overflow-hidden transition-all duration-500
                                ${selectedMood 
                                    ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-[0_0_40px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95 hover:shadow-[0_0_60px_rgba(249,115,22,0.8)] cursor-pointer' 
                                    : 'bg-slate-800 border-2 border-slate-700 text-slate-500 cursor-not-allowed opacity-80'
                                }`}
                        >
                            <span className="relative z-10 transition-colors duration-300">
                                {selectedMood ? 'START MY CHALLENGE →' : 'SELECT A FOCUS'}
                            </span>
                            {/* Shimmer sweep */}
                            {selectedMood && (
                                <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] skew-x-[-20deg]" />
                            )}
                        </button>
                    </div>

                    {/* Close x */}
                    <button 
                        onClick={() => { audioSynth.playBack(); onClose(); }}
                        className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
