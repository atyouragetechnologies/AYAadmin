import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioManager as audioSynth } from "../../utils/audioManager";
import { Trophy, Sparkles } from 'lucide-react';

interface LevelUpCelebrationProps {
    levelName: string;
    levelNumber: number;
    onComplete: () => void;
}

export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({ levelName, levelNumber, onComplete }) => {
    useEffect(() => {
        // Play level up sound
        audioSynth.playAchievementMajor();
        
        // Auto dismiss after 3.5 seconds
        const timer = setTimeout(() => {
            onComplete();
        }, 3500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div 
            onClick={onComplete}
            className="w-full min-h-[100dvh] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden select-none cursor-pointer"
        >
            {/* Celebration Particles FX */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                        animate={{ 
                            opacity: 0, 
                            scale: Math.random() * 2 + 1.5,
                            x: (Math.random() - 0.5) * window.innerWidth * 0.8,
                            y: (Math.random() - 0.5) * window.innerHeight * 0.8
                        }}
                        transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                            backgroundColor: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6'][Math.floor(Math.random() * 5)],
                            boxShadow: '0 0 10px currentColor'
                        }}
                    />
                ))}
            </div>

            <motion.div 
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
                transition={{ type: "spring", damping: 12, stiffness: 100 }}
                className="relative flex flex-col items-center z-10"
                onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-20 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.2)_0%,transparent_70%)] pointer-events-none"
                />

                <div className="relative mb-6">
                    <Trophy className="w-32 h-32 text-amber-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]" />
                    <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-pink-400 animate-pulse drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
                </div>

                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-[0.2em] mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] text-center w-full">
                    Level Up!
                </h1>

                <div className="mt-6 flex flex-col items-center">
                    <span className="text-amber-500 font-bold tracking-widest uppercase mb-1">You reached Level {levelNumber}</span>
                    <div className="px-8 py-3 bg-gradient-to-r from-amber-500/20 via-amber-400/40 to-amber-500/20 border-y border-amber-400/50 backdrop-blur-md">
                        <span className="text-3xl md:text-4xl font-black text-amber-100 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] tracking-widest uppercase">
                            {levelName}
                        </span>
                    </div>
                </div>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onComplete();
                    }}
                    className="mt-12 px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-bold uppercase tracking-widest transition-all"
                >
                    Continue
                </motion.button>
            </motion.div>
        </div>
    );
};
