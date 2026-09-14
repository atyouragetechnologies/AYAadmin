import { useState } from 'react';
import { 
    Bell, X, Sparkles, Smartphone, Share2, PlusSquare, ArrowDown, 
    Check, Monitor, Laptop, ArrowRight, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager as audioSynth } from "../../utils/audioManager";
import { isPwaInstalled, isIosDevice, canPromptNativeInstall, triggerNativeInstall } from '../../utils/pwaInstall';
import { detectDeviceInfo, recordAppInstall, recordNotificationDecision } from '../../utils/installTracker';

interface NotificationPromptProps {
    isOpen: boolean;
    onAccept: () => void | Promise<any>;
    onDecline: () => void;
}

type PromptViewMode = 'main' | 'ios-guide' | 'desktop-guide' | 'android-guide' | 'success';

export function NotificationPrompt({ isOpen, onAccept, onDecline }: NotificationPromptProps) {
    const [viewMode, setViewMode] = useState<PromptViewMode>('main');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const alreadyInstalled = isPwaInstalled();
    const isIos = isIosDevice();
    const deviceInfo = detectDeviceInfo();

    const handleAcceptAll = async () => {
        try { audioSynth.playClick(); } catch {}
        setIsProcessing(true);
        
        // 1. Enable Push Notifications
        let notifGranted = false;
        try {
            if (typeof window !== 'undefined' && 'Notification' in window) {
                const perm = await Notification.requestPermission();
                notifGranted = perm === 'granted';
                await recordNotificationDecision(perm === 'granted' ? 'granted' : 'denied');
            }
            await onAccept();
        } catch (e) {
            console.warn('[NotificationPrompt] Notification request error:', e);
        }

        // 2. If already installed, show success
        if (alreadyInstalled) {
            await recordAppInstall('standalone_verified', { pushGranted: notifGranted });
            setViewMode('success');
            setIsProcessing(false);
            return;
        }

        // 3. If native prompt is available (Android/Chrome/Edge), trigger it
        if (canPromptNativeInstall()) {
            const outcome = await triggerNativeInstall();
            if (outcome === 'accepted') {
                await recordAppInstall('native_prompt', { pushGranted: notifGranted });
                setViewMode('success');
            } else if (notifGranted) {
                setViewMode('success');
            } else {
                onDecline();
            }
            setIsProcessing(false);
            return;
        }

        // 4. Fallback guides based on device
        if (isIos) {
            setViewMode('ios-guide');
        } else if (deviceInfo.deviceType === 'desktop') {
            setViewMode('desktop-guide');
        } else {
            setViewMode('android-guide');
        }
        setIsProcessing(false);
    };

    const handleInstallOnly = async () => {
        try { audioSynth.playClick(); } catch {}
        
        if (alreadyInstalled) {
            await recordAppInstall('standalone_verified');
            setViewMode('success');
            return;
        }

        if (canPromptNativeInstall()) {
            const outcome = await triggerNativeInstall();
            if (outcome === 'accepted') {
                await recordAppInstall('native_prompt');
                setViewMode('success');
            } else {
                if (isIos) setViewMode('ios-guide');
                else if (deviceInfo.deviceType === 'desktop') setViewMode('desktop-guide');
                else setViewMode('android-guide');
            }
            return;
        }

        if (isIos) {
            setViewMode('ios-guide');
        } else if (deviceInfo.deviceType === 'desktop') {
            setViewMode('desktop-guide');
        } else {
            setViewMode('android-guide');
        }
    };

    const handleManualInstallConfirmed = async (sourceMethod: 'ios_guide' | 'desktop_guide' | 'android_guide') => {
        try { audioSynth.playClick(); } catch {}
        await recordAppInstall(sourceMethod);
        setViewMode('success');
    };

    const handleClose = () => {
        try { audioSynth.playClick(); } catch {}
        setViewMode('main');
        onDecline();
    };

    return (
        <AnimatePresence>
            <div data-aya-modal="notification-prompt" className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-[#0a0d18] border border-cyan-500/30 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,242,255,0.2)] overflow-hidden text-white max-h-[90dvh] overflow-y-auto"
                >
                    {/* Multi-layer Ambient Cosmic Glow */}
                    <div className="absolute -top-24 -right-24 w-52 h-52 bg-cyan-500/15 blur-[80px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-fuchsia-500/15 blur-[80px] rounded-full pointer-events-none" />

                    {/* Back / Close button */}
                    <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-20">
                        {viewMode !== 'main' && viewMode !== 'success' ? (
                            <button
                                onClick={() => setViewMode('main')}
                                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all flex items-center gap-1 text-xs font-bold"
                            >
                                <ChevronLeft size={16} /> Back
                            </button>
                        ) : <div />}

                        <button
                            onClick={handleClose}
                            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                            aria-label="Close prompt"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* 1. MAIN VIEW */}
                    {viewMode === 'main' && (
                        <div className="relative z-10 flex flex-col items-center text-center mt-2">
                            {/* Glowing Dual Badge: Notification + Homescreen */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-16 h-16 bg-[#070b16] border-2 border-cyan-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)] animate-pulse">
                                    <Bell size={28} className="text-cyan-400 fill-cyan-400/20 drop-shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
                                </div>
                                {!alreadyInstalled && (
                                    <div className="w-16 h-16 bg-[#070b16] border-2 border-purple-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                                        {deviceInfo.deviceType === 'desktop' ? (
                                            <Monitor size={28} className="text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                                        ) : (
                                            <Smartphone size={28} className="text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                                        )}
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                Level Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">AYA Streak</span> 🔥
                            </h2>
                            
                            <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
                                Never miss your daily historical dilemma and keep your streak and psychometric DNA evolving!
                            </p>

                            {/* Key Highlights Grid */}
                            <div className="w-full grid grid-cols-1 gap-2.5 mb-6 text-left">
                                <div className="flex items-start gap-3 p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
                                    <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                                        <Bell size={18} />
                                    </span>
                                    <div>
                                        <div className="text-xs sm:text-sm font-bold text-white">Daily Streak Reminders</div>
                                        <div className="text-[11px] sm:text-xs text-slate-400">Alerts when your daily challenge is ready so you never reset.</div>
                                    </div>
                                </div>

                                {!alreadyInstalled && (
                                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20">
                                        <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                                            {deviceInfo.deviceType === 'desktop' ? <Monitor size={18} /> : <Smartphone size={18} />}
                                        </span>
                                        <div>
                                            <div className="text-xs sm:text-sm font-bold text-white">
                                                {deviceInfo.deviceType === 'desktop' ? 'Install App on Desktop' : 'Add to Home Screen'}
                                            </div>
                                            <div className="text-[11px] sm:text-xs text-slate-400">
                                                1-tap launch in full screen with zero browser bars.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="w-full space-y-2.5">
                                <button
                                    onClick={handleAcceptAll}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 hover:brightness-110 text-slate-950 font-black uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(0,242,255,0.4)] transition-all transform active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-75 cursor-pointer"
                                >
                                    <Sparkles size={18} className="text-slate-950" />
                                    <span>
                                        {isProcessing 
                                            ? 'ACTIVATING...'
                                            : !alreadyInstalled
                                            ? (isIos ? 'TURN ON & ADD TO HOMESCREEN 📲' : 'TURN ON & INSTALL APP 📲')
                                            : 'YES, REMIND ME 🔔'}
                                    </span>
                                </button>

                                {!alreadyInstalled && (
                                    <button
                                        onClick={handleInstallOnly}
                                        disabled={isProcessing}
                                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold uppercase tracking-wider rounded-2xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
                                    >
                                        <Smartphone size={14} className="text-purple-400" />
                                        <span>
                                            {deviceInfo.deviceType === 'desktop' ? 'Install Desktop App Only' : 'Add to Home Screen Only'}
                                        </span>
                                    </button>
                                )}
                                
                                <button
                                    onClick={handleClose}
                                    className="w-full py-2.5 text-slate-500 hover:text-slate-300 font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. iOS STEP-BY-STEP GUIDE */}
                    {viewMode === 'ios-guide' && (
                        <div className="relative z-10 flex flex-col items-center text-center mt-2">
                            <div className="w-16 h-16 bg-purple-900/30 border-2 border-purple-400 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                                <Smartphone size={30} className="text-purple-300" />
                            </div>

                            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white mb-2">
                                Add AYA to Home Screen
                            </h3>

                            <p className="text-slate-300 text-xs sm:text-sm mb-6">
                                Follow these 3 simple steps in Safari to enjoy the full-screen native experience:
                            </p>

                            <div className="w-full space-y-3 mb-6 text-left">
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        1
                                    </div>
                                    <div className="flex-1 text-xs sm:text-sm text-slate-200">
                                        Tap the <span className="font-bold text-cyan-400 inline-flex items-center gap-1"><Share2 size={15} /> Share</span> icon at the bottom of Safari.
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        2
                                    </div>
                                    <div className="flex-1 text-xs sm:text-sm text-slate-200">
                                        Scroll down and tap <span className="font-bold text-purple-400 inline-flex items-center gap-1"><PlusSquare size={15} /> Add to Home Screen</span>.
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        3
                                    </div>
                                    <div className="flex-1 text-xs sm:text-sm text-slate-200">
                                        Tap <span className="font-bold text-emerald-400">Add</span> in the top-right corner!
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center text-cyan-400 text-xs gap-1 animate-bounce mb-5">
                                <ArrowDown size={14} />
                                <span>Look for the Share button at the bottom of your screen</span>
                            </div>

                            <button
                                onClick={() => handleManualInstallConfirmed('ios_guide')}
                                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer"
                            >
                                <Check size={16} strokeWidth={3} />
                                <span>I've Added It to Home Screen</span>
                            </button>
                        </div>
                    )}

                    {/* 3. DESKTOP STEP-BY-STEP GUIDE */}
                    {viewMode === 'desktop-guide' && (
                        <div className="relative z-10 flex flex-col items-center text-center mt-2">
                            <div className="w-16 h-16 bg-cyan-950/40 border-2 border-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                                <Laptop size={30} className="text-cyan-300" />
                            </div>

                            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white mb-2">
                                Install AYA on Desktop
                            </h3>

                            <p className="text-slate-300 text-xs sm:text-sm mb-6">
                                Install At Your Age as a standalone desktop app with zero browser toolbars:
                            </p>

                            <div className="w-full space-y-3 mb-6 text-left">
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        1
                                    </div>
                                    <div className="flex-1 text-xs sm:text-sm text-slate-200">
                                        Look at the right side of your browser address bar and click the <span className="font-bold text-cyan-400">Install (⊕ / 💻)</span> icon.
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        2
                                    </div>
                                    <div className="flex-1 text-xs sm:text-sm text-slate-200">
                                        Or click the <span className="font-bold text-purple-400">Menu (⋮)</span> in Chrome/Edge → select <span className="font-bold text-purple-400">"Install At Your Age"</span>.
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        3
                                    </div>
                                    <div className="flex-1 text-xs sm:text-sm text-slate-200">
                                        Click <span className="font-bold text-emerald-400">Install</span> in the prompt window!
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleManualInstallConfirmed('desktop_guide')}
                                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer"
                            >
                                <Check size={16} strokeWidth={3} />
                                <span>I've Installed the App</span>
                            </button>
                        </div>
                    )}

                    {/* 4. ANDROID STEP-BY-STEP GUIDE */}
                    {viewMode === 'android-guide' && (
                        <div className="relative z-10 flex flex-col items-center text-center mt-2">
                            <div className="w-16 h-16 bg-emerald-950/40 border-2 border-emerald-400 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                <Smartphone size={30} className="text-emerald-300" />
                            </div>

                            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white mb-2">
                                Add AYA to Home Screen
                            </h3>

                            <p className="text-slate-300 text-xs sm:text-sm mb-6">
                                Quick 2-step setup in Chrome on Android:
                            </p>

                            <div className="w-full space-y-3 mb-6 text-left">
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        1
                                    </div>
                                    <div className="flex-1 text-xs sm:text-sm text-slate-200">
                                        Tap the <span className="font-bold text-cyan-400">three dots (⋮)</span> in the top-right corner of Chrome.
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                                        2
                                    </div>
                                    <div className="flex-1 text-xs sm:text-sm text-slate-200">
                                        Tap <span className="font-bold text-emerald-400">"Add to Home screen"</span> or <span className="font-bold text-emerald-400">"Install app"</span>.
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleManualInstallConfirmed('android_guide')}
                                className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer"
                            >
                                <Check size={16} strokeWidth={3} />
                                <span>I've Added It to Home Screen</span>
                            </button>
                        </div>
                    )}

                    {/* 5. SUCCESS CELEBRATION VIEW */}
                    {viewMode === 'success' && (
                        <div className="relative z-10 flex flex-col items-center text-center py-4">
                            <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-400 rounded-full flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
                                <CheckCircle2 size={40} className="text-emerald-400" />
                            </div>

                            <h3 className="text-2xl font-black uppercase tracking-wider text-white mb-2">
                                You're All Set! 🎉
                            </h3>

                            <p className="text-slate-300 text-sm mb-8 max-w-xs leading-relaxed">
                                At Your Age is now added to your device. Streak reminders will ensure your psychometric DNA keeps evolving!
                            </p>

                            <button
                                onClick={handleClose}
                                className="w-full py-4 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black uppercase tracking-widest rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                            >
                                <span>LET'S PLAY</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default NotificationPrompt;
