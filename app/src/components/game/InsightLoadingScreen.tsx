import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Compass, Zap } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LOADING_MASCOT_SRC = 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/Macot/watching left mascot.lottie';

interface InsightLoadingScreenProps {
    character: string;
    storyTitle?: string;
}

const STAGES = [
    {
        icon: Compass,
        title: "Scanning Turning Points",
        text: (char: string) => `Mapping the decisive crossroads in ${char}'s life...`,
        accent: "#00D9FF"
    },
    {
        icon: Brain,
        title: "Analyzing Decision Instincts",
        text: () => `Decoding your real-time response to pressure and uncertainty...`,
        accent: "#8B5CF6"
    },
    {
        icon: Zap,
        title: "Extracting Core Mindset",
        text: (char: string) => `Discovering the exact framework ${char} used to overcome this...`,
        accent: "#EC3B9A"
    },
    {
        icon: Sparkles,
        title: "Crafting Your Action Blueprint",
        text: () => `Synthesizing tailored takeaways you can apply today...`,
        accent: "#22E67A"
    }
];

export function InsightLoadingScreen({ character, storyTitle }: InsightLoadingScreenProps) {
    const cleanCharacter = character && character !== 'Default' ? character : 'this legend';
    const [stageIndex, setStageIndex] = useState(0);
    const [progress, setProgress] = useState(12);

    useEffect(() => {
        const stageTimer = setInterval(() => {
            setStageIndex((prev) => (prev + 1) % STAGES.length);
        }, 1600);

        const progressTimer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 94) return 94;
                return prev + Math.floor(Math.random() * 8 + 3);
            });
        }, 300);

        return () => {
            clearInterval(stageTimer);
            clearInterval(progressTimer);
        };
    }, []);

    const CurrentIcon = STAGES[stageIndex].icon;
    const currentAccent = STAGES[stageIndex].accent;

    return (
        <div className="fixed inset-0 z-[99998] bg-[#050817]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none overflow-hidden animate-fade-in">
            {/* Background Ambient Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8B5CF6]/15 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[#00D9FF]/15 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
                
                {/* Mascot with Orbiting Neon Glow */}
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 mb-3 sm:mb-4 flex items-center justify-center">
                    {/* Animated Holographic Rings */}
                    <div className="absolute inset-0 rounded-full border border-[#00D9FF]/30 animate-[spin_8s_linear_infinite]" />
                    <div className="absolute inset-3 rounded-full border border-[#8B5CF6]/30 border-dashed animate-[spin_12s_linear_infinite_reverse]" />
                    <div className="absolute inset-6 rounded-full border border-[#EC3B9A]/20 animate-pulse" />
                    
                    {/* Center Core Glow */}
                    <div 
                        className="absolute inset-6 rounded-full blur-2xl opacity-40 transition-colors duration-700"
                        style={{ backgroundColor: currentAccent }}
                    />

                    {/* Animated Mascot */}
                    <div className="relative z-10 w-full h-full aspect-square flex items-center justify-center pointer-events-none select-none">
                        <DotLottieReact
                            src={encodeURI(LOADING_MASCOT_SRC)}
                            loop
                            autoplay
                            renderConfig={{ autoResize: true }}
                            layout={{ fit: 'contain', align: [0.5, 0.5] }}
                            style={{ width: '100%', height: '100%' }}
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* Status Badge */}
                <motion.div 
                    key={stageIndex}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#111A38]/90 border border-white/10 shadow-lg mb-3 sm:mb-4"
                >
                    <CurrentIcon size={14} style={{ color: currentAccent }} className="animate-pulse sm:w-[15px] sm:h-[15px]" />
                    <span className="text-[10px] sm:text-[11px] md:text-xs font-bold uppercase tracking-widest text-white/90">
                        {STAGES[stageIndex].title}
                    </span>
                </motion.div>

                {/* Dynamic Rotating Insight Text */}
                <div className="min-h-[50px] sm:min-h-[56px] flex items-center justify-center px-4 mb-4 sm:mb-6">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={stageIndex}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.35 }}
                            className="text-sm sm:text-base md:text-lg font-medium text-white/90 leading-snug max-w-md"
                        >
                            {STAGES[stageIndex].text(cleanCharacter)}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full max-w-sm px-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
                        <span>Generating Insights</span>
                        <span style={{ color: currentAccent }}>{progress}%</span>
                    </div>

                    <div className="w-full h-2 bg-[#0D1530] rounded-full overflow-hidden p-[1px] border border-white/10 relative">
                        <motion.div 
                            className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#EC3B9A] to-[#00D9FF] shadow-[0_0_12px_#00D9FF]"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* Story Context Subtitle */}
                {storyTitle && (
                    <p className="text-[11px] text-white/40 mt-6 tracking-wide truncate max-w-xs">
                        From: <span className="text-white/70 font-semibold">{storyTitle}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
