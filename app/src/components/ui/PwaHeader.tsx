import { type FC, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { useSubscription } from '../../hooks/useSubscription';
import { audioManager as audioSynth } from '../../utils/audioManager';
import { isPwaInstalled, canPromptNativeInstall, triggerNativeInstall } from '../../utils/pwaInstall';
import { isNativeApp } from '../../hooks/useNativeFeatures';
import { Sparkles, Crown, Download } from 'lucide-react';
import clsx from 'clsx';
import './PwaHeader.css';

export const PwaHeader: FC = () => {
    const profile = useUserStore((state) => state.profile);
    const isCandyMode = useUserStore((state) => state.isCandyMode);
    const setShowSubscriptionModal = useUserStore((state) => state.setShowSubscriptionModal);
    const { isPaid, isTrialActive, hasTrialAvailable, trialUsed, daysRemaining } = useSubscription();
    const [isInstalled, setIsInstalled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setIsInstalled(isPwaInstalled());

        const handleInstallAvailable = () => setIsInstalled(false);
        const handleAppInstalled = () => setIsInstalled(true);

        window.addEventListener('aya-install-available', handleInstallAvailable);
        window.addEventListener('aya-app-installed', handleAppInstalled);

        return () => {
            window.removeEventListener('aya-install-available', handleInstallAvailable);
            window.removeEventListener('aya-app-installed', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        try {
            audioSynth.playClick();
        } catch {}

        if (canPromptNativeInstall()) {
            const outcome = await triggerNativeInstall();
            if (outcome === 'accepted') {
                setIsInstalled(true);
            }
        } else {
            alert('To download / install AYA on Desktop:\n1. Look at the right side of your browser search / address bar for the (⬇️) Install icon.\n2. Or click the Chrome / Edge menu (⋮) -> "Install At Your Age".');
        }
    };

    if (!profile) return null;

    const handleScrollToTop = () => {
        try {
            audioSynth.playClick();
        } catch {
            // Audio ignore if unavailable
        }

        // If not already on /game, navigate to /game
        if (location.pathname !== '/game') {
            navigate('/game');
        }

        // 1. Dispatch custom event for LevelMap or other scrollable game components
        window.dispatchEvent(new CustomEvent('aya-scroll-to-top'));

        // 2. Direct scroll target for the LevelMap scroll container
        const mapContainer = document.getElementById('level-map-scroll-container') ||
                             document.querySelector('[data-scroll-container="level-map"]');
        if (mapContainer) {
            mapContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            setTimeout(() => {
                mapContainer.dispatchEvent(new Event('scroll'));
            }, 300);
        }

        // 3. Fallback window / document scroll
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <header className={clsx(
            "w-full shrink-0 sticky top-0 z-[110] flex flex-col justify-end transition-all duration-300",
            "bg-[#05070D] border-b border-[#111827] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.8)]"
        )}
        style={{
            // Dynamic height: 64px content area + status bar height on Android (edge-to-edge)
            paddingTop: 'env(safe-area-inset-top)',
            minHeight: 'calc(64px + env(safe-area-inset-top, 0px))'
        }}>
            <div className="flex items-center justify-between px-2.5 sm:px-6 md:px-8 gap-1 sm:gap-4 h-[64px]">
            {/* Logo & Search Section */}
            <div className="flex items-center flex-1 min-w-0 mr-1 sm:mr-2">
                <button
                    onClick={handleScrollToTop}
                    type="button"
                    title="Back to top"
                    className={clsx(
                        "font-bold tracking-tight whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 text-left cursor-pointer",
                        "text-[#F5F7FA] hover:text-[#00f2ff] active:scale-95 transition-all duration-200 outline-none group select-none"
                    )}
                >
                    <span className="hidden sm:inline text-xl tracking-tight group-hover:drop-shadow-[0_0_12px_rgba(0,242,255,0.7)] transition-all">
                        At Your Age
                    </span>
                    <span className="sm:hidden text-lg font-extrabold group-hover:drop-shadow-[0_0_12px_rgba(0,242,255,0.7)] transition-all">
                        AYA
                    </span>
                </button>
                {/* SearchBar Portal Target */}
                <div 
                    id="header-search-portal" 
                    className="ml-1.5 sm:ml-4 min-w-0 flex-1 max-w-[125px] xs:max-w-[160px] sm:max-w-[200px] md:max-w-[240px] flex items-center"
                />

                {/* Download App CTA — hidden on Android (user is already in the app!) */}
                {!isInstalled && !isNativeApp && (
                    <button
                        onClick={handleInstallClick}
                        type="button"
                        title="Download / Install AYA Desktop App"
                        className={clsx(
                            "hidden md:flex items-center gap-1.5 px-3 py-1.5 ml-2.5 rounded-full border cursor-pointer select-none transition-all hover:scale-105 active:scale-95 shrink-0 outline-none",
                            isCandyMode
                                ? "bg-pink-50 border-pink-300 text-pink-700 hover:bg-pink-100 shadow-sm"
                                : "bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-500/40 hover:border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,242,255,0.15)]"
                        )}
                    >
                        <Download size={13} className="text-cyan-400 shrink-0" />
                        <span className="text-[11px] font-bold tracking-wide">Download App</span>
                    </button>
                )}
            </div>


            {/* Profile, Plan Status & XP Section */}
            <div data-tutorial="header-profile" className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0">
                {/* Subscription / Plan Status Badge */}
                {isPaid ? (
                    <button
                        onClick={() => {
                            audioSynth.playClick();
                            setShowSubscriptionModal(true);
                        }}
                        type="button"
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 select-none outline-none bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-cyan-500/20 border-purple-500/40 hover:border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                        title="AYA PRO Member • Tap to view plan"
                    >
                        <Crown size={11} className="text-amber-400 shrink-0" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-purple-200">PRO Plan</span>
                    </button>
                ) : isTrialActive ? (
                    <button
                        onClick={() => {
                            audioSynth.playClick();
                            setShowSubscriptionModal(true);
                        }}
                        type="button"
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 select-none outline-none bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/25 border-emerald-500/40 hover:border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                        title={`Trial Plan Active (${daysRemaining} days left) • Tap to view details`}
                    >
                        <Sparkles size={11} className="text-emerald-400 shrink-0 animate-pulse" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-300">
                            <span className="hidden sm:inline">Trial Plan</span>
                            <span className="sm:hidden">Trial</span>
                        </span>
                        {daysRemaining > 0 && (
                            <span className="text-[9px] sm:text-[10px] text-emerald-400/80 font-mono font-bold">({daysRemaining}d)</span>
                        )}
                    </button>
                ) : hasTrialAvailable ? (
                    <button
                        onClick={() => {
                            audioSynth.playClick();
                            setShowSubscriptionModal(true);
                        }}
                        type="button"
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 select-none outline-none bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border-cyan-400/40 hover:border-cyan-300 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] animate-pulse"
                        title="Start 7-Day Free Trial"
                    >
                        <Sparkles size={11} className="text-cyan-400 shrink-0" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-200">
                            <span className="hidden sm:inline">Start </span>Trial
                        </span>
                    </button>
                ) : trialUsed ? (
                    <button
                        onClick={() => {
                            audioSynth.playClick();
                            setShowSubscriptionModal(true);
                        }}
                        type="button"
                        className="hidden sm:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 select-none outline-none bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:border-purple-400 text-slate-300"
                        title="Free Trial Concluded • Upgrade to PRO"
                    >
                        <Crown size={11} className="text-amber-400 shrink-0" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-300">Get PRO</span>
                    </button>
                ) : null}

                {/* Profile Name (Clickable) */}
                <button
                    onClick={() => {
                        audioSynth.playClick();
                        navigate('/game/profile');
                    }}
                    type="button"
                    title="View Profile"
                    className="flex items-center gap-1 text-left group truncate cursor-pointer select-none outline-none max-w-[50px] xs:max-w-[70px] sm:max-w-[130px]"
                >
                    <span className="font-semibold tracking-wide text-[11px] sm:text-[13px] truncate text-[#F5F7FA] group-hover:text-[#00f2ff] transition-colors">
                        {profile?.name || profile?.username || "GUEST"}
                    </span>
                </button>
                
                <div className="h-3.5 w-[1px] bg-slate-800 shrink-0" />

                {/* XP Pill Counter */}
                <button 
                    onClick={() => {
                        audioSynth.playClick();
                        navigate('/game/profile');
                    }}
                    type="button"
                    className={clsx(
                        "flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full border cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 select-none outline-none",
                        isCandyMode
                            ? "bg-amber-100 border-amber-300 text-amber-900 shadow-sm"
                            : "bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/20 border-amber-500/35 hover:border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    )}
                    title="Total Experience Points (XP) • Click to open Profile"
                >
                    <Sparkles size={11} className="text-amber-400 shrink-0 animate-pulse" />
                    <span className="text-[9px] font-black tracking-wider text-amber-400/80">XP</span>
                    <span className="text-[10px] sm:text-xs font-black text-amber-200">{profile?.total_xp || 0}</span>
                </button>
                
            </div>
            </div>
        </header>
    );
};

