import { useUserStore } from '../../store/userStore';
import { Zap, Sparkles, X, Crown } from 'lucide-react';
import { getRemainingFreeStories, isAyaPlusUser } from '../../services/accessControl';
import { audioManager as audioSynth } from '../../utils/audioManager';
import { resolvePersonalityAvatar } from '../../utils/avatarUtils';
import type { Level } from '../../types/gameTypes';
import clsx from 'clsx';

interface EnergyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    previewLevel?: Level | null;
}

export function EnergyModal({ isOpen, onClose, onUpgrade, previewLevel }: EnergyModalProps) {
    const profile = useUserStore((state) => state.profile);
    const mapTheme = useUserStore((state) => state.mapTheme);
    const isCandyMode = mapTheme === 'light';

    if (!isOpen) return null;

    const remainingEnergy = getRemainingFreeStories(profile);
    const isAyaPlus = isAyaPlusUser(profile);
    const isDepleted = remainingEnergy <= 0;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
            <div 
                className={clsx(
                    "relative w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl border shadow-2xl p-6 md:p-8 flex flex-col transition-all duration-300",
                    isCandyMode 
                        ? "bg-white border-amber-300 text-slate-900 shadow-pink-200/50" 
                        : "bg-slate-900/95 border-amber-500/40 text-white shadow-[0_0_50px_rgba(245,158,11,0.2)]"
                )}
            >
                {/* Close Button */}
                <button
                    onClick={() => {
                        audioSynth.playClick();
                        onClose();
                    }}
                    className={clsx(
                        "absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors text-sm font-bold border",
                        isCandyMode
                            ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600"
                            : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                    )}
                >
                    <X size={18} />
                </button>

                {/* Top Badge */}
                <div className="flex items-center gap-2 mb-3">
                    <span className={clsx(
                        "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-sm",
                        isDepleted 
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    )}>
                        <Zap size={14} className={isDepleted ? "text-amber-400 fill-amber-400" : "text-cyan-400 fill-cyan-400 animate-pulse"} />
                        {isDepleted ? "Free Limit Reached" : "Free Story Energy"}
                    </span>
                </div>

                {/* Main Heading */}
                <h2 className={clsx(
                    "text-2xl md:text-3xl font-black uppercase tracking-tight mb-2",
                    isCandyMode ? "text-slate-900" : "text-amber-100 drop-shadow-sm"
                )}>
                    {isDepleted ? "All Free Stories Completed!" : `${remainingEnergy} of 3 Stories Available`}
                </h2>

                <p className={clsx(
                    "text-sm md:text-base leading-relaxed mb-6 font-medium",
                    isCandyMode ? "text-slate-600" : "text-slate-300"
                )}>
                    {isDepleted 
                        ? "You've finished your free trial stories. Unlock AYA+ to keep playing and dive deeper into your journey!"
                        : `You have ${remainingEnergy} free ${remainingEnergy === 1 ? 'story' : 'stories'} left to play. Make each choice count!`
                    }
                </p>

                {/* Visual Battery Bar */}
                <div className={clsx(
                    "p-4 rounded-2xl border mb-6 flex flex-col gap-3",
                    isCandyMode ? "bg-amber-50/80 border-amber-200" : "bg-slate-950/60 border-slate-800"
                )}>
                    <div className="flex justify-between items-center text-xs font-bold">
                        <span className={clsx(isCandyMode ? "text-slate-700" : "text-slate-400")}>Remaining Energy</span>
                        <span className="text-amber-400 font-mono tracking-wider">{remainingEnergy} / 3 Energy</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                        {Array.from({ length: 3 }).map((_, idx) => {
                            const isAvailable = idx < remainingEnergy;
                            return (
                                <div 
                                    key={idx} 
                                    className={clsx(
                                        "h-3.5 rounded-full transition-all duration-500 relative overflow-hidden",
                                        isAvailable
                                            ? "bg-gradient-to-r from-amber-400 to-yellow-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                                            : (isCandyMode ? "bg-slate-200" : "bg-slate-800")
                                    )}
                                >
                                    {isAvailable && (
                                        <div className="absolute inset-0 bg-white/30 animate-pulse" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Specific Story Preview (If user clicked an upcoming story) */}
                {previewLevel && (
                    <div className={clsx(
                        "p-4 rounded-2xl border mb-6 relative overflow-hidden flex items-center gap-4",
                        isCandyMode
                            ? "bg-gradient-to-r from-amber-100/70 to-pink-50 border-amber-300"
                            : "bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                    )}>
                        <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full overflow-hidden border-2 border-amber-400 shadow-md">
                            <img 
                                src={previewLevel.portrait ? `https://aya-assets-proxy.atyouragetechnologies.workers.dev/portraits/${previewLevel.portrait}` : (previewLevel.avatarUrl || resolvePersonalityAvatar(previewLevel.personality || ''))} 
                                alt={previewLevel.personality || ''}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400 mb-0.5">
                                <Sparkles size={12} className="shrink-0" />
                                <span>Upcoming Journey</span>
                            </div>
                            <h4 className="text-base md:text-lg font-black uppercase tracking-tight truncate text-white">
                                {previewLevel.personality}
                            </h4>
                            <p className="text-xs font-semibold text-slate-300 truncate">
                                Age {previewLevel.age} • {previewLevel.archetype}
                            </p>
                            <p className="text-xs italic text-amber-200/90 mt-1 line-clamp-1">
                                "{previewLevel.fame || previewLevel.lesson || previewLevel.title}"
                            </p>
                        </div>
                    </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            audioSynth.playClick();
                            if (isDepleted) {
                                onUpgrade();
                            } else {
                                onClose();
                            }
                        }}
                        className={clsx(
                            "w-full py-3.5 rounded-2xl font-black uppercase tracking-wider text-sm transition-transform active:scale-95 hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2",
                            isDepleted
                                ? (isCandyMode 
                                    ? "bg-slate-900 text-white shadow-slate-900/20" 
                                    : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-lg")
                                : (isCandyMode 
                                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-amber-400/40" 
                                    : "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.4)]")
                        )}
                    >
                        {isDepleted ? "Upgrade to AYA+ 🌙" : "Continue Journey ⚡"}
                    </button>

                    {/* Pro Upgrade Link */}
                    {!isAyaPlus && (
                        <button
                            onClick={() => {
                                audioSynth.playClick();
                                onUpgrade();
                            }}
                            className={clsx(
                                "w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                isCandyMode 
                                    ? "text-pink-600 hover:text-pink-700 hover:bg-pink-50" 
                                    : "text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 border border-cyan-500/20"
                            )}
                        >
                            <Crown size={14} className="text-yellow-400" />
                            <span>Ready for more? <strong>Unlock AYA+</strong></span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
