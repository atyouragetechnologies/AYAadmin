import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star, TrendingUp, Check, Loader2 } from 'lucide-react';
import { addToWishlist, logUnmatchedSearch, getTopRequestedPersonalities } from '../../utils/feedbackUtils';
import { audioManager as audioSynth } from '../../utils/audioManager';
import { supabase } from '../../utils/supabase';
import { safeStorage } from '../../utils/storage';
import clsx from 'clsx';

interface WishlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
    isCandyMode?: boolean;
}

const SUGGESTED_ICONS = [
    'Kalpana Chawla',
    'Nikola Tesla',
    'Aryabhata',
    'Marie Curie',
    'Steve Wozniak',
    'Alan Turing',
    'Chhatrapati Shivaji Maharaj'
];

const VOTED_STORAGE_KEY = 'aya_wishlist_voted_names';

export function WishlistModal({ isOpen, onClose, userId = '', isCandyMode = false }: WishlistModalProps) {
    const [wishInput, setWishInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedName, setSubmittedName] = useState<string | null>(null);
    const [topWishes, setTopWishes] = useState<Array<{ personality_name: string; vote_count: number }>>([]);
    const [isLoadingTop, setIsLoadingTop] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Track voted items in safeStorage so state persists across sessions
    const [votedNames, setVotedNames] = useState<Set<string>>(() => {
        try {
            const raw = safeStorage.get(VOTED_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return new Set((Array.isArray(parsed) ? parsed : []).map((s: string) => String(s).toLowerCase().trim()));
        } catch {
            return new Set();
        }
    });

    const markAsVoted = (name: string) => {
        const clean = name.toLowerCase().trim();
        setVotedNames(prev => {
            const next = new Set(prev).add(clean);
            try {
                safeStorage.set(VOTED_STORAGE_KEY, JSON.stringify(Array.from(next)));
            } catch {}
            return next;
        });
    };

    // Auto-focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Live Real-Time Data Fetching & Subscriptions
    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        setIsLoadingTop(true);

        const fetchWishes = async () => {
            try {
                const res = await getTopRequestedPersonalities(15);
                if (isMounted && res) {
                    setTopWishes(res);
                }
            } catch (err) {
                console.warn('[Wishlist] Fetch error:', err);
            } finally {
                if (isMounted) setIsLoadingTop(false);
            }
        };

        // Initial fetch
        fetchWishes();

        // 1. Supabase Realtime channel for live updates when any user votes or submits
        const channel = supabase
            .channel('realtime_wishlist_' + Math.random().toString(36).slice(2, 9))
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'personality_wishlist' },
                () => {
                    fetchWishes();
                }
            )
            .subscribe();

        // 2. High-reliability polling fallback every 3.5 seconds while modal is open
        const pollInterval = setInterval(fetchWishes, 3500);

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
            try {
                supabase.removeChannel(channel);
            } catch {}
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleWishSubmit = async (e?: React.FormEvent, customName?: string) => {
        if (e) e.preventDefault();
        const targetName = (customName || wishInput).trim();
        if (!targetName || isSubmitting) return;

        setIsSubmitting(true);
        try { audioSynth.playClick(); } catch {}
        try { audioSynth.playSparkle?.(); } catch {}

        setSubmittedName(targetName);
        setWishInput('');
        markAsVoted(targetName);

        // Optimistic UI update: instantly update list and rank
        setTopWishes(prev => {
            const existingIndex = prev.findIndex(
                item => item.personality_name.toLowerCase() === targetName.toLowerCase()
            );
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    vote_count: (updated[existingIndex].vote_count || 1) + 1
                };
                return updated.sort((a, b) => b.vote_count - a.vote_count);
            } else {
                const updated = [{ personality_name: targetName, vote_count: 1 }, ...prev];
                return updated.sort((a, b) => b.vote_count - a.vote_count);
            }
        });

        try {
            logUnmatchedSearch(userId, targetName).catch(() => {});
            const res = await addToWishlist(userId, targetName);
            if (res.success) {
                const fresh = await getTopRequestedPersonalities(15);
                if (fresh) setTopWishes(fresh);
            }
        } catch (err) {
            console.error('Wishlist error:', err);
        } finally {
            setIsSubmitting(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    const handleVoteOnExisting = async (name: string) => {
        if (votedNames.has(name.toLowerCase().trim())) return;
        try { audioSynth.playClick(); } catch {}
        try { audioSynth.playSparkle?.(); } catch {}
        markAsVoted(name);

        // Optimistic live update & re-sorting
        setTopWishes(prev => {
            const updated = prev.map(item =>
                item.personality_name.toLowerCase() === name.toLowerCase()
                    ? { ...item, vote_count: (item.vote_count || 1) + 1 }
                    : item
            );
            return updated.sort((a, b) => b.vote_count - a.vote_count);
        });

        try {
            await addToWishlist(userId, name);
            const fresh = await getTopRequestedPersonalities(15);
            if (fresh) setTopWishes(fresh);
        } catch (err) {
            console.error('Vote error:', err);
        }
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[999999] flex items-center justify-center p-4 overflow-y-auto select-auto pointer-events-auto"
                    data-wishlist-modal="true"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className={clsx(
                            "relative w-full max-w-lg my-auto rounded-3xl p-6 sm:p-8 border shadow-2xl overflow-hidden z-10 select-auto pointer-events-auto",
                            isCandyMode
                                ? "bg-white/95 border-pink-200 text-slate-800 shadow-pink-500/20"
                                : "bg-slate-950/95 border-amber-500/30 text-white shadow-[0_0_60px_rgba(245,158,11,0.2)]"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Ambient Cosmic Radial Flares */}
                        <div className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl" />

                        {/* Close Button */}
                        <button
                            onClick={() => {
                                try { audioSynth.playClick(); } catch {}
                                onClose();
                            }}
                            className={clsx(
                                "absolute top-5 right-5 p-2 rounded-full transition-all active:scale-90 cursor-pointer",
                                isCandyMode
                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                    : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
                            )}
                            aria-label="Close Wishlist"
                        >
                            <X size={18} />
                        </button>

                        {/* Header */}
                        <div className="flex items-start gap-4 mb-6 select-none">
                            <div className="relative shrink-0 mt-1">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-400 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                                    <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                                    </div>
                                </div>
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                            </div>

                            <div className="pr-6">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
                                        Cosmic Wishlist
                                    </h2>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Community
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    Next kiski kahani dekhna chahte ho? Wish upon a star for the figures, rebels, or innovators you want to live as in the AYA simulation.
                                </p>
                            </div>
                        </div>

                        {/* Success Message Banner */}
                        <AnimatePresence>
                            {submittedName && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-5 overflow-hidden"
                                >
                                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border border-amber-500/40 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                                <Check size={16} strokeWidth={3} />
                                            </div>
                                            <span className="text-xs font-semibold text-emerald-200">
                                                Wish beamed into the galaxy for <strong className="text-white">"{submittedName}"</strong>!
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSubmittedName(null);
                                                inputRef.current?.focus();
                                            }}
                                            className="text-[11px] font-bold text-amber-300 hover:text-white underline shrink-0 cursor-pointer"
                                        >
                                            Wish again
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Form with guaranteed text selection and click-to-focus */}
                        <form onSubmit={handleWishSubmit} className="space-y-3 mb-6 select-auto">
                            <div
                                onClick={() => inputRef.current?.focus()}
                                className={clsx(
                                    "flex items-center gap-2 p-1.5 pl-4 rounded-2xl border transition-all cursor-text select-text pointer-events-auto focus-within:ring-2",
                                    isCandyMode
                                        ? "bg-slate-50 border-slate-300 focus-within:border-amber-400 focus-within:ring-amber-400/20"
                                        : "bg-slate-900/90 border-slate-700/80 focus-within:border-amber-400 focus-within:ring-amber-400/20 shadow-inner"
                                )}
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Next kiski kahani dekhna chahte ho? (e.g. Leonardo da Vinci)..."
                                    value={wishInput}
                                    onChange={(e) => setWishInput(e.target.value)}
                                    disabled={isSubmitting}
                                    autoComplete="off"
                                    spellCheck={false}
                                    className={clsx(
                                        "flex-1 min-w-0 bg-transparent py-2.5 text-sm border-none outline-none focus:ring-0 select-text cursor-text",
                                        isCandyMode
                                            ? "text-slate-800 placeholder-slate-400"
                                            : "text-white placeholder-slate-500"
                                    )}
                                />
                                <button
                                    type="submit"
                                    disabled={!wishInput.trim() || isSubmitting}
                                    className={clsx(
                                        "!w-auto !min-h-0 shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
                                        isCandyMode
                                            ? "bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 hover:brightness-105"
                                            : "bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 text-slate-950 font-black hover:brightness-110 shadow-amber-500/25"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles size={13} />
                                            <span>Wish</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Quick Suggestion Chips */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 select-none">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
                                    <Star size={11} className="text-amber-400/70" />
                                    Suggestions:
                                </span>
                                {SUGGESTED_ICONS.map((name) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => {
                                            setWishInput(name);
                                            inputRef.current?.focus();
                                            try { audioSynth.playClick(); } catch {}
                                        }}
                                        className={clsx(
                                            "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all hover:scale-105 active:scale-95 border cursor-pointer",
                                            isCandyMode
                                                ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-amber-100 hover:border-amber-300"
                                                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/10"
                                        )}
                                    >
                                        + {name}
                                    </button>
                                ))}
                            </div>
                        </form>

                        {/* Trending Wishes from Constellation (Live-Updating) */}
                        <div className="border-t border-slate-800/80 pt-5">
                            <div className="flex items-center justify-between mb-1.5 select-none">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={14} className="text-amber-400" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                        Trending In Constellation
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live Synced" />
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium">
                                    Top voted by travelers
                                </span>
                            </div>
                            <p className="text-[11px] text-amber-300/80 mb-3 font-medium flex items-center gap-1.5 select-none">
                                <Sparkles size={12} className="text-amber-400 shrink-0" />
                                <span>Next kiski kahani dekhna chahte ho? Vote for your favorites below:</span>
                            </p>

                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {isLoadingTop && topWishes.length === 0 ? (
                                    <div className="flex items-center justify-center py-6 text-slate-500 text-xs gap-2">
                                        <Loader2 size={14} className="animate-spin text-amber-400" />
                                        <span>Reading the stars...</span>
                                    </div>
                                ) : topWishes.length > 0 ? (
                                    topWishes.map((item, idx) => {
                                        const cleanKey = item.personality_name.toLowerCase().trim();
                                        const hasVoted = votedNames.has(cleanKey);
                                        return (
                                            <div
                                                key={cleanKey + idx}
                                                className={clsx(
                                                    "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                                                    isCandyMode
                                                        ? "bg-slate-50 border-slate-200"
                                                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                                                )}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="w-5 text-center text-xs font-black text-amber-400/80">
                                                        #{idx + 1}
                                                    </span>
                                                    <span className="text-xs font-bold truncate text-slate-200">
                                                        {item.personality_name}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    <div className="flex items-center gap-1 text-amber-400 text-xs font-extrabold">
                                                        <Star size={12} className="fill-amber-400 text-amber-400" />
                                                        <span>{item.vote_count}</span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleVoteOnExisting(item.personality_name)}
                                                        disabled={hasVoted}
                                                        className={clsx(
                                                            "px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1",
                                                            hasVoted
                                                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default"
                                                                : "bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 hover:text-white border border-amber-500/30 active:scale-95 cursor-pointer"
                                                        )}
                                                    >
                                                        {hasVoted ? (
                                                            <>
                                                                <Check size={11} strokeWidth={3} />
                                                                <span>Voted</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>+1 Vote</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-4 text-xs text-slate-500">
                                        No wishes yet. Be the first to wish upon a star!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Roadmap Note */}
                        <div className="mt-5 text-center select-none">
                            <p className="text-[10px] text-slate-500 font-medium">
                                ✨ Most requested figures are fast-tracked into the AYA simulation universe.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

export default WishlistModal;
