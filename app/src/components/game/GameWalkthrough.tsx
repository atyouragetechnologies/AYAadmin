import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../utils/supabase';
import { audioManager as audioSynth } from '../../utils/audioManager';

interface Step {
    id: string;
    target: string | null;
    title: string;
    desc: string;
    onEnter?: () => void;
}

const STEPS: Step[] = [
    {
        id: 'welcome',
        target: null, // Centered
        title: 'Welcome to At Your Age!',
        desc: 'Explore real-life historical turning points, step into pivotal dilemmas, and discover how your choices shape your future.',
        onEnter: () => window.dispatchEvent(new CustomEvent('tutorial-menu-toggle', { detail: { open: false } }))
    },
    {
        id: 'header',
        target: '[data-tutorial="header-profile"]',
        title: 'Your Progress & DNA',
        desc: 'Keep track of your current level, experience points, streak, and profile status here at a glance.',
        onEnter: () => window.dispatchEvent(new CustomEvent('tutorial-menu-toggle', { detail: { open: false } }))
    },
    {
        id: 'menu',
        target: '[data-tutorial="menu-toggle"]',
        title: 'Command Center',
        desc: 'Open the menu anytime to access your Journal, behavioral DNA telemetry, audio settings, and theme styles.',
        onEnter: () => window.dispatchEvent(new CustomEvent('tutorial-menu-toggle', { detail: { open: false } }))
    },
    {
        id: 'journal',
        target: '[data-tutorial="journal"]',
        title: 'Your Life Journal',
        desc: 'Your personal chronicle — revisit completed stories, reflections, and key choices made along your path.',
        onEnter: () => window.dispatchEvent(new CustomEvent('tutorial-menu-toggle', { detail: { open: true } }))
    },
    {
        id: 'dna',
        target: '[data-tutorial="dna"]',
        title: 'Behavioral DNA Telemetry',
        desc: 'Calibrates your core traits (Courage, Vision, Originality, Analytical Grit) based on decisions in each simulation.',
        onEnter: () => window.dispatchEvent(new CustomEvent('tutorial-menu-toggle', { detail: { open: true } }))
    },
    {
        id: 'wishlist',
        target: '[data-tutorial="wishlist"]',
        title: 'Wish upon a Star',
        desc: 'Tap this sparkling star anytime to wishlist icons and legends you want added next to the AYA universe!',
        onEnter: () => window.dispatchEvent(new CustomEvent('tutorial-menu-toggle', { detail: { open: false } }))
    },
    {
        id: 'checkin',
        target: '[data-tutorial="checkin"]',
        title: 'Situation Check-in',
        desc: 'Facing a real-world dilemma right now? Tap here to get stories tailored directly to what you are dealing with.',
        onEnter: () => window.dispatchEvent(new CustomEvent('tutorial-menu-toggle', { detail: { open: false } }))
    }
];

