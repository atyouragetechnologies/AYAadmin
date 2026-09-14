import React from 'react';
import { Calendar, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { generateCurrentChapter } from '../../services/insightService';
import type { WeeklyRecapData } from '../../types/ayaTypes';

interface WeeklyRecapCardProps {
    recap?: WeeklyRecapData;
    onDismiss?: () => void;
    onPlayNext?: (storyId: string) => void;
}

export const WeeklyRecapCard: React.FC<WeeklyRecapCardProps> = ({ recap, onDismiss, onPlayNext }) => {
    const profile = useUserStore(state => state.profile);
    const userTraits = profile?.traits || {
        risk: 50, creativity: 50, vision: 50, empathy: 50, leadership: 50, discipline: 50, resilience: 50
    };

    const chapter = generateCurrentChapter(userTraits);
    const storiesPlayed = recap?.stories_played ?? (profile?.stories_completed || 0);
    const streak = profile?.current_streak || 1;

    return (
        <div className="w-full max-w-xl mx-auto my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 backdrop-blur-xl shadow-2xl text-white relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">
                            AYA Weekly Recap
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white">
                            Your 7-Day Growth Snapshot
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 border border-purple-500/30 text-purple-200 text-xs font-bold">
                    <Trophy size={14} className="text-amber-400" />
                    <span>{streak} Day Streak</span>
                </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Stories Completed</span>
                    <span className="text-2xl font-black text-cyan-300 mt-1">{storiesPlayed}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Scenarios explored</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Chapter</span>
                    <span className="text-2xl font-black text-purple-300 mt-1">{chapter.label}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Active behavioral mode</span>
                </div>
            </div>

            {/* Emerging pattern insight */}
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 mb-6">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase mb-1">
                    <Sparkles size={14} />
                    <span>Emerging Pattern</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {chapter.description}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        Dismiss
                    </button>
                )}
                {recap?.next_recommendation_id && onPlayNext && (
                    <button
                        onClick={() => onPlayNext(recap.next_recommendation_id!)}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 font-bold text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <span>Explore Next Recommendation</span>
                        <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};
