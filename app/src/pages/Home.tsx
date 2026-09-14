import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NotificationPrompt } from '../components/ui/NotificationPrompt';
import { subscribeUserToPush } from '../utils/pushNotifications';
import { useUserStore } from '../store/userStore';
import { audioManager as audioSynth } from '../utils/audioManager';
import { shouldShowInstallPrompt, recordInstallPromptShown } from '../utils/pwaInstall';

export function HomePage() {
    const navigate = useNavigate();
    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
    const profile = useUserStore((state) => state.profile);

    useEffect(() => {
        if (!shouldShowInstallPrompt(profile)) return;
        if ((profile?.stories_completed || 0) <= 0) return;

        const timer = setTimeout(() => {
            recordInstallPromptShown();
            setShowNotificationPrompt(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, [profile?.stories_completed, profile]);

    const handleAccept = async () => {
        recordInstallPromptShown();
        setShowNotificationPrompt(false);
        await subscribeUserToPush(profile?.id);
    };

    const handleDecline = () => {
        recordInstallPromptShown();
        setShowNotificationPrompt(false);
    };

    const handleStartGame = () => {
        audioSynth.playClick();
        navigate('/game');
    };

    return (
        <>
            <div className="relative h-[100dvh] w-full overflow-hidden bg-[#05070D] flex flex-col items-center justify-center px-4 sm:px-6">
                {/* Ambient Neon Glows */}
                <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-cyan-500/10 blur-[120px] rounded-full" />
                <div className="pointer-events-none absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-purple-600/10 blur-[120px] rounded-full" />

                {/* Main Cyber-Neon Start Button Container */}
                <div className="relative z-10 w-full max-w-[420px] mx-auto">
                    <button
                        onClick={handleStartGame}
                        className="relative w-full group focus:outline-none select-none"
                    >
                        {/* Animated Pulsing Border Glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00f2ff] via-purple-500 to-[#00f2ff] rounded-[28px] opacity-70 group-hover:opacity-100 blur-md transition-all duration-500 group-hover:duration-200 animate-pulse" />

                        {/* Inner Glassmorphic Card Body */}
                        <div className="relative w-full p-7 sm:p-8 rounded-[26px] bg-slate-900/85 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-300 group-hover:scale-[1.03] group-hover:bg-slate-900/95 group-hover:shadow-[0_0_35px_rgba(0,242,255,0.3)] group-active:scale-[0.97]">
                            {/* Light Sweep / Scanline Animation */}
                            <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out" />

                            {/* Status Badge */}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-widest mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                <span>01 // SYSTEM READY</span>
                            </div>

                            {/* Centerpiece Glowing Orb & Icon */}
                            <div className="relative mb-5">
                                <div className="absolute -inset-3 bg-cyan-400/20 blur-xl rounded-full group-hover:bg-cyan-400/35 transition-all" />
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_25px_rgba(0,242,255,0.4)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    <Play className="text-slate-950 fill-slate-950 ml-0.5" size={28} />
                                </div>
                            </div>

                            {/* Headline & Subtitle */}
                            <h3 className="text-2xl sm:text-3xl font-black tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-300 group-hover:from-cyan-300 group-hover:via-white group-hover:to-purple-300 transition-all">
                                START THE GAME
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm font-medium tracking-widest uppercase mt-1.5">
                                Interactive Story Universe
                            </p>

                            {/* Bottom Elevation Line */}
                            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent mt-6 group-hover:w-36 transition-all duration-500" />
                        </div>
                    </button>
                </div>
            </div>


            <NotificationPrompt
                isOpen={showNotificationPrompt}
                onAccept={handleAccept}
                onDecline={handleDecline}
            />
        </>
    );
}