export function GameWalkthrough() {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const startTutorialDirectly = useCallback(() => {
        window.dispatchEvent(new CustomEvent('tutorial-menu-toggle', { detail: { open: false } }));
        useUserStore.getState().setShowSubscriptionModal(false);
        setCurrentStep(0);
        setIsActive(true);
    }, []);

    // Check if tutorial replay was requested via session or url param
    useEffect(() => {
        const checkSessionRequest = () => {
            if (sessionStorage.getItem('aya_start_tutorial_requested') === 'true' || window.location.search.includes('tutorial=true')) {
                sessionStorage.removeItem('aya_start_tutorial_requested');
                startTutorialDirectly();
                return true;
            }
            return false;
        };

        if (checkSessionRequest()) return;
        const t1 = setTimeout(checkSessionRequest, 250);
        const t2 = setTimeout(checkSessionRequest, 700);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [startTutorialDirectly]);

    // Initialization check (auto-show for new users if not completed)
    useEffect(() => {
        let interval: any;
        const checkTutorialState = () => {
            const profile = useUserStore.getState().profile;
            const hasSeen = localStorage.getItem('aya_game_tutorial_done') === 'true' || profile?.tutorial_completed === true;
            if (hasSeen) return;

            // Wait until no blocking modal overlays are present
            interval = setInterval(() => {
                const state = useUserStore.getState();
                const isSubscriptionOpen = state.showSubscriptionModal;
                const hasAyaModal = Boolean(document.querySelector('[data-aya-modal], [role="dialog"]'));

                if (!isSubscriptionOpen && !hasAyaModal) {
                    clearInterval(interval);
                    setTimeout(() => startTutorialDirectly(), 1000);
                }
            }, 600);
        };

        checkTutorialState();

        const handleStart = () => {
            if (interval) clearInterval(interval);
            startTutorialDirectly();
        };

        window.addEventListener('tutorial-start', handleStart);
        return () => {
            if (interval) clearInterval(interval);
            window.removeEventListener('tutorial-start', handleStart);
        };
    }, [startTutorialDirectly]);

    // Function to calculate target coordinates
    const updateTargetRect = useCallback(() => {
        const step = STEPS[currentStep];
        if (!step || !step.target) {
            setTargetRect(null);
            return;
        }

        const el = document.querySelector(step.target);
        if (el) {
            const rect = el.getBoundingClientRect();
            // Verify element has visible dimensions
            if (rect.width > 0 && rect.height > 0) {
                setTargetRect(rect);
                return;
            }
        }
        setTargetRect(null);
    }, [currentStep]);

    // Handle step enter and dynamic target calculation
    useEffect(() => {
        if (!isActive) return;

        const step = STEPS[currentStep];
        if (!step) return;

        if (step.onEnter) {
            step.onEnter();
        }

        // Immediate check in case target is already rendered
        updateTargetRect();
        const timer0 = setTimeout(updateTargetRect, 100);

        // Give any drawer/menu slide animations time to finish (320ms)
        const timer1 = setTimeout(() => {
            if (step.target) {
                const el = document.querySelector(step.target);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
            updateTargetRect();
        }, 320);

        // Fallback retry in case DOM was still painting
        const timer2 = setTimeout(updateTargetRect, 600);

        const handleUpdate = () => {
            requestAnimationFrame(updateTargetRect);
        };

        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate, true);

        return () => {
            clearTimeout(timer0);
            clearTimeout(timer1);
            clearTimeout(timer2);
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate, true);
        };
    }, [isActive, currentStep, updateTargetRect]);

    const handleNext = () => {
        try { audioSynth.playClick?.(); } catch {}
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        try { audioSynth.playClick?.(); } catch {}
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleFinish = () => {
        try { audioSynth.playSparkle?.(); } catch {}
        localStorage.setItem('aya_game_tutorial_done', 'true');
        const userProfile = useUserStore.getState().profile;
        if (userProfile?.id && !userProfile.id.startsWith('offline-')) {
            useUserStore.getState().setProfile({ ...userProfile, tutorial_completed: true });
            supabase.from('users').update({ tutorial_completed: true }).eq('id', userProfile.id).then(() => {}).catch(() => {});
        }
        setIsActive(false);
        window.dispatchEvent(new CustomEvent('tutorial-menu-toggle', { detail: { open: false } }));
    };

    if (!isActive) return null;

    const step = STEPS[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === STEPS.length - 1;

    // Mobile vs Desktop responsive layout logic
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isMobile = windowWidth < 768;    let spotlightStyle: any = null;
    let tooltipStyle: any = {};

    if (targetRect) {
        const PADDING = isMobile ? 6 : 10;
        spotlightStyle = {
            top: targetRect.top - PADDING,
            left: targetRect.left - PADDING,
            width: targetRect.width + PADDING * 2,
            height: targetRect.height + PADDING * 2,
            borderRadius: '16px',
        };

        if (isMobile) {
            // Mobile: Position card safely away from spotlight target without transforms
            const isTargetInUpperHalf = targetRect.top < windowHeight * 0.48;

            if (isTargetInUpperHalf) {
                // Target is in upper screen -> dock card near bottom
                tooltipStyle = {
                    bottom: '24px',
                    left: '16px',
                    right: '16px',
                    margin: '0 auto',
                    maxWidth: '380px',
                };
            } else {
                // Target is in lower screen -> dock card near top
                tooltipStyle = {
                    top: '80px',
                    left: '16px',
                    right: '16px',
                    margin: '0 auto',
                    maxWidth: '380px',
                };
            }
        } else {
            // Desktop: Adaptive side / below placement with safe viewport clamping
            const spaceBelow = windowHeight - targetRect.bottom;
            const spaceAbove = targetRect.top;
            const spaceLeft = targetRect.left;
            const CARD_WIDTH = 340;
            const ESTIMATED_CARD_HEIGHT = 240;

            if (targetRect.top < 120 && spaceBelow > ESTIMATED_CARD_HEIGHT + 20) {
                // Target is near top edge (e.g. Header, Menu toggle) -> place below
                tooltipStyle = {
                    top: targetRect.bottom + PADDING + 12,
                    left: Math.max(16, Math.min(targetRect.left + (targetRect.width / 2) - (CARD_WIDTH / 2), windowWidth - CARD_WIDTH - 20)),
                    width: `${CARD_WIDTH}px`,
                };
            } else if (spaceLeft > CARD_WIDTH + 20) {
                // Sufficient space to the left of the target (e.g. SideMenu items, FAB CheckIn, Wishlist)
                tooltipStyle = {
                    left: Math.max(16, targetRect.left - PADDING - CARD_WIDTH - 12),
                    width: `${CARD_WIDTH}px`,
                };

                // Smart vertical alignment: if target is near bottom of screen, clamp to bottom margin
                if (targetRect.bottom > windowHeight - 160) {
                    tooltipStyle.bottom = '24px';
                } else if (targetRect.top < 120) {
                    tooltipStyle.top = '24px';
                } else {
                    const idealTop = targetRect.top + (targetRect.height / 2) - (ESTIMATED_CARD_HEIGHT / 2);
                    tooltipStyle.top = Math.max(20, Math.min(idealTop, windowHeight - ESTIMATED_CARD_HEIGHT - 30));
                }
            } else if (spaceBelow > ESTIMATED_CARD_HEIGHT + 20) {
                // Place below target
                tooltipStyle = {
                    top: targetRect.bottom + PADDING + 12,
                    left: Math.max(16, Math.min(targetRect.left + (targetRect.width / 2) - (CARD_WIDTH / 2), windowWidth - CARD_WIDTH - 20)),
                    width: `${CARD_WIDTH}px`,
                };
            } else if (spaceAbove > ESTIMATED_CARD_HEIGHT + 20) {
                // Place above target
                tooltipStyle = {
                    bottom: Math.max(20, windowHeight - targetRect.top + PADDING + 12),
                    left: Math.max(16, Math.min(targetRect.left + (targetRect.width / 2) - (CARD_WIDTH / 2), windowWidth - CARD_WIDTH - 20)),
                    width: `${CARD_WIDTH}px`,
                };
            } else {
                // Safe fallback centered
                tooltipStyle = {
                    bottom: '24px',
                    left: Math.max(16, (windowWidth - CARD_WIDTH) / 2),
                    width: `${CARD_WIDTH}px`,
                };
            }
        }
    }

    const renderCardContent = () => (
        <>
            {/* Header: Step Dots and Close button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    {STEPS.map((_, idx) => (
                        <span
                            key={idx}
                            className={clsx(
                                "h-1.5 rounded-full transition-all duration-300",
                                idx === currentStep
                                    ? "w-5 bg-cyan-400 shadow-[0_0_8px_rgba(0,242,255,0.8)]"
                                    : idx < currentStep
                                    ? "w-2 bg-cyan-700/60"
                                    : "w-2 bg-slate-700/50"
                            )}
                        />
                    ))}
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 ml-1.5">
                        {currentStep + 1}/{STEPS.length}
                    </span>
                </div>

                <button
                    onClick={handleFinish}
                    className="p-1.5 -mr-1.5 -mt-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                    aria-label="Skip Tutorial"
                    title="Skip Tutorial"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Step Title & Icon */}
            <div className="flex items-center gap-2">
                {currentStep === 0 && (
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                )}
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug">
                    {step.title}
                </h3>
            </div>

            {/* Step Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {step.desc}
            </p>

            {/* Action Navigation Buttons */}
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-800/80 shrink-0">
                <button
                    onClick={handlePrev}
                    disabled={isFirst}
                    className={clsx(
                        "flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl transition-all",
                        isFirst
                            ? "opacity-30 cursor-not-allowed text-slate-600"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60 active:scale-95"
                    )}
                >
                    <ChevronLeft size={16} />
                    <span>Back</span>
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleFinish}
                        className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 px-2 py-1 transition-colors"
                    >
                        Skip
                    </button>

                    <button
                        onClick={handleNext}
                        className={clsx(
                            "flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 min-h-[40px]",
                            isLast
                                ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 shadow-cyan-500/30 hover:brightness-110"
                                : "bg-white text-slate-950 hover:bg-slate-100 shadow-white/10"
                        )}
                    >
                        {isLast ? (
                            <>
                                <span>Start Journey</span>
                                <Check size={15} strokeWidth={3} />
                            </>
                        ) : (
                            <>
                                <span>Next</span>
                                <ChevronRight size={15} strokeWidth={2.5} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div data-tutorial-root="true" className="fixed inset-0 z-[99999] pointer-events-auto select-none overflow-hidden">
            {/* Darkened Cosmic Backdrop (only for Step 0 when no spotlight target exists) */}
            {!targetRect && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"
                    onClick={handleFinish}
                />
            )}

            {/* Glowing Spotlight Hole */}
            {targetRect && spotlightStyle && (
                <motion.div
                    initial={false}
                    animate={spotlightStyle}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute border-2 border-cyan-400 pointer-events-none"
                    style={{
                        boxShadow: "0 0 0 9999px rgba(3, 7, 18, 0.82), 0 0 25px rgba(0, 242, 255, 0.45) inset, 0 0 25px rgba(0, 242, 255, 0.45)",
                        borderRadius: spotlightStyle.borderRadius,
                    }}
                >
                    <div className="absolute inset-0 bg-cyan-400/10 animate-pulse rounded-[inherit]" />
                </motion.div>
            )}

            {/* Step 0: Welcome Card (Dead Centered on Mobile & Desktop) */}
            {!targetRect ? (
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, scale: 0.92, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -15 }}
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                            className={clsx(
                                "w-full max-w-sm sm:max-w-md rounded-3xl p-6 sm:p-7 flex flex-col gap-4 shadow-2xl border pointer-events-auto",
                                "bg-[#080d1a]/95 border-cyan-500/40 text-white shadow-[0_0_60px_rgba(0,242,255,0.25)] backdrop-blur-2xl"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {renderCardContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            ) : (
                /* Steps 1-6: Targeted Spotlight Tooltip */
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        className={clsx(
                            "absolute rounded-2xl p-5 sm:p-6 flex flex-col gap-3.5 z-10 shadow-2xl border pointer-events-auto",
                            "bg-[#080d1a]/95 border-cyan-500/35 text-white shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-xl",
                            "max-h-[calc(100vh-32px)] overflow-y-auto"
                        )}
                        style={tooltipStyle}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {renderCardContent()}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}

export default GameWalkthrough;
