import React, { useState } from 'react';
import { CHECKIN_TAGS } from '../../config/recommendationConfig';
import { detectCrisis } from '../../services/crisisDetection';
import { SafetyCard } from './SafetyCard';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../utils/supabase';
import { Sparkles, MessageSquare, ChevronRight, X } from 'lucide-react';
import type { CheckInData, CrisisRiskLevel } from '../../types/ayaTypes';

interface CheckInCardProps {
    onCheckInComplete?: (checkinData: CheckInData) => void;
    onClose?: () => void;
}

const trackSituationEvent = (eventName: string, parameters: Record<string, unknown> = {}) => {
    const analyticsWindow = window as typeof window & {
        gtag?: (command: 'event', name: string, params: Record<string, unknown>) => void;
    };
    analyticsWindow.gtag?.('event', eventName, parameters);
};

export const CheckInCard: React.FC<CheckInCardProps> = ({ onCheckInComplete, onClose }) => {
    const profile = useUserStore(state => state.profile);
    const updateSessionPreference = useUserStore(state => state.updateSessionPreference);
    const setCheckinData = useUserStore(state => state.setCheckinData);
    const setActiveSituationFilter = useUserStore(state => state.setActiveSituationFilter);

    const [selectedSituations, setSelectedSituations] = useState<string[]>([]);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [selectedIntents, setSelectedIntents] = useState<string[]>([]);
    const [freeText, setFreeText] = useState('');
    const [intensity, setIntensity] = useState<number>(3);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Crisis state
    const [crisisRisk, setCrisisRisk] = useState<CrisisRiskLevel>('none');

    const toggleTag = (val: string, list: string[], setList: (arr: string[]) => void) => {
        if (list.includes(val)) {
            setList(list.filter(item => item !== val));
        } else {
            setList([...list, val]);
        }
    };

    const handleSubmit = async () => {
        const checkinData: CheckInData = {
            situation_tags: selectedSituations,
            problem_tags: selectedSituations, // mapped
            emotional_tags: selectedEmotions,
            intent_tags: selectedIntents,
            free_text: freeText.trim() || undefined,
            intensity: intensity as any
        };

        // 1. Client-side fast crisis check
        const allTags = [...selectedSituations, ...selectedEmotions, ...selectedIntents];
        const crisisResult = detectCrisis(freeText, allTags);

        if (crisisResult.riskLevel === 'high') {
            setCrisisRisk('high');
            return; // STOP recommendations
        } else if (crisisResult.riskLevel === 'medium') {
            setCrisisRisk('medium');
            return;
        }

        setIsSubmitting(true);

        try {
            // Update store checkinData and activeSituationFilter for direct map reshaping
            setCheckinData(checkinData);
            const primarySituation = selectedSituations[0] || null;
            setActiveSituationFilter(primarySituation);
            if (primarySituation) {
                trackSituationEvent('situation_selected', { situation: primarySituation });
            }

            // Update session preferences in Zustand store
            allTags.forEach(tag => {
                updateSessionPreference(tag, 2.0);
            });

            // Persist check-in to Supabase if authenticated user
            if (profile?.id && !profile.id.startsWith('offline-')) {
                await supabase.from('user_checkins').insert({
                    user_id: profile.id,
                    situation_tags: selectedSituations,
                    problem_tags: selectedSituations,
                    emotional_tags: selectedEmotions,
                    intent_tags: selectedIntents,
                    free_text: freeText.trim() || null,
                    intensity: intensity,
                    crisis_risk_level: crisisResult.riskLevel,
                    is_crisis: crisisResult.isCrisis
                });
            }

            setSubmitted(true);
            if (onCheckInComplete) {
                onCheckInComplete(checkinData);
            }
        } catch (err) {
            console.error('Failed to submit checkin:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (crisisRisk !== 'none') {
        return (
            <SafetyCard
                riskLevel={crisisRisk}
                onDismiss={crisisRisk === 'medium' ? () => setCrisisRisk('none') : undefined}
            />
        );
    }

    if (submitted) {
        return (
            <div className="w-full p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md shadow-xl text-center text-white mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 mb-3">
                    <Sparkles size={24} />
                </div>
                <h3 className="text-lg font-bold text-cyan-300">AYA Has Updated Your Navigation Lens</h3>
                <p className="text-xs text-slate-300 mt-1">
                    Your recommendations below now prioritize stories from people who faced similar challenges.
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 text-xs text-slate-400 hover:text-white underline transition-colors"
                >
                    Update Check-In
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full p-6 rounded-3xl bg-slate-950/80 border border-purple-500/20 backdrop-blur-xl shadow-2xl text-white mb-8">
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-10"
                >
                    <X size={20} />
                </button>
            )}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
                    <MessageSquare size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-extrabold uppercase tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-cyan-200 to-white">
                        What are you dealing with right now?
                    </h3>
                    <p className="text-xs text-slate-400">
                        AYA will surface stories of historical figures who navigated similar moments.
                    </p>
                </div>
            </div>

            {/* Situation chips */}
            <div className="mb-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80 block mb-2">
                    Current Situation / Problem
                </label>
                <div className="flex flex-wrap gap-2">
                    {CHECKIN_TAGS.situation.map(chip => {
                        const isSelected = selectedSituations.includes(chip.value);
                        return (
                            <button
                                key={chip.value}
                                onClick={() => toggleTag(chip.value, selectedSituations, setSelectedSituations)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                    isSelected
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-purple-500/40 hover:text-white'
                                }`}
                            >
                                {chip.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Emotional State chips */}
            <div className="mb-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-300/80 block mb-2">
                    How does it feel?
                </label>
                <div className="flex flex-wrap gap-2">
                    {CHECKIN_TAGS.emotional.map(chip => {
                        const isSelected = selectedEmotions.includes(chip.value);
                        return (
                            <button
                                key={chip.value}
                                onClick={() => toggleTag(chip.value, selectedEmotions, setSelectedEmotions)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                    isSelected
                                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 scale-[1.02]'
                                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-white'
                                }`}
                            >
                                {chip.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Intent chips */}
            <div className="mb-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80 block mb-2">
                    What are you looking for?
                </label>
                <div className="flex flex-wrap gap-2">
                    {CHECKIN_TAGS.intent.map(chip => {
                        const isSelected = selectedIntents.includes(chip.value);
                        return (
                            <button
                                key={chip.value}
                                onClick={() => toggleTag(chip.value, selectedIntents, setSelectedIntents)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                    isSelected
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-500/40 hover:text-white'
                                }`}
                            >
                                {chip.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Free text input */}
            <div className="mb-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Or describe in your own words (optional)
                </label>
                <textarea
                    value={freeText}
                    onChange={e => setFreeText(e.target.value)}
                    placeholder="e.g. Trying to decide whether to change my major..."
                    className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 resize-none h-20"
                />
            </div>

            {/* Intensity slider */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        How intense is this for you?
                    </label>
                    <span className="text-xs font-bold text-purple-400">Level {intensity} / 5</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="5"
                    value={intensity}
                    onChange={e => setIntensity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
            </div>

            {/* Submit button */}
            <button
                onClick={handleSubmit}
                disabled={isSubmitting || (selectedSituations.length === 0 && selectedEmotions.length === 0 && !freeText.trim())}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 font-bold uppercase text-xs tracking-wider shadow-lg shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
            >
                {isSubmitting ? 'Personalizing Map...' : 'Find Relevant Stories'}
                <ChevronRight size={16} />
            </button>
        </div>
    );
};
