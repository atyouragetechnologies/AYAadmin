import React, { useState } from 'react';
import { Search, Compass, Sparkles, X, Lock } from 'lucide-react';
import { audioManager } from '../../utils/audioManager';
import { useUserStore } from '../../store/userStore';
import { isAyaPlusUser } from '../../services/accessControl';

interface ProblemSearchBarProps {
    currentQuery?: string;
    onSearch: (query: string) => void;
    onOpenCheckIn: () => void;
    activeTheme?: string | null;
    onClearActiveTheme?: () => void;
}

export function ProblemSearchBar({
    currentQuery = '',
    onSearch,
    onOpenCheckIn,
    activeTheme,
    onClearActiveTheme,
}: ProblemSearchBarProps) {
    const [searchTerm, setSearchTerm] = useState(currentQuery);

    const profile = useUserStore(state => state.profile);
    const isPremium = isAyaPlusUser(profile);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        audioManager.playClick();
        if (!isPremium) {
            useUserStore.getState().setShowSubscriptionModal(true);
            return;
        }
        onSearch(searchTerm);
    };

    const handleClear = () => {
        setSearchTerm('');
        onSearch('');
        if (onClearActiveTheme) onClearActiveTheme();
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-2">
            <div className="relative flex items-center gap-2">
                {/* Search input container */}
                <form
                    onSubmit={handleSubmit}
                    className="relative flex-1 flex items-center bg-slate-900/80 hover:bg-slate-900 border border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all group"
                >
                    {isPremium ? (
                        <Search className="w-4 h-4 text-cyan-400 shrink-0 mr-2.5 transition-transform group-focus-within:scale-110" />
                    ) : (
                        <Lock className="w-4 h-4 text-purple-400 shrink-0 mr-2.5" />
                    )}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            if (!isPremium) {
                                useUserStore.getState().setShowSubscriptionModal(true);
                                return;
                            }
                            setSearchTerm(e.target.value);
                            if (!e.target.value) onSearch('');
                        }}
                        placeholder={isPremium ? "What situation or dilemma are you dealing with right now?..." : "PRO: Type your specific situation for AI matches..."}
                        className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none font-medium cursor-text"
                        onClick={() => {
                            if (!isPremium) {
                                audioManager.playClick();
                                useUserStore.getState().setShowSubscriptionModal(true);
                            }
                        }}
                        readOnly={!isPremium}
                    />

                    {/* Clear Button */}
                    {(searchTerm || activeTheme) && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 mr-1"
                        >
                            <X size={14} />
                        </button>
                    )}
                </form>

                {/* Direct Check-In Launcher Button */}
                <button
                    onClick={() => {
                        audioManager.playClick();
                        onOpenCheckIn();
                    }}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 hover:text-white text-xs font-black tracking-wider uppercase shadow-[0_0_15px_rgba(0,242,255,0.2)] transition-all active:scale-95"
                >
                    <Compass size={15} className="text-cyan-400 animate-spin-slow" />
                    <span className="hidden sm:inline">Check In</span>
                </button>
            </div>

            {/* Active Theme Filter Tag */}
            {activeTheme && (
                <div className="flex items-center gap-2 mt-2 px-1">
                    <span className="text-[11px] text-slate-400 font-medium">Active filter:</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-bold text-cyan-300">
                        <Sparkles size={11} className="text-cyan-400" />
                        {activeTheme.replace(/_/g, ' ')}
                        <button onClick={onClearActiveTheme} className="hover:text-white ml-0.5">
                            <X size={11} />
                        </button>
                    </span>
                </div>
            )}
        </div>
    );
}
