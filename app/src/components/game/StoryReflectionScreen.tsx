import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Target, Compass, Heart } from 'lucide-react';
import { getStoryMetadata } from '../../services/storyMetadataRegistry';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../utils/supabase';
import { audioManager } from '../../utils/audioManager';
import type { DissonanceInsight, PsychometricScores } from '../../types/gameTypes';

interface StoryReflectionScreenProps {
    level: any;
    choiceMade: any;
    matchScore?: number;
    stars?: number;
    xpEarned: number;
    onContinue: () => void;
}

export function StoryReflectionScreen({
    level,
    choiceMade,
    xpEarned,
    onContinue,
}: StoryReflectionScreenProps) {
    const profile = useUserStore((state) => state.profile);
    const scenarioId = level.scenarioId || level.id;
    const meta = getStoryMetadata(scenarioId, level);

    const [hasCommittedAction, setHasCommittedAction] = useState(false);
    const [userNotes] = useState('');
    const [relevanceRating, setRelevanceRating] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Compute Dissonance Insight ("You surprised yourself")
    const computeDissonance = (): DissonanceInsight => {
        const userScores: PsychometricScores = profile?.onboarding_scores || {
            risk: 50,
            creativity: 50,
            vision: 50,
            empathy: 50,
            leadership: 50,
        };

        const choiceText = (choiceMade?.text || choiceMade?.feedbackTitle || '').toLowerCase();

        // Check if choice is bold while baseline is cautious
        if (userScores.risk < 45 && (choiceText.includes('bold') || choiceText.includes('risk') || choiceText.includes('leap') || choiceText.includes('unconventional') || choiceText.includes('first principles'))) {
            return {
                hasDissonance: true,
                traitName: 'Risk Intelligence',
                baselineValue: userScores.risk,
                choiceDirection: 'bolder',
                headline: 'You surprised yourself with a bold move!',
                description:
                    'Your baseline profile leaned more cautious, but in this dilemma you chose the bold, decisive path. Your Emerging You is leaning bolder!',
            };
        }

        // Check if choice is creative while baseline is analytical
        if (userScores.creativity < 45 && (choiceText.includes('creative') || choiceText.includes('art') || choiceText.includes('express') || choiceText.includes('intuition'))) {
            return {
                hasDissonance: true,
                traitName: 'Creative Divergence',
                baselineValue: userScores.creativity,
                choiceDirection: 'more_visionary',
                headline: 'A spark of unexpected creativity!',
                description:
                    'You stepped outside your analytical comfort zone and trusted creative intuition. This expands your behavioral versatility.',
            };
        }

        // Standard alignment insight
        return {
            hasDissonance: false,
            headline: 'Aligned with your natural instincts',
            description: `Your decision reflects strong ${meta.dilemmaType.toLowerCase()} awareness, consistent with your core profile.`,
        };
    };

    const dissonance = computeDissonance();

    const handleFinalContinue = async () => {
        audioManager.playClick();
        setIsSaving(true);

        if (profile?.id && !profile.id.startsWith('offline-')) {
            try {
                await supabase.from('reflections_and_actions').insert({
                    user_id: profile.id,
                    scenario_id: scenarioId,
                    decision_selected: choiceMade?.text || choiceMade?.feedbackTitle || 'Selected Option',
                    dissonance_detected: dissonance.hasDissonance,
                    dissonance_insight: dissonance.description,
                    micro_action_committed: hasCommittedAction ? (meta.microActionPrompt || 'Committed to real-life action') : null,
                    action_completed: hasCommittedAction,
                    relevance_rating: relevanceRating || 4,
                    user_notes: userNotes || null,
                });
            } catch (err) {
                console.warn('[StoryReflection] DB insert warning:', err);
            }
        }

        setIsSaving(false);
        onContinue();
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#080911] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-cyan-500 selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-2xl bg-gradient-to-b from-[#121526]/95 via-[#0d0f1c]/95 to-[#080912]/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,242,255,0.2)] backdrop-blur-xl space-y-6 my-8"
            >
                {/* Header */}
                <div className="text-center space-y-1">
                    <span className="text-[11px] font-black text-cyan-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <Sparkles size={14} className="text-cyan-400" />
                        Decision & Reflection Analysis
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                        {level.personality || level.title} at Age {level.age || 18}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                        Lens: {meta.dilemmaType}
                    </p>
                </div>

                {/* 1. Choice Feedback Card */}
                {choiceMade && (
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                            <span>Your Decision</span>
                            <span className="text-cyan-300 font-mono">+{xpEarned} Wisdom XP</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white">
                            "{choiceMade.text || choiceMade.feedbackTitle}"
                        </h4>
                        {choiceMade.feedbackText && (
                            <p className="text-xs text-slate-300/90 leading-relaxed font-medium">
                                {choiceMade.feedbackText}
                            </p>
                        )}
                    </div>
                )}

                {/* 2. "You Surprised Yourself" (Dissonance Insight) */}
                <div
                    className={`p-4 rounded-2xl border transition-all ${
                        dissonance.hasDissonance
                            ? 'bg-gradient-to-r from-purple-950/40 via-[#1a1130] to-purple-950/40 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                            : 'bg-white/[0.02] border-white/5'
                    }`}
                >
                    <div className="flex items-center gap-2 mb-1.5">
                        {dissonance.hasDissonance ? (
                            <Zap size={16} className="text-amber-400 animate-pulse" />
                        ) : (
                            <Target size={16} className="text-cyan-400" />
                        )}
                        <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                            {dissonance.headline}
                        </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {dissonance.description}
                    </p>
                </div>

                {/* 3. Real-life Micro-Action Commitment */}
                {meta.microActionPrompt && (
                    <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                        <div className="flex items-center gap-2">
                            <Compass size={16} className="text-cyan-400" />
                            <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                                Today's Micro-Action
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                            {meta.microActionPrompt}
                        </p>

                        <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-400/40 cursor-pointer transition-all">
                            <input
                                type="checkbox"
                                checked={hasCommittedAction}
                                onChange={(e) => {
                                    audioManager.playClick();
                                    setHasCommittedAction(e.target.checked);
                                }}
                                className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-cyan-400 bg-slate-900"
                            />
                            <span className="text-xs font-bold text-slate-200">
                                I commit to trying this in my real life today
                            </span>
                        </label>
                    </div>
                )}

                {/* 4. One-Tap Relevance Feedback */}
                <div className="space-y-2 pt-1 border-t border-white/10">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Heart size={12} className="text-pink-400" />
                        Did this story speak to what you are currently dealing with?
                    </span>
                    <div className="flex items-center gap-2">
                        {[
                            { value: 5, label: '🌱 Deeply Relatable' },
                            { value: 4, label: '💡 Insightful' },
                            { value: 3, label: '⚡ Interesting' },
                        ].map((rating) => (
                            <button
                                key={rating.value}
                                type="button"
                                onClick={() => {
                                    audioManager.playClick();
                                    setRelevanceRating(rating.value);
                                }}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                    relevanceRating === rating.value
                                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,242,255,0.3)]'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {rating.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Continue Button */}
                <div className="pt-2">
                    <button
                        onClick={handleFinalContinue}
                        disabled={isSaving}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:brightness-110 active:scale-98 transition-all"
                    >
                        <span>{isSaving ? 'Saving Growth...' : 'Complete & Return to Roadmap'}</span>
                        <ArrowRight size={18} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
