import { motion } from 'framer-motion';
import { Dna, TrendingUp, Sparkles, Zap, Heart, Eye, Target } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import type { PsychometricScores } from '../../types/gameTypes';

export function CurrentVsEmergingCard() {
    const profile = useUserStore((state) => state.profile);

    const baselineScores: PsychometricScores = profile?.onboarding_scores || {
        risk: 50,
        creativity: 50,
        vision: 50,
        empathy: 50,
        leadership: 50,
    };

    const emergingScores: PsychometricScores = profile?.gameplay_scores || baselineScores;

    const traitConfig: Array<{
        key: keyof PsychometricScores;
        label: string;
        color: string;
        bgBar: string;
        icon: any;
    }> = [
        { key: 'risk', label: 'Risk Intelligence', color: 'text-amber-400', bgBar: 'bg-amber-400', icon: Zap },
        { key: 'creativity', label: 'Creative Divergence', color: 'text-pink-400', bgBar: 'bg-pink-400', icon: Sparkles },
        { key: 'vision', label: 'Strategic Vision', color: 'text-cyan-400', bgBar: 'bg-cyan-400', icon: Eye },
        { key: 'empathy', label: 'Empathy & Harmony', color: 'text-emerald-400', bgBar: 'bg-emerald-400', icon: Heart },
        { key: 'leadership', label: 'Leadership Ambition', color: 'text-purple-400', bgBar: 'bg-purple-400', icon: Target },
    ];

    // Find the greatest shift between baseline and emerging
    let maxShift = { key: 'creativity' as keyof PsychometricScores, delta: 0, label: 'Creative Divergence' };
    traitConfig.forEach((t) => {
        const delta = Math.round(emergingScores[t.key] - baselineScores[t.key]);
        if (Math.abs(delta) >= Math.abs(maxShift.delta)) {
            maxShift = { key: t.key, delta, label: t.label };
        }
    });

    const storiesPlayed = profile?.stories_completed || 0;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mb-6">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#101323]/95 to-[#090b14]/95 border border-purple-500/30 p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                            <Dna size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                                    Identity Trajectory
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                                    {storiesPlayed} stories navigated
                                </span>
                            </div>
                            <h3 className="text-lg font-black text-white">Current You vs. Emerging You</h3>
                        </div>
                    </div>

                    {/* Dominant Shift Tag */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 text-xs font-bold text-purple-200">
                        <TrendingUp size={14} className="text-cyan-400" />
                        <span>
                            {maxShift.delta >= 0 ? `+${maxShift.delta}%` : `${maxShift.delta}%`} {maxShift.label} Evolution
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-5 text-[11px] font-bold text-slate-400 mb-3 px-1">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                        <span>Baseline (Current You)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,242,255,0.8)]" />
                        <span className="text-cyan-300">Gameplay (Emerging You)</span>
                    </div>
                </div>

                {/* Trait Comparison Bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {traitConfig.map((t) => {
                        const baseVal = Math.round(baselineScores[t.key] || 50);
                        const emergingVal = Math.round(emergingScores[t.key] || baseVal);
                        const delta = emergingVal - baseVal;
                        const Icon = t.icon;

                        return (
                            <div
                                key={t.key}
                                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
                            >
                                <div className="flex items-center justify-between text-xs font-bold mb-2">
                                    <div className="flex items-center gap-2">
                                        <Icon size={14} className={t.color} />
                                        <span className="text-slate-200">{t.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-mono text-[11px]">
                                        <span className="text-slate-400">{baseVal}%</span>
                                        <span className="text-slate-600">→</span>
                                        <span className="text-cyan-300 font-bold">{emergingVal}%</span>
                                        {delta !== 0 && (
                                            <span
                                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                                    delta > 0
                                                        ? 'bg-emerald-500/20 text-emerald-300'
                                                        : 'bg-amber-500/20 text-amber-300'
                                                }`}
                                            >
                                                {delta > 0 ? `+${delta}` : delta}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Dual Track Progress */}
                                <div className="relative h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                                    {/* Baseline Marker */}
                                    <div
                                        style={{ width: `${baseVal}%` }}
                                        className="absolute top-0 bottom-0 left-0 bg-slate-600 rounded-full opacity-60"
                                    />
                                    {/* Emerging Active Progress */}
                                    <motion.div
                                        initial={{ width: `${baseVal}%` }}
                                        animate={{ width: `${emergingVal}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full shadow-[0_0_10px_rgba(0,242,255,0.4)]`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
