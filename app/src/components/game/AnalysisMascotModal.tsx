import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const ANALYSIS_MASCOT_ASSETS = {
    BIRD: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/Macot/mascot with bird.lottie',
    HAPPY: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/Macot/happy mascot.lottie',
    WINNER: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/Macot/Winner mascot.lottie',
    WAVING: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/Macot/waving mascot.lottie',
} as const;

interface AnalysisMascotModalProps {
    parts: string[];
    onComplete: () => void;
    theme: 'candy' | 'dark';
}

export const AnalysisMascotModal: React.FC<AnalysisMascotModalProps> = ({ parts, onComplete }) => {
    const activeParts = (parts && parts.length > 0) ? parts : [
        "Your strategic instinct in this scenario aligns with high-conviction decision making.",
        "Choosing decisive action under pressure reveals your resilience and clarity of purpose.",
        "Apply this framework to one challenge in your life today to maintain your momentum."
    ];
    const [step, setStep] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    // Preload mascot animations into browser cache
    useEffect(() => {
        Object.values(ANALYSIS_MASCOT_ASSETS).forEach((assetUrl) => {
            fetch(encodeURI(assetUrl)).catch(() => {});
        });
    }, []);

    useEffect(() => {
        setDisplayedText("");
        setIsTyping(true);
        let i = 0;
        const text = activeParts[step] || "";
        // 20ms per character for smooth type-in
        const interval = setInterval(() => {
            setDisplayedText(text.slice(0, i));
            i++;
            if (i > text.length) {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 20);
        return () => clearInterval(interval);
    }, [step, activeParts]);

    const handleNext = () => {
        if (step < activeParts.length - 1) {
            setStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050817]/95 backdrop-blur-xl p-4 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={clsx(
                    "relative w-full max-w-3xl m-auto rounded-3xl md:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col gap-4",
                    "bg-gradient-to-b from-[#0D1530] to-[#070B1F] border border-[#506EFF]/30 text-white shrink-0"
                )}
            >
                {/* Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[#00D9FF]/50 to-transparent blur-sm rounded-full" />
                <div className="absolute -inset-1 bg-gradient-to-r from-[#8B5CF6]/10 via-[#00D9FF]/10 to-[#EC3B9A]/10 rounded-3xl md:rounded-[2rem] blur-xl -z-10" />

                {/* Progress Header */}
                <div className="flex justify-between items-center px-2 sm:px-4 w-full relative z-20">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#00D9FF]">Insights</span>
                        <div className="flex gap-1 sm:gap-1.5">
                            {activeParts.map((_, i) => (
                                <motion.div 
                                    key={i}
                                    className={clsx(
                                        "h-1.5 rounded-full transition-all duration-500",
                                        i === step 
                                            ? "w-6 sm:w-8 bg-[#00D9FF] shadow-[0_0_10px_#00D9FF]"
                                             : i < step
                                            ? "w-2.5 sm:w-3 bg-[#00D9FF]/50"
                                            : "w-2.5 sm:w-3 bg-white/10"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={onComplete}
                        className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 sm:gap-4 flex-1 mt-2 relative z-10 w-full max-w-2xl mx-auto">
                    {/* Dialog Box Area */}
                    <div className="w-full relative min-h-[100px] sm:min-h-[120px] flex flex-col justify-end">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="relative bg-[#111A38]/90 backdrop-blur-md p-4 sm:p-5 border border-[#00D9FF]/20 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-2"
                            >
                                {/* Speech Bubble Tail pointing to the mascot below */}
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-transparent border-t-[#111A38]/90 filter drop-shadow-[0_4px_2px_rgba(0,0,0,0.1)]" />
                                
                                {/* Inner tail border overlay to match the bubble's border */}
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-transparent border-t-[#00D9FF]/20 -z-10 scale-110 translate-y-[1px]" />
                                
                                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/95 font-medium relative z-10 min-h-[3rem]">
                                    {displayedText}
                                    {isTyping && <span className="inline-block w-1.5 h-4 sm:h-5 ml-1 bg-[#00D9FF] animate-pulse align-middle" />}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Mascot Area */}
                    <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 aspect-square shrink-0 relative flex items-center justify-center mx-auto my-1">
                        {/* Glow effect */}
                        <div className="absolute inset-4 bg-gradient-to-tr from-[#00D9FF]/20 via-[#8B5CF6]/30 to-[#EC3B9A]/20 blur-2xl rounded-full animate-pulse" />
                        <div className="absolute inset-0 rounded-full border border-[#00D9FF]/20 animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-2 rounded-full border border-[#8B5CF6]/20 border-dashed animate-[spin_14s_linear_infinite_reverse]" />
                        
                        {/* Animated Lottie Layer - Keyed by step to cleanly initialize without distortion */}
                        <div className="relative z-10 w-full h-full aspect-square flex items-center justify-center pointer-events-none select-none">
                            <DotLottieReact
                                key={step}
                                src={encodeURI(
                                    step === 0 
                                        ? ANALYSIS_MASCOT_ASSETS.BIRD 
                                        : step === 1 
                                            ? ANALYSIS_MASCOT_ASSETS.HAPPY 
                                            : ANALYSIS_MASCOT_ASSETS.WINNER
                                )}
                                loop
                                autoplay
                                renderConfig={{ autoResize: true }}
                                layout={{ fit: 'contain', align: [0.5, 0.5] }}
                                style={{ width: '100%', height: '100%' }}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-2 sm:mt-4 pt-4 border-t border-white/10 w-full z-20">
                    <button 
                        onClick={handlePrev}
                        disabled={step === 0}
                        className={clsx(
                            "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all",
                            step === 0 
                                ? "opacity-0 pointer-events-none" 
                                : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" /> Previous
                    </button>

                    <button 
                        onClick={handleNext}
                        className={clsx(
                            "group relative overflow-hidden flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:shadow-[0_0_30px_rgba(0,217,255,0.4)] transition-all hover:scale-105 active:scale-95"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] via-[#EC3B9A] to-[#00D9FF]" />
                        <div className="absolute inset-[2px] bg-[#050817] rounded-full transition-opacity group-hover:opacity-0" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] via-[#EC3B9A] to-[#00D9FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10 flex items-center gap-2">
                            {step === activeParts.length - 1 ? 'Complete Story' : 'Next'}
                            {step === activeParts.length - 1 ? <Check size={16} className="sm:w-[18px] sm:h-[18px]" /> : <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform" />}
                        </span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

