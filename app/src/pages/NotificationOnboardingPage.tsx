import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { subscribeUserToPush } from '../utils/pushNotifications';
import { audioManager as audioSynth } from "../utils/audioManager";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { isNativeApp } from '../hooks/useNativeFeatures';

export function NotificationOnboardingPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const navigate = useNavigate();

    useEffect(() => {
        // If already prompted or unsupported on web, skip directly
        // On native app, local notifications always supported, don't skip
        if (!isNativeApp && !('Notification' in window)) {
            navigate('/game', { replace: true });
        }
    }, [navigate]);

    const finish = () => {
        localStorage.setItem('aya_push_prompted', 'true');
        navigate('/game', { replace: true });
    };

    /**
     * Schedule a recurring local notification at 8:00 PM IST every day.
     * This is zero-cost and works 100% offline — no server needed.
     */
    const scheduleStreakNotifications = async () => {
        try {
            const { LocalNotifications } = await import('@capacitor/local-notifications');

            // Request permission first (required on Android 13+)
            const permResult = await LocalNotifications.requestPermissions();
            if (permResult.display !== 'granted') return false;

            // Cancel any previously scheduled AYA notifications (avoid duplicates on re-prompt)
            const pending = await LocalNotifications.getPending();
            const ayaIds = pending.notifications.filter(n => n.id >= 1001 && n.id <= 1010).map(n => ({ id: n.id }));
            if (ayaIds.length > 0) await LocalNotifications.cancel({ notifications: ayaIds });

            const now = new Date();

            // Daily streak reminder at 8:00 PM IST (14:30 UTC)
            // Schedule for next 7 days as individual notifications (most reliable approach)
            const notifications = [];
            for (let day = 1; day <= 7; day++) {
                const triggerDate = new Date(now);
                triggerDate.setDate(triggerDate.getDate() + day);
                // 8 PM IST = 14:30 UTC
                triggerDate.setUTCHours(14, 30, 0, 0);

                const streakMessages = [
                    { title: "🔥 Your streak is waiting!", body: "Don't break the chain — play today's AYA story!" },
                    { title: "⚡ Daily Challenge Ready", body: "Your leadership DNA session is ready. Who will you become?" },
                    { title: "🎯 Stay sharp, stay consistent", body: "One story a day keeps regret away. Play now!" },
                    { title: "🧬 DNA Update Pending", body: "Your personality profile needs today's data. Play your story!" },
                    { title: "🏆 You're on a streak!", body: "Keep it going — your future self is counting on you." },
                ];
                const msg = streakMessages[day % streakMessages.length];

                notifications.push({
                    id: 1000 + day,
                    title: msg.title,
                    body: msg.body,
                    schedule: { at: triggerDate },
                    sound: 'default',
                    smallIcon: 'ic_launcher',
                    channelId: 'aya_streak',
                });
            }

            await LocalNotifications.schedule({ notifications });
            console.log('[AYA] Local streak notifications scheduled for 7 days');
            return true;
        } catch (e) {
            console.warn('[AYA] Local notifications failed:', e);
            return false;
        }
    };

    const handleEnable = async () => {
        audioSynth.playClick();
        setStatus('loading');
        try {
            if (isNativeApp) {
                // Android: use local notifications (zero-cost, works offline)
                const scheduled = await scheduleStreakNotifications();
                setStatus(scheduled ? 'success' : 'error');
                setTimeout(finish, 1500);
            } else {
                // Web: use existing web push subscription
                const sub = await subscribeUserToPush();
                if (sub) {
                    setStatus('success');
                    setTimeout(finish, 1500);
                } else {
                    setStatus('error');
                    setTimeout(finish, 1500);
                }
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setTimeout(finish, 1500);
        }
    };

    const handleSkip = () => {
        audioSynth.playClick();
        finish();
    };


    return (
        <div className="min-h-[100dvh] bg-[#0a0510] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-transparent to-fuchsia-900/10 pointer-events-none" />
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-md w-full relative z-10 flex flex-col items-center text-center"
            >
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                    className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/30 to-fuchsia-500/10 flex items-center justify-center mb-8 border border-purple-400/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] backdrop-blur-md"
                >
                    <Bell className="text-purple-300 w-12 h-12 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-slate-400 mb-6 tracking-tight">
                    Stay Connected
                </h1>
                
                <p className="text-lg text-slate-300 mb-12 leading-relaxed">
                    Turn on notifications to get daily challenges, story updates, and streak reminders directly to your device!
                </p>

                <div className="w-full space-y-4">
                    <button
                        onClick={handleEnable}
                        disabled={status !== 'idle'}
                        className="w-full py-5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-lg font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10">
                            {status === 'idle' && 'ENABLE NOTIFICATIONS'}
                            {status === 'loading' && 'WAITING FOR BROWSER...'}
                            {status === 'success' && 'ENABLED! 🚀'}
                            {status === 'error' && 'FAILED ❌'}
                        </span>
                    </button>

                    <button
                        onClick={handleSkip}
                        className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
