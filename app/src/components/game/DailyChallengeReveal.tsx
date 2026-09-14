import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Level } from '../../types/gameTypes';
import { audioManager as audioSynth } from "../../utils/audioManager";
import { useUserStore } from '../../store/userStore';

interface DailyChallengeRevealProps {
    mood: string;
    onComplete: (level: Level) => void;
    onClose: () => void;
}

export function DailyChallengeReveal({ mood, onComplete, onClose }: DailyChallengeRevealProps) {
    const levels = useUserStore((state) => state.levels);
    const userAge = useUserStore((state) => state.profile?.age) || 18;
    const [matchedLevel, setMatchedLevel] = useState<Level | null>(null);
    const [revealPhase, setRevealPhase] = useState<'analyzing' | 'revealed'>('analyzing');

    useEffect(() => {
        // Find best match based on mood
        let targetNames: string[] = [];
        
        switch (mood) {
            case 'Heartbreak': targetNames = ['Shah Rukh Khan', 'Taylor Swift', 'Frida Kahlo']; break;
            case 'Motivation': targetNames = ['Kobe Bryant', 'Sachin Tendulkar', 'Cristiano Ronaldo']; break;
            case 'Confidence': targetNames = ['Arnold', 'Eminem', 'P.V. Sindhu']; break;
            case 'Money': targetNames = ['Elon Musk', 'Bill Gates', 'Steve Jobs', 'Ratan Tata']; break;
            case 'Purpose': targetNames = ['Steve Jobs', 'Sundar Pichai', 'Indra Nooyi', 'A.P.J. Abdul Kalam']; break;
            case 'Loneliness': targetNames = ['Shah Rukh Khan', 'A.R. Rahman', 'J.K. Rowling']; break;
            default: targetNames = ['Bill Gates', 'Taylor Swift']; 
        }

        // Try to find a level that matches
        let found = levels.find(l => {
            const persona = l.personality || '';
            return targetNames.some(name => persona.includes(name));
        });

        // Fallback to literally any level if none perfectly match
        if (!found && levels.length > 0) {
            found = levels[0];
        }

        setMatchedLevel(found || null);

        // Advance sequence
        audioSynth.playHover();
        const t1 = setTimeout(() => {
            setRevealPhase('revealed');
            audioSynth.playClick(); // dramatic boom
        }, 3000);

        return () => clearTimeout(t1);
    }, [mood, levels]);

    if (!matchedLevel) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full min-h-[100dvh] flex items-center justify-center bg-black/90 backdrop-blur-md relative overflow-hidden font-['Space_Grotesk'] text-white"
            >
                {revealPhase === 'analyzing' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                            <div className="absolute inset-0 border-4 border-slate-800 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="absolute inset-2 border-4 border-orange-500/50 border-t-orange-500 rounded-full animate-spin" style={{ animationDuration: '1s' }} />
                            <div className="text-4xl">🧬</div>
                            {/* Glowing core */}
                            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500 animate-pulse">
                            ANALYZING FOCUS...
                        </h2>
                        <p className="text-slate-400 mt-4 tracking-widest font-mono text-sm">SEARCHING IDOL DATABASE</p>
                    </motion.div>
                )}

                {revealPhase === 'revealed' && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-3xl p-8 isolate overflow-hidden shadow-2xl flex flex-col items-center text-center"
                    >
                        {/* Cinematic Backdrop within card */}
                        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/40 to-transparent opacity-50 block" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(234,88,12,0.25)_0%,transparent_70%)]" />
                        
                        <p className="relative z-10 text-orange-400 font-bold tracking-widest uppercase mb-6 text-sm flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-orange-400/50" />
                            YOUR PERFECT MATCH
                            <span className="w-8 h-[1px] bg-orange-400/50" />
                        </p>

                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-slate-800 ring-4 ring-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.4)] mb-8"
                        >
                            <img src={matchedLevel.avatarUrl} alt={matchedLevel.personality} className="w-full h-full object-cover" />
                        </motion.div>

                        <h3 className="relative z-10 text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                            {matchedLevel.personality}
                        </h3>
                        <p className="relative z-10 text-xl text-slate-300 font-medium mb-8">
                            {matchedLevel.title}
                        </p>
                        
                        {matchedLevel.age_mirror_text && (
                            <p className="relative z-10 italic text-sm md:text-base mb-8 text-center px-4" style={{ color: '#00f1fe' }}>
                                At YOUR age ({userAge}), {matchedLevel.personality} was {matchedLevel.age_mirror_text}.
                            </p>
                        )}

                        <button
                            onClick={() => {
                                audioSynth.playClick();
                                onComplete(matchedLevel);
                            }}
                            className="relative z-10 group px-12 py-5 rounded-full bg-white text-slate-900 font-black text-lg tracking-widest uppercase overflow-hidden shadow-xl hover:scale-105 active:scale-95 transition-transform"
                        >
                            <span className="relative z-10">ENTER STORY →</span>
                            <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-slate-200/80 to-transparent group-hover:animate-[shimmer_1s_infinite] skew-x-[-20deg]" />
                        </button>
                    </motion.div>
                )}

                {/* Close Button during reveal phase */}
                {revealPhase === 'revealed' && (
                    <button 
                        onClick={onClose}
                        className="absolute top-24 right-6 p-2 rounded-full bg-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-colors z-50"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
