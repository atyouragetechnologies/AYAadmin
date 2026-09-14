import type { Level } from '../../types/gameTypes';
import { Play, Trophy, Sparkles, Star } from 'lucide-react';
import { audioManager as audioSynth } from "../../utils/audioManager";
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { bgmManager } from '../../utils/bgmManager';

interface PersonalityIntroProps {
    level: Level;
    onStart: () => void;
    onBack: () => void;
}

export function PersonalityIntro({ level, onStart, onBack }: PersonalityIntroProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const isCandyMode = useUserStore((state) => state.isCandyMode);

    useEffect(() => {
        setIsVisible(true);
        if (audioSynth.playReveal) {
            try {
                audioSynth.playReveal();
            } catch (e) { console.warn("Audio failed", e); }
        }

        // Stop BGM when unmounting (either going back or starting game)
        return () => {
            bgmManager.stop(1);
        };
    }, []);

    const handleStart = () => {
        audioSynth.playClick();
        setIsVisible(false);
        setTimeout(onStart, 300);
    };

    return (
        <div className={clsx(
            "w-full min-h-[100dvh] flex items-center justify-center transition-opacity duration-500 p-4 pb-safe",
            isCandyMode ? "bg-pink-50" : "bg-slate-950",
            isVisible ? "opacity-100" : "opacity-0"
        )}>
            <div className={clsx(
                "relative w-full max-w-5xl h-[85vh] md:h-[700px] flex flex-col md:flex-row rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 transform ring-8",
                isCandyMode ? "bg-white ring-white/10" : "bg-[#0a0f28] ring-[#4DD9FF]/10 border border-[#4DD9FF]/30",
                isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-10"
            )}>

                {/* LEFT: CHARACTER (Vibrant Gradient Background) */}
                <div className={clsx(
                    "w-full md:w-5/12 h-[40%] md:h-full relative overflow-hidden group border-b-4 md:border-b-0 md:border-r-4",
                    isCandyMode ? "border-white" : "border-[#4DD9FF]/30"
                )}>
                    {/* Background Pattern */}
                    <div className={clsx(
                        "absolute inset-0 animate-gradient-slow",
                        isCandyMode ? "bg-gradient-to-br from-pink-400 via-rose-500 to-purple-600" : "bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-950"
                    )} />
                    <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)', backgroundSize: '40px 40px' }}
                    />

                    {/* Character Image Shimmer Skeleton */}
                    {!imgLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm z-10 animate-pulse">
                            <Sparkles className="w-10 h-10 text-cyan-400 animate-spin" />
                            <span className="text-[10px] font-mono tracking-widest text-cyan-300 mt-2 uppercase">Rendering Legend...</span>
                        </div>
                    )}

                    {/* Character Image */}
                    <img
                        src={level.portrait ? `https://aya-assets-proxy.atyouragetechnologies.workers.dev/portraits/${level.portrait}` : level.avatarUrl}
                        alt={level.personality}
                        onLoad={() => setImgLoaded(true)}
                        className={clsx(
                            "absolute inset-0 w-full h-full object-cover object-top filter md:scale-110 md:group-hover:scale-115 transition-all duration-700 origin-top",
                            imgLoaded ? "opacity-100" : "opacity-0",
                            isCandyMode ? "contrast-110" : "saturate-110 brightness-90 contrast-125"
                        )}
                    />
                    <div className={clsx(
                        "absolute inset-0 opacity-80",
                        isCandyMode ? "bg-gradient-to-t from-black/60 via-transparent to-transparent" : "bg-gradient-to-t from-[#0a0f28]/90 via-transparent to-[#4DD9FF]/10 mix-blend-overlay"
                    )} />
                </div>

                {/* RIGHT: CONTENT (Gamified UI) */}
                <div className={clsx(
                    "w-full md:w-7/12 h-[60%] md:h-full p-6 md:p-10 flex flex-col relative overflow-y-auto custom-scrollbar",
                    isCandyMode ? "bg-slate-50" : "bg-transparent"
                )}>

                    {/* Header Pills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <div className={clsx(
                            "px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1 animate-bounce-slow",
                            isCandyMode ? "bg-yellow-400 text-yellow-900" : "bg-amber-500/20 border border-amber-500/50 text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"
                        )}>
                            <Star size={12} className={clsx(isCandyMode ? "fill-yellow-900" : "fill-amber-400 drop-shadow-md")} /> Age {level.age}
                        </div>
                        <div className={clsx(
                            "px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm",
                            isCandyMode ? "bg-slate-200 text-slate-600" : "bg-[#4DD9FF]/10 border border-[#4DD9FF]/30 text-[#4DD9FF] drop-shadow-[0_0_5px_rgba(77,217,255,0.3)]"
                        )}>
                            {level.archetype}
                        </div>
                    </div>

                    {/* Title & Fame */}
                    <div className="mb-4 md:mb-6">
                        <h1 className={clsx(
                            "text-3xl md:text-6xl font-black leading-none uppercase tracking-tighter mb-2",
                            isCandyMode 
                                ? "text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 drop-shadow-sm" 
                                : "text-[#E8E0FF] drop-shadow-[0_0_15px_rgba(232,224,255,0.4)]"
                        )}>
                            {level.personality}
                        </h1>
                        {level.fame && (
                            <div className={clsx(
                                "font-bold text-base md:text-2xl italic flex flex-wrap items-center gap-2",
                                isCandyMode ? "text-pink-600" : "text-[#4DD9FF] drop-shadow-[0_0_8px_rgba(77,217,255,0.5)]"
                            )}>
                                <Sparkles size={20} className="md:w-6 md:h-6 animate-pulse" />
                                "{level.fame}"
                            </div>
                        )}
                    </div>

                    {/* Bio & Achievements */}
                    <div className="space-y-4 md:space-y-6 flex-1">
                        <p className={clsx(
                            "text-base md:text-2xl font-medium leading-relaxed border-l-4 pl-4",
                            isCandyMode ? "text-slate-700 border-slate-300" : "text-slate-300 border-[#4DD9FF]/50 drop-shadow-sm"
                        )}>
                            {level.bio || level.description}
                        </p>

                        {/* Achievements List */}
                        {level.achievements && (
                            <div className={clsx(
                                "rounded-2xl p-4 md:p-6 shadow-md border",
                                isCandyMode ? "bg-white border-slate-100" : "bg-slate-900/50 backdrop-blur-sm border-[#4DD9FF]/30 shadow-[0_0_15px_rgba(77,217,255,0.1)]"
                            )}>
                                <h3 className={clsx(
                                    "text-xs md:text-sm font-black uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2",
                                    isCandyMode ? "text-slate-400" : "text-[#4DD9FF]/80 drop-shadow-[0_0_5px_rgba(77,217,255,0.5)]"
                                )}>
                                    <Trophy size={16} className={clsx("md:w-[18px]", isCandyMode ? "text-yellow-500" : "text-amber-400 drop-shadow-md")} /> Unlockable Achievements
                                </h3>
                                <ul className="space-y-2 md:space-y-3">
                                    {level.achievements.map((item, i) => (
                                        <li key={i} className={clsx(
                                            "flex items-start gap-3 font-bold text-sm md:text-xl",
                                            isCandyMode ? "text-slate-800" : "text-slate-200"
                                        )}>
                                            <span className={clsx("mt-1 text-xs", isCandyMode ? "text-pink-500" : "text-[#4DD9FF] drop-shadow-[0_0_8px_rgba(77,217,255,0.8)]")}>●</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* The Lesson Box */}
                        <div className={clsx(
                            "p-4 md:p-6 rounded-2xl border-2 relative overflow-hidden",
                            isCandyMode 
                                ? "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-100" 
                                : "bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        )}>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles size={40} className={clsx("md:w-[60px]", isCandyMode ? "text-pink-500" : "text-amber-400")} />
                            </div>
                            <h3 className={clsx(
                                "text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1",
                                isCandyMode ? "text-pink-500" : "text-amber-500 drop-shadow-md"
                            )}>
                                Today's Lesson
                            </h3>
                            <p className={clsx(
                                "font-bold text-sm md:text-lg",
                                isCandyMode ? "text-slate-800" : "text-amber-100 drop-shadow-sm"
                            )}>
                                "{level.lesson || "Discover your path."}"
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className={clsx(
                        "pt-4 md:pt-6 mt-auto flex gap-4 sticky bottom-0 pb-safe",
                        isCandyMode ? "bg-slate-50/90 backdrop-blur-sm" : "bg-[#0a0f28]/95 backdrop-blur-md border-t border-[#4DD9FF]/10 pt-4"
                    )}>
                        <button
                            onClick={handleStart}
                            className={clsx(
                                "flex-1 text-white font-black py-3 md:py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 border-b-4 text-base md:text-lg uppercase tracking-wide group",
                                isCandyMode
                                    ? "bg-gradient-to-r from-pink-500 to-rose-600 shadow-[0_8px_20px_rgba(236,72,153,0.3)] border-rose-800"
                                    : "bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.4)] border-amber-800 text-shadow-sm"
                            )}
                        >
                            <Play size={20} className="md:w-6 md:h-6 fill-white group-hover:animate-pulse" />
                            Start Journey
                        </button>
                        <button
                            onClick={() => {
                                audioSynth.playClick();
                                onBack();
                            }}
                            className={clsx(
                                "w-14 md:w-16 flex items-center justify-center border-2 rounded-2xl transition-all font-bold",
                                isCandyMode
                                    ? "border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600 hover:bg-white"
                                    : "border-[#4DD9FF]/30 text-[#4DD9FF]/70 hover:border-[#4DD9FF] hover:text-[#4DD9FF] hover:bg-[#4DD9FF]/10 hover:shadow-[0_0_15px_rgba(77,217,255,0.2)]"
                            )}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
