import React from 'react';
import { HeartHandshake, ExternalLink, ShieldAlert } from 'lucide-react';
import { CRISIS_RESOURCES } from '../../config/recommendationConfig';
import type { CrisisRiskLevel } from '../../types/ayaTypes';

interface SafetyCardProps {
    riskLevel: CrisisRiskLevel;
    onDismiss?: () => void;
}

export const SafetyCard: React.FC<SafetyCardProps> = ({ riskLevel, onDismiss }) => {
    return (
        <div className="w-full max-w-xl mx-auto my-4 p-6 rounded-3xl bg-slate-900/90 border border-rose-500/30 backdrop-blur-xl shadow-2xl text-white relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <HeartHandshake size={28} />
                </div>
                <div>
                    <h3 className="text-xl font-bold tracking-wide">We're Here With You</h3>
                    <p className="text-xs text-rose-300/80 uppercase font-semibold tracking-wider">
                        Support & Guidance Pathway
                    </p>
                </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-5">
                It sounds like things might feel really heavy right now. AYA is a tool for self-discovery and storytelling, but when challenges get intense, talking to a human professional or supportive voice can make a world of difference.
            </p>

            <div className="space-y-3 mb-6">
                <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400">
                    Verified Free Support Lines
                </h4>
                {CRISIS_RESOURCES.map((resource, idx) => (
                    <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between hover:border-rose-500/40 transition-colors"
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{resource.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                                    {resource.phone}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{resource.description}</p>
                        </div>
                        <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-700/60 hover:bg-rose-600 text-slate-200 hover:text-white transition-colors"
                            title="Visit website"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>
                ))}
            </div>

            {riskLevel === 'medium' && onDismiss && (
                <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                        onClick={onDismiss}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                        I'm okay, continue to app
                    </button>
                </div>
            )}

            <div className="mt-4 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                <ShieldAlert size={12} />
                <span>AYA provides historical role-model insights and is not a substitute for therapy or medical advice.</span>
            </div>
        </div>
    );
};
