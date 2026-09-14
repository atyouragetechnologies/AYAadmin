import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ChevronLeft, Star, ChevronRight, Lock } from 'lucide-react';
import type { Level } from '../../types/gameTypes';
import { useUserStore } from '../../store/userStore';
import { audioManager as audioSynth } from "../../utils/audioManager";
import clsx from 'clsx';

interface CharacterSelectionProps {
    age: number;
    options: Level[];
    onSelect: (level: Level) => void;
    onBack: () => void;
}

export function CharacterSelection({ age, options, onSelect, onBack }: CharacterSelectionProps) {
    const isCandyMode = useUserStore((state) => state.isCandyMode);
    // Hover state removed as it is unused

    // Enter animation
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        audioSynth.playHover(); // Play a swoosh essentially
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1 
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <div className={clsx(
            "fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-700",
            isCandyMode 
                ? "bg-slate-50/95 sm:backdrop-blur-3xl" 
                : "bg-slate-950/95 sm:backdrop-blur-3xl"
        )}>
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={clsx(
                    "absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full sm:blur-[120px] blur-[60px] opacity-20 animate-pulse-slow",
                    isCandyMode ? "bg-pink-400" : "bg-cyan-600"
                )} />
                <div className={clsx(
                    "absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full sm:blur-[100px] blur-[50px] opacity-20 animate-pulse-slow rotate-180",
                    isCandyMode ? "bg-amber-400" : "bg-indigo-600"
                )} />
            </div>

            {/* Header */}
            <div className="absolute top-0 w-full p-6 md:p-10 flex items-center justify-between z-20">
                <button 
                    onClick={() => {
                        audioSynth.playClick();
                        onBack();
                    }}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all shadow-md active:scale-95",
                        isCandyMode
                            ? "bg-white text-slate-800 hover:bg-pink-50"
                            : "bg-slate-800/80 text-white hover:bg-slate-700 border border-white/10"
                    )}
                >
                    <ChevronLeft size={20} /> Back to Timeline
                </button>

                <div className={clsx(
                    "px-6 py-2 rounded-full border-2 font-black tracking-widest uppercase shadow-[0_0_15px_rgba(0,0,0,0.1)]",
                    isCandyMode 
                        ? "bg-pink-500 border-pink-400 text-white" 
                        : "bg-indigo-900 border-indigo-400 text-white"
                )}>
                    AGE {age}
                </div>
            </div>

            {/* Title */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
                transition={{ duration: 0.5 }}
                className="mt-20 mb-8 md:mb-12 text-center z-10 px-4"
            >
                <h1 className={clsx(
                    "text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4",
                    isCandyMode ? "text-slate-800" : "text-white"
                )}>
                    Choose Your Path
                </h1>
                <p className={clsx(
                    "text-lg md:text-xl max-w-2xl mx-auto font-medium",
                    isCandyMode ? "text-slate-500" : "text-slate-400"
                )}>
                    At {age}, these visionaries faced defining moments. Whose footsteps will you walk in today?
                </p>
            </motion.div>

            {/* Horizontal Scrollable/Flex Container for Cards */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                className="w-full max-w-7xl px-4 md:px-12 z-10 flex gap-6 overflow-x-auto snap-x snap-mandatory py-8 custom-scrollbar items-stretch"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {options.map((option) => {
                    const isUnlocked = option.status !== 'locked';
                    const isCompleted = option.status === 'completed';

                    return (
                        <motion.div
                            variants={itemVariants}
                            key={option.id}
                            className="snap-center min-w-[280px] md:min-w-[320px] w-[80vw] md:w-auto shrink-0 flex flex-col"
                            onHoverStart={() => {
                                if (isUnlocked) audioSynth.playHover();
                            }}
                            onHoverEnd={() => {}}
                        >
                            <button
                                onClick={() => {
                                    if (isUnlocked) {
                                        audioSynth.playClick();
                                        onSelect(option);
                                    }
                                }}
                                disabled={!isUnlocked}
                                className={clsx(
                                    "relative w-full flex-grow flex flex-col text-left group overflow-hidden transition-all duration-500 rounded-3xl",
                                    !isUnlocked && "opacity-60 grayscale cursor-not-allowed",
                                    isUnlocked && "hover:-translate-y-4 shadow-xl hover:shadow-2xl hover:shadow-pink-500/20",
                                    isCandyMode 
                                        ? "bg-white border-4 border-slate-100 ring-4 ring-pink-100 hover:border-pink-300"
                                        : "bg-[#0a0f28] border-2 border-[#4DD9FF]/30 hover:border-[#4DD9FF] hover:shadow-[0_0_30px_rgba(77,217,255,0.3)]"
                                )}
                            >
                                {/* IMAGE BACKGROUND */}
                                <div className="absolute inset-0 w-full h-[60%] overflow-hidden">
                                    <img 
                                        src={option.avatarUrl} 
                                        alt={option.personality} 
                                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Gradient overlay to transition into solid card color */}
                                    <div className={clsx(
                                        "absolute inset-0 bg-gradient-to-t",
                                        isCandyMode ? "from-white via-white/80 to-transparent" : "from-[#0a0f28] via-[#0a0f28]/90 to-transparent"
                                    )} />
                                </div>

                                {/* CONTENT CONTAINER */}
                                <div className="relative z-10 flex flex-col h-full mt-[40%] p-6 md:p-8">
                                    {isCompleted && (
                                        <div className="absolute top-0 right-6 -translate-y-1/2 flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                            <Star size={12} className="fill-yellow-900" /> COMPLETED
                                        </div>
                                    )}

                                    {!isUnlocked && (
                                        <div className="absolute top-0 right-6 -translate-y-1/2 bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 border border-slate-600">
                                            <Lock size={12} /> LOCKED
                                        </div>
                                    )}

                                    <div className={clsx(
                                        "text-xs font-bold tracking-widest uppercase mb-1 drop-shadow-sm",
                                        isCandyMode ? "text-pink-600" : "text-[#4DD9FF]"
                                    )}>
                                        {option.archetype}
                                    </div>

                                    <h3 className={clsx(
                                        "text-2xl md:text-3xl font-black uppercase leading-none mb-3",
                                        isCandyMode ? "text-slate-800" : "text-white"
                                    )}>
                                        {option.personality || option.title}
                                    </h3>

                                    <p className={clsx(
                                        "text-sm mb-6 flex-grow line-clamp-4",
                                        isCandyMode ? "text-slate-600" : "text-slate-400"
                                    )}>
                                        {option.description}
                                    </p>

                                    <div className={clsx(
                                        "mt-auto flex items-center justify-between font-bold text-sm tracking-wider uppercase transition-colors group-hover:opacity-100 group-hover:translate-x-2 duration-300",
                                        isCandyMode ? "text-pink-500" : "text-[#4DD9FF]"
                                    )}>
                                        <span>{isUnlocked ? "Play Story" : "Locked"}</span>
                                        {isUnlocked ? <ChevronRight size={18} /> : <Lock size={18} />}
                                    </div>
                                </div>
                            </button>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
