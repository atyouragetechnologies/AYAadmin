import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { StreakCelebration } from '../components/game/StreakCelebration';
import { SubscriptionModal } from '../components/payment/SubscriptionModal';
import { auth } from '../lib/firebase';
import { getUserProfile, getPersonalityProfile } from '../lib/firestore';
import { getSession, clearSession, markQuizDone, isQuizDone } from '../utils/session';
import { withTimeout } from '../utils/withTimeout';
import { useUserStore } from '../store/userStore';
import { safeStorage } from '../utils/storage';
import { NotificationPrompt } from '../components/ui/NotificationPrompt';
import { MascotLoader } from '../components/ui/MascotLoader';
import { subscribeUserToPush } from '../utils/pushNotifications';
import { shouldShowInstallPrompt, recordInstallPromptShown } from '../utils/pwaInstall';
import { initStandaloneAutoTracking } from '../utils/installTracker';

export function GameRoot() {
    const profile = useUserStore((state) => state.profile);
    const mapTheme = useUserStore((state) => state.mapTheme);
    const setMapTheme = useUserStore((state) => state.setMapTheme);
    const pendingStreakData = useUserStore((state) => state.pendingStreakData);
    const setPendingStreakData = useUserStore((state) => state.setPendingStreakData);
    const showSubscriptionModal = useUserStore((state) => state.showSubscriptionModal);
    const setShowSubscriptionModal = useUserStore((state) => state.setShowSubscriptionModal);
    const location = useLocation();
    const safetySyncStarted = useRef(false);

    // Sync theme from localStorage on mount; reset 'solar' → 'city_dark'
    useEffect(() => {
        const raw = safeStorage.get('aya_map_theme') as any;
        const storedTheme = (!raw || raw === 'solar') ? 'city_dark' : raw;
        if (storedTheme !== mapTheme) {
            setMapTheme(storedTheme);
        }
    }, []);


    // NOTE: syncLevels is called explicitly inside restoreSession after scores are loaded.
    // Do NOT call it here on mount — it would run with empty levelScores and reset everything.

    const [sessionStatus, setSessionStatus] = useState<'checking' | 'found' | 'not_found'>(() => {
        return useUserStore.getState().profile ? 'found' : 'checking';
    });

    useEffect(() => {
        if (sessionStatus === 'found') {
            // we could store the last path, but simple last view is fine
            if (location.pathname === '/game' || location.pathname === '/game/dna') {
                localStorage.setItem('aya_last_view', location.pathname);
            }
        }
    }, [location.pathname, sessionStatus]);



    // Safety net: if a user finishes onboarding, GameRoot is already mounted,
    // so restoreSession() won't run again. We must fetch levels for them.
    useEffect(() => {
        const store = useUserStore.getState();
        if (profile && store.levels.length === 0 && sessionStatus !== 'checking') {
            if (!safetySyncStarted.current) {
                safetySyncStarted.current = true;
                store.syncLevels().finally(() => {
                    // Reset if it somehow fails, allowing retry
                    if (useUserStore.getState().levels.length === 0) {
                        safetySyncStarted.current = false;
                    }
                });
            }
        }
    }, [profile, sessionStatus]);

    useEffect(() => {
        const restoreSession = async () => {
            setTimeout(() => setSessionStatus(prev => prev === 'checking' ? 'not_found' : prev), 10000);
            console.log('[Session] Checking for existing session...')

            // ── FIREBASE FAST PATH ──────────────────────────────────────────────
            // If Zustand store already has a profile, show app immediately.
            // Refresh from Firestore silently in background.
            const store = useUserStore.getState();
            const sessionQuick = getSession();
            const fbUser = auth.currentUser;
            if (store.profile && store.profile.id === (fbUser?.uid || sessionQuick.userId)) {
                setSessionStatus('found');
                const uid = store.profile.id;
                Promise.all([
                    getUserProfile(uid),
                    getPersonalityProfile(uid),
                ]).then(([freshUser, freshPP]) => {
                    if (freshUser || freshPP) {
                        const cur = (store.profile || {}) as any;
                        const gp = (freshUser as any)?.gameplayScores || cur.gameplay_scores;
                        const traits = {
                            risk: (freshPP as any)?.traitRiskTaker ?? gp?.risk ?? cur.traits?.risk ?? 50,
                            creativity: (freshPP as any)?.traitCreative ?? gp?.creativity ?? cur.traits?.creativity ?? 50,
                            vision: (freshPP as any)?.traitAnalytical ?? gp?.vision ?? cur.traits?.vision ?? 50,
                            empathy: (freshPP as any)?.traitSocial ?? gp?.empathy ?? cur.traits?.empathy ?? 50,
                            leadership: (freshPP as any)?.traitAmbitious ?? gp?.leadership ?? cur.traits?.leadership ?? 50,
                            discipline: (freshPP as any)?.lifeDiscipline ?? cur.traits?.discipline ?? 50,
                            resilience: (freshPP as any)?.lifeResilience ?? cur.traits?.resilience ?? 50,
                        };
                        store.setProfile({
                            ...cur,
                            ...(freshUser || {}),
                            traits,
                            ...((freshPP as any)?.futureArchetype ? { futureArchetype: (freshPP as any).futureArchetype } : {}),
                            ...((freshPP as any)?.futureArchetypeScore ? { futureArchetypeScore: (freshPP as any).futureArchetypeScore } : {}),
                            ...((freshPP as any)?.lifeResilience ? {
                                lifeTraits: {
                                    resilience: (freshPP as any).lifeResilience,
                                    discipline: (freshPP as any).lifeDiscipline,
                                    courage: (freshPP as any).lifeCourage,
                                    creativity: (freshPP as any).lifeCreativity,
                                    emotional_control: (freshPP as any).lifeEmotionalControl,
                                    leadership: (freshPP as any).lifeLeadership,
                                    risk_intelligence: (freshPP as any).lifeRiskIntelligence,
                                    consistency: (freshPP as any).lifeConsistency,
                                }
                            } : {})
                        } as any);
                    }
                }).catch(() => { /* silent — cached profile already shown */ });
                return;
            }
            // ─────────────────────────────────────────────────────────────────────

            // Reduced from 20s → 8s for faster iOS failure recovery
            const maxWait = setTimeout(() => {
                setSessionStatus(prev => prev === 'checking' ? 'not_found' : prev);
            }, 20000);

            try {
                let session = getSession();
                let userIdToUse = session.userId;

                // Resolve user ID from Firebase Auth if not in local session
                const fbUser = auth.currentUser;
                if (!userIdToUse && fbUser) {
                    userIdToUse = fbUser.uid;
                    localStorage.setItem('aya_user_id', fbUser.uid);
                }

                if (!userIdToUse) {
                    clearTimeout(maxWait);
                    setSessionStatus('not_found');
                    return;
                }

                let user: any = null;
                const isJeeNeet = store.profile?.access_type === 'jee15' || store.profile?.access_type === 'neet15';

                if (isJeeNeet) {
                    let attempt = 0;
                    while (attempt < 3 && !user) {
                        attempt++;
                        try {
                            user = await withTimeout(getUserProfile(userIdToUse));
                            if (!user) throw new Error('No profile found');
                        } catch (e) {
                            if (attempt < 3) {
                                await new Promise(r => setTimeout(r, 5000));
                            } else {
                                clearTimeout(maxWait);
                                return;
                            }
                        }
                    }
                } else {
                    try {
                        user = await withTimeout(getUserProfile(userIdToUse), 6000);
                    } catch (dbErr) {
                        if (!store.profile) {
                            store.setProfile({
                                id: userIdToUse,
                                name: session.name || 'Player',
                                age: session.age || 18,
                                mobile: session.mobile,
                                total_xp: 0, level: 1,
                                current_streak: 0, longest_streak: 0,
                                stories_completed: 0,
                                daily_challenge_completed: false,
                                preferred_theme: 'city_dark',
                                access_type: 'free',
                                access_start_date: null,
                                preferred_map: null,
                                assessmentCompleted: isQuizDone(),
                            } as any);
                            if (isQuizDone()) {
                                store.completeAssessment(
                                    { discipline: 50, resilience: 50, risk: 50, leadership: 50, creativity: 50, empathy: 50, vision: 50 },
                                    { motivation: 'Stability', risk: 'Balanced', emotional: 'Resilient', social: 'Supporter', passion: 'Creative', coreValue: 'Success' }
                                );
                            }
                        }
                        clearTimeout(maxWait);
                        setSessionStatus('found');
                        return;
                    }
                }

                if (!user) {
                    clearSession();
                    clearTimeout(maxWait);
                    setSessionStatus('not_found');
                    return;
                }


                let profileData: any = null;
                try {
                    profileData = await withTimeout(getPersonalityProfile(userIdToUse), 5000);
                } catch { }

                // Check quiz completion from Firestore (personality doc existing = quiz done)
                let quizCompleted = isQuizDone() || !!profileData;
                if (!quizCompleted) {
                    // In Firestore, quiz_responses exist as sub-collection
                    // If they have personality profile or XP, consider assessment done
                    if ((user as any)?.totalXp > 0 || (user as any)?.storiesCompleted > 0) {
                        quizCompleted = true;
                        markQuizDone();
                    }
                }

                // Fallback: If they have progression data or already completed onboarding, assume assessment is done
                if (!quizCompleted && user && ((user as any).totalXp > 0 || (user as any).storiesCompleted > 0 || (user as any).level > 1 || (user as any).onboardingComplete)) {
                    quizCompleted = true;
                    markQuizDone();
                    localStorage.setItem('onboarding_done', 'true');
                }

                // Build level scores from Firestore user doc (levelScores field)
                const restoredScores: Record<string, number> = {};
                if (user && (user as any).levelScores) {
                    const dbScores = (user as any).levelScores as Record<string, number>;
                    Object.entries(dbScores).forEach(([id, stars]) => {
                        restoredScores[id] = Math.max(restoredScores[id] || 0, Number(stars) || 0);
                    });
                }

                console.log('[Session] Final restored scores:', JSON.stringify(restoredScores));

                // ── STEP 1.5: Check if user is an admin ──
                let isAdmin = false;
                try {
                    const { checkIsAdmin } = await import('../utils/adminCheck');
                    isAdmin = await checkIsAdmin();
                } catch (err) {
                    console.error('Failed to check admin status:', err);
                }

                // ── STEP 2: Set profile (this triggers syncLevels internally but we'll override after) ──
                store.setProfile({
                    id: (user as any).id,
                    name: (user as any).name,
                    age: Number((user as any).age) || 18,
                    mobile: (user as any).mobile,
                    username: (user as any).username ?? undefined,
                    email: (user as any).email ?? undefined,
                    auth_user_id: (user as any).id,
                    onboarding_complete: Boolean((user as any).onboardingComplete || (user as any).username),
                    total_xp: (user as any).totalXp || 0,
                    level: (user as any).level || 1,
                    current_streak: (user as any).currentStreak || 0,
                    longest_streak: (user as any).longestStreak || 0,
                    stories_completed: (user as any).storiesCompleted || 0,
                    daily_challenge_completed: (user as any).dailyChallengeCompleted || false,
                    daily_free_stories: (user as any).dailyFreeStories || 0,
                    last_story_date: (user as any).lastStoryDate || undefined,
                    preferred_theme: (user as any).preferredTheme || 'city_dark',
                    access_type: (user as any).accessType,
                    access_start_date: (user as any).accessStartDate,
                    assessmentCompleted: quizCompleted,
                    onboarding_scores: (user as any).onboardingScores || undefined,
                    gameplay_scores: (user as any).gameplayScores || undefined,
                    story_count: (user as any).storyCount || 0,
                    tutorial_completed: (user as any).tutorialCompleted || false,
                    topic_survey_completed: (user as any).topicSurveyCompleted || false,
                    choice_history: (user as any).choiceHistory || [],
                    music_volume: (user as any).musicVolume,
                    sfx_volume: (user as any).sfxVolume,
                    is_music_muted: (user as any).isMusicMuted,
                    is_sfx_muted: (user as any).isSfxMuted,
                    traits: {
                        risk: (profileData as any)?.traitRiskTaker ?? (user as any)?.gameplayScores?.risk ?? (user as any)?.onboardingScores?.risk ?? 50,
                        creativity: (profileData as any)?.traitCreative ?? (user as any)?.gameplayScores?.creativity ?? (user as any)?.onboardingScores?.creativity ?? 50,
                        vision: (profileData as any)?.traitAnalytical ?? (user as any)?.gameplayScores?.vision ?? (user as any)?.onboardingScores?.vision ?? 50,
                        empathy: (profileData as any)?.traitSocial ?? (user as any)?.gameplayScores?.empathy ?? (user as any)?.onboardingScores?.empathy ?? 50,
                        leadership: (profileData as any)?.traitAmbitious ?? (user as any)?.gameplayScores?.leadership ?? (user as any)?.onboardingScores?.leadership ?? 50,
                        discipline: (profileData as any)?.lifeDiscipline ?? 50,
                        resilience: (profileData as any)?.lifeResilience ?? 50,
                    },
                    futureArchetype: (profileData as any)?.futureArchetype || undefined,
                    futureArchetypeScore: (profileData as any)?.futureArchetypeScore || undefined,
                    lifeTraits: profileData ? {
                        resilience: (profileData as any).lifeResilience || 50,
                        discipline: (profileData as any).lifeDiscipline || 50,
                        courage: (profileData as any).lifeCourage || 50,
                        creativity: (profileData as any).lifeCreativity || 50,
                        emotional_control: (profileData as any).lifeEmotionalControl || 50,
                        leadership: (profileData as any).lifeLeadership || 50,
                        risk_intelligence: (profileData as any).lifeRiskIntelligence || 50,
                        consistency: (profileData as any).lifeConsistency || 50,
                    } : undefined,
                    isAdmin
                } as any);

                // Initialize default assessment traits if user has never taken quiz
                if (!quizCompleted && !profileData && !(user as any).onboardingScores && !(user as any).gameplayScores) {
                    store.completeAssessment(
                        { discipline: 50, resilience: 50, risk: 50, leadership: 50, creativity: 50, empathy: 50, vision: 50 },
                        { motivation: 'Stability', risk: 'Balanced', emotional: 'Resilient', social: 'Supporter', passion: 'Creative', coreValue: 'Success' }
                    );
                }

                const savedTheme = (user as any).preferredTheme || 'city_dark';
                store.setMapTheme(savedTheme as any);

                // Restore persistent preferences from Firestore doc
                if ((user as any).tutorialCompleted) localStorage.setItem('aya_game_tutorial_done', 'true');
                if ((user as any).topicSurveyCompleted) localStorage.setItem('aya_topic_survey_done', 'true');
                if ((user as any).choiceHistory && Array.isArray((user as any).choiceHistory) && (user as any).choiceHistory.length > 0) {
                    localStorage.setItem('aya_choice_history', JSON.stringify((user as any).choiceHistory));
                }
                if (typeof (user as any).musicVolume === 'number') store.setMusicVolume((user as any).musicVolume);
                if (typeof (user as any).sfxVolume === 'number') store.setSfxVolume((user as any).sfxVolume);
                if (typeof (user as any).isMusicMuted === 'boolean' && (user as any).isMusicMuted !== store.isMusicMuted) {
                    store.toggleMusicMute();
                }
                if (typeof (user as any).isSfxMuted === 'boolean' && (user as any).isSfxMuted !== store.isSfxMuted) {
                    store.toggleSfxMute();
                }

                // ── STEP 3: SYNC LEVELS AND APPLY SCORES ──
                // Everyone needs levels, so we always sync them.
                await store.syncLevels();

                if (Object.keys(restoredScores).length > 0) {
                    // Apply scores by merging with local state (so we don't wipe progress if DB failed to save previously)
                    useUserStore.setState((state) => ({
                        levelScores: { ...state.levelScores, ...restoredScores }
                    }));
                    // Force-mark levels as completed in the levels array directly
                    useUserStore.setState((state) => ({
                        levels: state.levels.map(l => {
                            const dbScore = restoredScores[l.id];
                            const localScore = state.levelScores[l.id];
                            const bestScore = Math.max(dbScore || 0, localScore || 0);

                            if (bestScore > 0) {
                                return { ...l, status: 'completed', stars: bestScore };
                            }
                            return l;
                        })
                    }));
                } else {
                    // Even if DB has nothing, ensure local levelScores are applied to levels
                    useUserStore.setState((state) => ({
                        levels: state.levels.map(l => {
                            const localScore = state.levelScores[l.id];
                            if (localScore !== undefined && localScore > 0) {
                                return { ...l, status: 'completed', stars: localScore };
                            }
                            return l;
                        })
                    }));
                }

                console.log('[Session] ✓ Force-applied', Object.keys(restoredScores).length, 'completed levels to map');

                clearTimeout(maxWait);
                setSessionStatus('found');

            } catch (err) {
                clearTimeout(maxWait);
                setSessionStatus('not_found');
            }
        };

        restoreSession();
    }, [])

    const onboardingComplete = localStorage.getItem('onboarding_done') === 'true';

    // Track level for level-up screen — persist across logins so it doesn't
    // re-trigger every time the user opens the app at level 2+
    const prevLevelRef = useRef<number>(parseInt(localStorage.getItem('aya_last_seen_level') || '1', 10));

    useEffect(() => {
        if (!profile?.level) return;
        // Only update tracking, do not show celebration overlay
        if (profile.level > prevLevelRef.current) {
            prevLevelRef.current = profile.level;
            localStorage.setItem('aya_last_seen_level', String(profile.level));
        }
    }, [profile?.level]);

    // Daily Notification Prompt Check
    const [showDailyNotifPrompt, setShowDailyNotifPrompt] = useState(false);

    useEffect(() => {
        if (sessionStatus !== 'found' || !profile) return;

        // Skip on initial onboarding / assessment steps
        if (!profile.assessmentCompleted || location.pathname.startsWith('/game/onboarding') || location.pathname.startsWith('/game/assessment')) {
            return;
        }

        // Only popup for users who have NOT added to homescreen or NOT installed it,
        // and ONLY one time in a week (7 days cooldown).
        if (!shouldShowInstallPrompt(profile)) {
            return;
        }

        // Prevent notification prompt from interrupting first-time user tutorial
        const hasCompletedTutorial = safeStorage.get('aya_game_tutorial_done') === 'true' || profile?.tutorial_completed === true;
        if (!hasCompletedTutorial) return;

        const timer = setTimeout(() => {
            if (document.querySelector('[data-tutorial-root]')) return;
            recordInstallPromptShown();
            setShowDailyNotifPrompt(true);
        }, 4000);
        return () => clearTimeout(timer);
    }, [sessionStatus, profile, location.pathname]);

    // Listener for manual install trigger from any custom action
    useEffect(() => {
        initStandaloneAutoTracking();
        const handleManualInstall = () => setShowDailyNotifPrompt(true);
        window.addEventListener('aya-prompt-install', handleManualInstall);
        return () => window.removeEventListener('aya-prompt-install', handleManualInstall);
    }, []);

    const handleAcceptDailyNotif = async () => {
        recordInstallPromptShown();
        try {
            await subscribeUserToPush(profile?.id);
        } catch (err) {
            console.warn('[DailyNotif] Subscription notice:', err);
        }
    };

    const handleDeclineDailyNotif = () => {
        recordInstallPromptShown();
        setShowDailyNotifPrompt(false);
    };

    if (sessionStatus === 'checking') {
        return <MascotLoader message="LOADING YOUR UNIVERSE..." subMessage="Syncing your timeline..." />;
    }

    if (!profile && location.pathname !== '/game/welcome' && location.pathname !== '/game/setup') {
        return <Navigate to="/signin" replace />;
    }

    if (profile && profile.assessmentCompleted && (location.pathname === '/game/welcome' || location.pathname === '/game/setup')) {
        return <Navigate to="/game" replace />;
    }

    if (profile && !profile.assessmentCompleted && !onboardingComplete && !location.pathname.startsWith('/game/onboarding')) {
        return <Navigate to="/game/onboarding/1" replace />;
    }

    if (profile && !profile.assessmentCompleted && onboardingComplete && !location.pathname.startsWith('/game/assessment')) {
        return <Navigate to="/game/assessment/1" replace />;
    }

    const isScrollableRoute =
        location.pathname.startsWith('/game/report') ||
        location.pathname === '/game/welcome' ||
        location.pathname === '/game/setup' ||
        location.pathname === '/game/dna' ||
        location.pathname === '/game/profile' ||
        location.pathname === '/game/settings' ||
        location.pathname === '/game/journal' ||
        location.pathname.startsWith('/game/admin');

    return (
        <div className={`relative w-full font-sans bg-slate-900 text-slate-100 ${isScrollableRoute
                ? 'min-h-[100dvh] overflow-y-auto overflow-x-hidden scroll-smooth'
                : 'h-[100dvh] overflow-hidden'
            }`}>
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
            />
            <Outlet />
            <NotificationPrompt
                isOpen={showDailyNotifPrompt}
                onAccept={handleAcceptDailyNotif}
                onDecline={handleDeclineDailyNotif}
            />
            {pendingStreakData && (
                <div className="absolute inset-0 z-[9999]">
                    <StreakCelebration
                        streak={pendingStreakData.newStreak}
                        xpEarned={pendingStreakData.xpEarned}
                        isMilestone={pendingStreakData.isMilestone}
                        onComplete={() => setPendingStreakData(null)}
                    />
                </div>
            )}
        </div>
    );
}
