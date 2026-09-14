import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { audioManager as audioSynth } from "../utils/audioManager";
import { bgmManager } from '../utils/bgmManager';
import { Volume2, VolumeX, Trash2, AlertTriangle, Bell, Compass, Lock, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../utils/supabase';
import { clearAllUserData } from '../utils/session';
import { subscribeToPush, getNotificationSupportStatus, getExistingSubscription, logNotificationStatus } from '../utils/pushNotifications';

export function SettingsPage() {
    const navigate = useNavigate();
    const [newPreferredMap, setNewPreferredMap] = useState('standard');

    // Push Notifications State
    const [pushState, setPushState] = useState<'unsupported' | 'granted' | 'denied' | 'default' | 'subscribing'>(() => getNotificationSupportStatus());
    const [pushMessage, setPushMessage] = useState('');

    // Check active PushSubscription status on mount
    useEffect(() => {
        const checkActiveSubscription = async () => {
            const status = getNotificationSupportStatus();
            if (status === 'granted') {
                const sub = await getExistingSubscription();
                setPushState(sub ? 'granted' : 'default');
            } else {
                setPushState(status);
            }
        };
        checkActiveSubscription();
    }, []);

    // Delete Account State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const profile = useUserStore((state) => state.profile);
    const setProfile = useUserStore((state) => state.setProfile);
    const clearUserData = useUserStore((state) => state.clearUserData);

    const browseAge = useUserStore((state) => state.browseAge);
    const setBrowseAge = useUserStore((state) => state.setBrowseAge);

    const realAge = Math.max(10, Math.min(25, profile?.age || 18));
    const currentBrowseAge = Math.max(10, Math.min(25, browseAge ?? realAge));
    const isBrowsingDifferent = browseAge !== null && browseAge !== realAge;

    const handleAgeChange = (newAge: number) => {
        const clampedAge = Math.max(10, Math.min(25, newAge));
        audioSynth.playClick();
        if (clampedAge === realAge) {
            setBrowseAge(null);
        } else {
            setBrowseAge(clampedAge);
        }
        useUserStore.getState().syncLevels();
    };

    const handleResetAge = () => {
        audioSynth.playClick();
        setBrowseAge(null);
        useUserStore.getState().syncLevels();
    };
    const musicVolume = useUserStore((state) => state.musicVolume);
    const sfxVolume = useUserStore((state) => state.sfxVolume);
    const isMusicMuted = useUserStore((state) => state.isMusicMuted);
    const isSfxMuted = useUserStore((state) => state.isSfxMuted);
    const isNarrationMuted = useUserStore((state) => state.isNarrationMuted);
    const setMusicVolume = useUserStore((state) => state.setMusicVolume);
    const setSfxVolume = useUserStore((state) => state.setSfxVolume);
    const toggleMusicMute = useUserStore((state) => state.toggleMusicMute);
    const toggleSfxMute = useUserStore((state) => state.toggleSfxMute);
    const toggleNarrationMute = useUserStore((state) => state.toggleNarrationMute);

    const appLanguage = useUserStore((state) => state.appLanguage);
    const setAppLanguage = useUserStore((state) => state.setAppLanguage);


    useEffect(() => {
        if (profile) {
            if (profile.preferred_map) setNewPreferredMap(profile.preferred_map);
        }
    }, [profile]);

    // Live sync audio while in settings
    useEffect(() => {
        bgmManager.setVolume(isMusicMuted ? 0 : musicVolume);
        audioSynth.setMusicVolume(isMusicMuted ? 0 : musicVolume);
    }, [musicVolume, isMusicMuted]);

    useEffect(() => {
        audioSynth.setSfxVolume(isSfxMuted ? 0 : sfxVolume);
    }, [sfxVolume, isSfxMuted]);

    const handleSave = async () => {
        if (profile) {
            setProfile({ ...profile, preferred_map: newPreferredMap });
            try {
                await supabase.from('users').update({ 
                    preferred_map: newPreferredMap
                }).eq('id', profile.id);
            } catch (err) {
                console.error("Failed to update profile in Supabase", err);
            }
            useUserStore.getState().syncLevels();
            navigate('/game');
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        setDeleteError(null);

        const isGuest = !profile?.id || profile.id.startsWith('local_') || profile.id.startsWith('offline-');

        try {
            if (!isGuest && profile?.id) {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                let apiSuccess = false;
                try {
                    const response = await fetch('/api/delete-account', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({ userId: profile.id })
                    });

                    const resData = await response.json().catch(() => ({}));
                    if (response.ok && resData.success) {
                        apiSuccess = true;
                    } else if (resData.error) {
                        console.warn('[DeleteAccount] Endpoint returned error, trying DB fallback:', resData.error);
                    }
                } catch (fetchErr) {
                    console.warn('[DeleteAccount] Endpoint fetch failed, using DB fallback:', fetchErr);
                }

                // Fallback direct DB soft-delete if API endpoint didn't succeed
                if (!apiSuccess) {
                    const { error: dbError } = await supabase
                        .from('users')
                        .update({ status: 'deactivated', deleted_at: new Date().toISOString() })
                        .eq('id', profile.id);
                    if (dbError) {
                        throw new Error(`Database error: ${dbError.message}`);
                    }
                }

                try {
                    await supabase.auth.signOut();
                } catch {}
            }

            // Clear store and localStorage
            clearUserData();
            clearAllUserData();

            // Redirect
            navigate('/game/welcome');
        } catch (err: any) {
            console.error('[DeleteAccount] Error during account deletion:', err);
            setDeleteError(err.message || 'An error occurred while deleting your account. Please try again.');
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const handleEnablePush = async () => {
        audioSynth.playClick();
        setPushState('subscribing');
        setPushMessage('');
        try {
            const sub = await subscribeToPush(profile?.id);
            const status = getNotificationSupportStatus();
            if (sub || status === 'granted') {
                setPushState('granted');
                await logNotificationStatus(profile?.id, true, 'granted');
                setPushMessage('Notifications enabled! 🎉');
            } else {
                setPushState(status);
                await logNotificationStatus(profile?.id, false, status);
                if (status === 'denied') {
                    setPushMessage('Notifications are blocked in your browser settings. Please allow notifications in site settings.');
                } else if (status === 'unsupported') {
                    setPushMessage('Notifications not supported in this browser.');
                } else {
                    setPushMessage('Notification permission was not granted.');
                }
            }
        } catch (e: any) {
            const status = getNotificationSupportStatus();
            setPushState(status === 'granted' ? 'granted' : status);
            await logNotificationStatus(profile?.id, status === 'granted', status);
            setPushMessage(e?.message || 'Error subscribing to notifications');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`::-webkit-scrollbar { display: none; }`}</style>
                <h2 className="text-xl font-bold text-white mb-4 text-center">Settings</h2>
                <div className="space-y-6">
                    <div className="space-y-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-400 uppercase">Music</span>
                                <button
                                    onClick={() => { audioSynth.playClick(); toggleMusicMute(); }}
                                    className={clsx("p-1 rounded transition-colors", isMusicMuted ? "text-red-400 bg-red-900/30" : "text-green-400 bg-green-900/30")}
                                >
                                    {isMusicMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                </button>
                            </div>
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={musicVolume}
                                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-400 uppercase">Sound FX</span>
                                <button
                                    onClick={() => { audioSynth.playClick(); toggleSfxMute(); }}
                                    className={clsx("p-1 rounded transition-colors", isSfxMuted ? "text-red-400 bg-red-900/30" : "text-green-400 bg-green-900/30")}
                                >
                                    {isSfxMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                </button>
                            </div>
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={sfxVolume}
                                onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <div className="pt-2 border-t border-slate-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Voice Narration</span>
                                        <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded tracking-wider uppercase">
                                            Test Feature
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-snug">
                                        Voice narration is a test feature currently available only in select stories.
                                    </p>
                                </div>
                                <button
                                    onClick={() => { audioSynth.playClick(); toggleNarrationMute(); }}
                                    className={clsx("p-1 px-3 text-xs font-bold rounded transition-colors uppercase tracking-widest shrink-0 ml-2 mt-0.5", isNarrationMuted ? "text-red-400 bg-red-900/30" : "text-[#00f1fe] bg-[#00f1fe]/20")}
                                >
                                    {isNarrationMuted ? 'Muted' : 'Enabled'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Language</span>
                            <div className="flex bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                                <button
                                    onClick={() => { audioSynth.playClick(); setAppLanguage('en'); }}
                                    className={clsx("px-3 py-1 text-xs font-bold uppercase transition-colors", appLanguage === 'en' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white")}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => { audioSynth.playClick(); setAppLanguage('hi'); }}
                                    className={clsx("px-3 py-1 text-xs font-bold uppercase transition-colors", appLanguage === 'hi' ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white")}
                                >
                                    हिंदी
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Explore Stories by Age */}
                    <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700 space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Compass size={16} className="text-cyan-400" />
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Explore by Age</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-400 flex items-center gap-1">
                                <Lock size={10} className="text-slate-500" />
                                <span>Real Age: {realAge}</span>
                            </span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Temporarily browse and play stories from any age. Your original age remains fixed.
                        </p>

                        <div className="space-y-2 pt-1">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-slate-400">Target Age</span>
                                <span className={clsx("px-2 py-0.5 rounded-md text-xs font-extrabold", isBrowsingDifferent ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40")}>
                                    Age {currentBrowseAge} {isBrowsingDifferent && "(Browsing)"}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={10}
                                max={25}
                                step={1}
                                value={currentBrowseAge}
                                onChange={(e) => handleAgeChange(parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono select-none px-0.5 mt-1.5">
                                {[10, 13, 16, 19, 22, 25].map(tick => (
                                    <button
                                        key={tick}
                                        type="button"
                                        onClick={() => handleAgeChange(tick)}
                                        className={clsx(
                                            "transition-colors hover:text-cyan-300 cursor-pointer font-bold",
                                            currentBrowseAge === tick ? "text-cyan-300 scale-110" : "text-slate-500"
                                        )}
                                    >
                                        {tick}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isBrowsingDifferent && (
                            <button
                                onClick={handleResetAge}
                                className="w-full bg-slate-900/80 hover:bg-slate-900 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/60 font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                            >
                                <RotateCcw size={12} />
                                <span>Reset to My Real Age ({realAge})</span>
                            </button>
                        )}
                    </div>

                    {/* Push Notifications Section — only shown if not yet granted */}
                    {pushState !== 'granted' && (
                        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Bell size={16} className="text-purple-400" />
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Notifications</span>
                                </div>
                            </div>

                            {pushMessage && (
                                <div className={clsx(
                                    "text-xs font-medium px-3 py-2 rounded-xl border leading-snug transition-all",
                                    pushMessage.includes('enabled') || pushMessage.includes('OK') || pushMessage.includes('🎉')
                                        ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-300"
                                        : pushMessage.includes('blocked') || pushMessage.includes('denied')
                                        ? "bg-red-950/70 border-red-500/40 text-red-300"
                                        : "bg-purple-950/70 border-purple-500/40 text-purple-200"
                                )}>
                                    {pushMessage}
                                </div>
                            )}

                            {pushState === 'denied' ? (
                                <p className="text-[11px] text-slate-400 leading-snug">
                                    Notifications are blocked in your browser settings. Unblock them in your browser URL bar to enable notifications.
                                </p>
                            ) : pushState === 'unsupported' ? (
                                <p className="text-[11px] text-slate-400 leading-snug">
                                    Push notifications are not supported in this browser.
                                </p>
                            ) : (
                                <button
                                    onClick={handleEnablePush}
                                    disabled={pushState === 'subscribing'}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Bell size={14} />
                                    {pushState === 'subscribing' ? 'Enabling Notifications...' : 'Allow Notifications'}
                                </button>
                            )}
                        </div>
                    )}
                    <button onClick={() => { audioSynth.playClick(); handleSave(); }} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all mt-4">
                        UPDATE TIMELINE
                    </button>

                    <hr className="border-slate-700 my-2" />

                    <button
                        onClick={() => { 
                            audioSynth.playClick(); 
                            sessionStorage.setItem('aya_start_tutorial_requested', 'true');
                            navigate('/game?tutorial=true');
                            setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('tutorial-start'));
                            }, 150);
                        }}
                        className="w-full bg-slate-800 hover:bg-cyan-900/50 text-cyan-400 hover:text-cyan-200 border border-slate-700 hover:border-cyan-800 font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                    >
                        <Compass size={16} /> Replay Walkthrough Tutorial
                    </button>

                    <button
                        onClick={async () => {
                            audioSynth.playClick();
                            try {
                                const { authService } = await import('../services/authService');
                                await authService.signOut();
                                navigate('/signin');
                            } catch (err) {
                                console.error('Error signing out:', err);
                            }
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 font-bold py-3 mt-4 rounded-xl shadow-lg transform active:scale-95 transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                    >
                        Sign Out
                    </button>

                    {/* Bottom row: Go Back (left) & Delete Account (bottom right) */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                        <button
                            onClick={() => { audioSynth.playBack(); navigate(-1); }}
                            className="text-slate-500 text-xs font-semibold hover:text-white transition-colors py-2 px-1"
                        >
                            ← Go Back
                        </button>
                        <button
                            onClick={() => { audioSynth.playClick(); setShowDeleteConfirm(true); }}
                            className="px-3.5 py-2 bg-red-950/70 hover:bg-red-900 text-red-400 hover:text-red-100 border border-red-800/70 hover:border-red-600 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all transform active:scale-95"
                        >
                            <Trash2 size={13} />
                            <span>Delete Account</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2-Step Confirmation Modal for Account Deletion */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-red-900/80 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
                        <div className="w-12 h-12 rounded-full bg-red-950 border border-red-800 text-red-400 flex items-center justify-center mx-auto shadow-inner">
                            <AlertTriangle size={24} />
                        </div>
                        
                        <h3 className="text-lg font-black text-white tracking-wide">Delete Your Account?</h3>
                        
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Your account will be deactivated immediately and permanently erased after <strong className="text-red-400 font-bold">30 days</strong>. All your XP, levels, traits, and story progress will be lost.
                        </p>

                        {deleteError && (
                            <div className="p-3 bg-red-950/90 border border-red-800 text-red-200 text-xs rounded-xl font-semibold">
                                ⚠️ {deleteError}
                            </div>
                        )}

                        <div className="flex flex-col gap-2.5 pt-2">
                            <button
                                disabled={isDeletingAccount}
                                onClick={handleDeleteAccount}
                                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all transform active:scale-95"
                            >
                                {isDeletingAccount ? (
                                    <span>Deactivating Account…</span>
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        <span>Confirm Account Deletion</span>
                                    </>
                                )}
                            </button>
                            <button
                                disabled={isDeletingAccount}
                                onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); }}
                                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
