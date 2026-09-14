import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { audioManager as audioSynth } from "../../utils/audioManager";
import { Flame, Sparkles } from 'lucide-react';

interface StreakCelebrationProps {
    streak: number;
    xpEarned: number;
    isMilestone: boolean;
    onComplete: () => void;
}

export const StreakCelebration: React.FC<StreakCelebrationProps> = ({ streak, xpEarned, isMilestone, onComplete }) => {
    useEffect(() => {
        audioSynth.playHover(); // Use a sound effect
        
        // Auto dismiss
        const timer = setTimeout(() => {
            onComplete();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    const particles = useMemo(() => Array.from({ length: 30 }).map(() => ({
        scale: Math.random() * 2 + 1.5,
        x: (Math.random() - 0.5) * window.innerWidth * 0.9,
        y: (Math.random() - 0.5) * window.innerHeight * 0.9,
        duration: 1.5 + Math.random(),
        color: ['#f97316', '#ef4444', '#f59e0b', '#dc2626'][Math.floor(Math.random() * 4)]
    })), []);

    return (
        <div 
            className="w-full min-h-[100dvh] z-[250] flex flex-col items-center justify-center bg-black/95 overflow-hidden select-none cursor-pointer"
            onClick={onComplete}
        >
            {/* Celebration Particles FX */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {particles.map((p, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                        animate={{ 
                            opacity: 0, 
                            scale: p.scale,
                            x: p.x,
                            y: p.y
                        }}
                        transition={{ duration: p.duration, ease: "easeOut" }}
                        className="absolute w-4 h-4 rounded-full"
                        style={{
                            backgroundColor: p.color,
                            boxShadow: '0 0 15px currentColor'
                        }}
                    />
                ))}
            </div>

            <motion.div 
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
                className="relative flex flex-col items-center z-10"
                onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-32 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.25)_0%,transparent_70%)] pointer-events-none"
                />

                <div className="relative mb-6">
                    <Flame className="w-40 h-40 text-orange-500 drop-shadow-[0_0_40px_rgba(249,115,22,1)]" />
                    {isMilestone && (
                        <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-yellow-300 animate-spin-slow drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]" />
                    )}
                </div>

                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-widest mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white via-orange-300 to-red-600 drop-shadow-[0_0_20px_rgba(249,115,22,0.6)] text-center w-full">
                    {isMilestone ? "MILESTONE!" : "STREAK EXTENDED!"}
                </h1>

                <div className="mt-8 flex flex-col items-center">
                    <span className="text-orange-400 font-bold tracking-[0.3em] uppercase mb-2">You reached a</span>
                    <div className="px-10 py-4 bg-gradient-to-r from-orange-600/20 via-red-500/40 to-orange-600/20 border-y-2 border-orange-500/50 backdrop-blur-md flex flex-col items-center">
                        <span className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(249,115,22,1)] tracking-widest">
                            🔥 {streak} DAY STREAK
                        </span>
                        <span className="text-green-400 font-bold tracking-widest mt-2">
                            +{xpEarned} XP
                        </span>
                    </div>
                </div>
                <div className="mt-12 opacity-90 hover:opacity-100 transition-opacity animate-fade-in-up" style={{ animationDelay: '1s' }}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onComplete(); }}
                        className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold tracking-widest shadow-[0_0_20px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95 transition-transform"
                    >
                        CONTINUE &rarr;
                    </button>
                </div>

            </motion.div>
        </div>
    );
};
