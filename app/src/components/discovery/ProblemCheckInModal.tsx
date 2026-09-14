import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, X, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { safetyService } from '../../services/safetyService';
import { CrisisSupportModal } from './CrisisSupportModal';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../utils/supabase';
import { audioManager } from '../../utils/audioManager';

interface ProblemCheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProblemSubmitted: (situationText: string, tags: string[], lifeTheme?: string) => void;
}

const LIFE_THEME_CHIPS = [
    { id: 'career_uncertainty', label: 'Career Uncertainty', icon: '🎯', tags: ['career', 'uncertainty', 'future_path'] },
    { id: 'high_pressure_burnout', label: 'High Pressure & Burnout', icon: '🔥', tags: ['burnout', 'pressure', 'expectations'] },
    { id: 'risk_vs_safety', label: 'Risk vs Safety', icon: '🧭', tags: ['risk', 'safety', 'decision'] },
    { id: 'creative_block', label: 'Creative Block / Stuck', icon: '🎨', tags: ['creativity', 'stuck', 'reinvention'] },
    { id: 'imposter_syndrome', label: 'Imposter Syndrome', icon: '👥', tags: ['self_doubt', 'confidence', 'comparison'] },
    { id: 'leadership_loneliness', label: 'Leadership Challenges', icon: '👑', tags: ['leadership', 'team', 'responsibility'] },
    { id: 'family_expectations', label: 'Family & Social Pressure', icon: '🏠', tags: ['family', 'expectations', 'independence'] },
    { id: 'finding_purpose', label: 'Finding Purpose', icon: '🔍', tags: ['purpose', 'meaning', 'direction'] },
];

export function ProblemCheckInModal({ isOpen, onClose, onProblemSubmitted }: ProblemCheckInModalProps) {
    const profile = useUserStore((state) => state.profile);
    const [situationText, setSituationText] = useState('');
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isCrisisOpen, setIsCrisisOpen] = useState(false);
    const [crisisMessage, setCrisisMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleThemeToggle = (theme: typeof LIFE_THEME_CHIPS[0]) => {
        audioManager.playClick();
        if (selectedTheme === theme.id) {
            setSelectedTheme(null);
            setSelectedTags([]);
        } else {
            setSelectedTheme(theme.id);
            setSelectedTags(theme.tags);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        audioManager.playClick();

        const combinedText = `${situationText} ${selectedTheme ? selectedTheme.replace(/_/g, ' ') : ''}`.trim();
        if (!combinedText && selectedTags.length === 0) return;

        // 1. Run Safety / Crisis Evaluation
        const safety = safetyService.evaluateText(combinedText);
        if (safety.isCrisis) {
            setCrisisMessage(safety.supportMessage || '');
            setIsCrisisOpen(true);
            return;
        }

        setIsSubmitting(true);

        // 2. Persist to database if authenticated
        if (profile?.id && !profile.id.startsWith('offline-')) {
            try {
                await supabase.from('problem_checkins').insert({
                    user_id: profile.id,
                    situation_text: situationText || (selectedTheme ? selectedTheme.replace(/_/g, ' ') : 'General Navigation'),
                    situation_tags: selectedTags,
                    life_stage: profile.age ? (profile.age < 18 ? 'teens' : profile.age < 23 ? 'college' : 'early_career') : 'general',
                });
            } catch (err) {
                console.warn('[ProblemCheckIn] DB insert warning:', err);
            }
        }

        // 3. Callback to parent to update recommendation engine & feed
        onProblemSubmitted(situationText, selectedTags, selectedTheme || undefined);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <>
            <AnimatePresence>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-xl bg-gradient-to-b from-[#111322] via-[#0d0e17] to-[#07070b] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,242,255,0.2)] text-white overflow-hidden"
                    >
                        {/* Ambient glow */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                        >
                            <X size={18} />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                                <Compass size={22} className="animate-spin-slow" />
                            </div>
                            <div>
                                <span className="text-[11px] font-black text-cyan-400 uppercase tracking-widest">Life Navigation</span>
                                <h2 className="text-2xl font-black text-white leading-tight">What are you dealing with right now?</h2>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mb-6">
                            Tell AYA your current challenge. We will match you with a historical figure who faced something meaningfully similar at your age.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Freeform input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                                    <span>Describe your current situation or mindset:</span>
                                    <span className="text-[10px] text-slate-500 font-mono">Private & Confidential</span>
                                </label>
                                <textarea
                                    value={situationText}
                                    onChange={(e) => setSituationText(e.target.value)}
                                    placeholder="e.g. I have an entrance exam next month and feel immense pressure... or I want to start a side project but fear failure..."
                                    rows={3}
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                                />
                            </div>

                            {/* Quick Situation Themes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                                    <Tag size={13} className="text-cyan-400" />
                                    <span>Or select a theme you relate to today:</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                                    {LIFE_THEME_CHIPS.map((theme) => {
                                        const isSelected = selectedTheme === theme.id;
                                        return (
                                            <button
                                                key={theme.id}
                                                type="button"
                                                onClick={() => handleThemeToggle(theme)}
                                                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all text-xs font-bold ${
                                                    isSelected
                                                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,242,255,0.25)]'
                                                        : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                                                }`}
                                            >
                                                <span className="text-base shrink-0">{theme.icon}</span>
                                                <span className="truncate">{theme.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                    <ShieldCheck size={14} className="text-cyan-400" />
                                    <span>Self-discovery lens</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || (!situationText.trim() && !selectedTheme)}
                                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center gap-2 shadow-[0_0_25px_rgba(0,242,255,0.4)] hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <span>{isSubmitting ? 'Matching...' : 'Find Aligned Stories'}</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </AnimatePresence>

            {/* Crisis Support Trigger */}
            <CrisisSupportModal
                isOpen={isCrisisOpen}
                onClose={() => setIsCrisisOpen(false)}
                customMessage={crisisMessage}
            />
        </>
    );
}
