import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, Level, Lesson, PersonalityTraits, PsychologicalProfile } from '../types/gameTypes';
import { calculateLevelInfo } from '../utils/levelSystem';
import { safeStorage } from '../utils/storage';
import { supabase } from '../utils/supabase';
import { generateLevels } from '../utils/levelGenerator';

import { logJourneyEvent } from '../utils/feedbackUtils';

export type MapTheme = 'city_dark' | 'solar' | 'light';

interface UserState {
    profile: UserProfile | null;
    completedOnboarding: boolean;
    levels: Level[]; // Dynamic levels
    levelScores: Record<string, number>;
    xp: number; // Global Wisdom XP

    setProfile: (profile: UserProfile) => void;
    // Recommendation System
    sessionPreferences: Record<string, number>;
    updateSessionPreference: (tag: string, weight: number) => void;

    // New Gamified XP Setup
    addXp: (amount: number) => void;
    addSessionProgression: (sessionXp: number, skipSync?: boolean) => void;
    updateXpLocally: (amount: number) => void;
    
    syncLevels: () => Promise<void>;
    incrementDailyStoryCount: (skipSync?: boolean) => void;

    // Daily Challenge & Streak Actions
    checkStreak: () => void;
    completeDailyChallenge: (skipSync?: boolean) => { xpEarned: number, oldStreak: number, newStreak: number, isMilestone: boolean };

    /** Manually flush the current store state to the Supabase backend. */
    forceSync: () => void;

    // Personality System Actions
    updateTraits: (modifiers: Partial<PersonalityTraits>) => void;
    completeAssessment: (initialTraits: PersonalityTraits, profile: PsychologicalProfile) => void;

    // ── Theme State (3-way) ──────────────────────────────────────────────────
    mapTheme: MapTheme;
    setMapTheme: (theme: MapTheme) => void;
    cycleMapTheme: () => void;
    /** @deprecated use mapTheme === 'light' */
    isCandyMode: boolean;
    /** @deprecated use cycleMapTheme */
    toggleCandyMode: () => void;

    // Audio State
    musicVolume: number; // 0 to 1
    sfxVolume: number;   // 0 to 1
    isMusicMuted: boolean;
    isSfxMuted: boolean;
    isNarrationMuted: boolean;

    setMusicVolume: (vol: number) => void;
    setSfxVolume: (vol: number) => void;
    toggleMusicMute: () => void;
    toggleSfxMute: () => void;
    toggleNarrationMute: () => void;

    // Lesson Journal State
    collectedLessons: Lesson[];
    collectLesson: (lesson: Lesson) => void;

    // Language State
    appLanguage: 'en' | 'hi';
    setAppLanguage: (lang: 'en' | 'hi') => void;

    // Cinematic Intro State
    isIntroVideoCompleted: boolean;
    setIntroVideoCompleted: (val: boolean) => void;

    // Interaction State
    hasInteracted: boolean;
    setHasInteracted: (val: boolean) => void;

    // Solar Load Tracking
    hasSolarLoadedThisSession: boolean;
    setSolarLoadedThisSession: (val: boolean) => void;

    // Cross-route communication state
    activeLevel: string | null;
    setActiveLevel: (levelId: string | null) => void;
    pendingStreakData: { xpEarned: number, oldStreak: number, newStreak: number, isMilestone: boolean } | null;
    setPendingStreakData: (data: { xpEarned: number, oldStreak: number, newStreak: number, isMilestone: boolean } | null) => void;

    resetProgress: () => void;
    clearUserData: () => void;

    // Subscription Modal State
    showSubscriptionModal: boolean;
    setShowSubscriptionModal: (show: boolean) => void;

    // Check-in State
    checkinData: import('../types/ayaTypes').CheckInData | null;
    setCheckinData: (data: import('../types/ayaTypes').CheckInData | null) => void;
    activeSituationFilter: string | null;
    setActiveSituationFilter: (filter: string | null) => void;
    clearSituationFilter: () => void;
    
    browseAge: number | null;
    setBrowseAge: (age: number | null) => void;
    
    completeLevel: (levelId: string, stars: number, skipSync?: boolean) => void;
    unlockLevel: (levelId: string) => void;
}
const syncStoreToBackend = async (profile: any, currentLevelScores: Record<string, number>) => {
    if (!profile || !profile.id || profile.id.startsWith('offline-')) return;
    try {
        const { error: userError } = await supabase.from('users').update({
            total_xp: profile.total_xp,
            level: profile.level,
            stories_completed: profile.stories_completed,
            current_streak: profile.current_streak,
            longest_streak: profile.longest_streak,
            last_active_date: profile.last_active_date,
            daily_challenge_completed: profile.daily_challenge_completed,
            level_scores: currentLevelScores,
            onboarding_scores: profile.onboarding_scores,
            gameplay_scores: profile.gameplay_scores,
            story_count: profile.story_count,
            tutorial_completed: profile.tutorial_completed,
            topic_survey_completed: profile.topic_survey_completed,
            music_volume: profile.music_volume,
            sfx_volume: profile.sfx_volume,
            is_music_muted: profile.is_music_muted,
            is_sfx_muted: profile.is_sfx_muted,
            daily_free_stories: profile.daily_free_stories,
            last_story_date: profile.last_story_date,
        }).eq('id', profile.id);

        if (userError) {
            console.error('[Store] Supabase users update error:', userError);
            // Fallback: Try updating without level_scores and new columns in case they haven't been created yet
            const { error: fallbackError } = await supabase.from('users').update({
                total_xp: profile.total_xp,
                level: profile.level,
                stories_completed: profile.stories_completed,
                current_streak: profile.current_streak,
                longest_streak: profile.longest_streak,
                last_active_date: profile.last_active_date,
                daily_challenge_completed: profile.daily_challenge_completed,
            }).eq('id', profile.id);
            if (fallbackError) {
                 console.error('[Store] Fallback users update also failed:', fallbackError);
            } else {
                 console.log('[Store] ✓ Successfully saved profile to backend (fallback, without new columns)');
            }
        } else {
            console.log('[Store] ✓ Successfully saved profile to backend');
        }

        if (profile.traits) {
            const riskVal = Math.round(profile.traits.risk ?? 50);
            const creativeVal = Math.round(profile.traits.creativity ?? 50);
            const analyticalVal = Math.round(profile.traits.vision ?? profile.traits.analytical ?? 50);
            const socialVal = Math.round(profile.traits.empathy ?? profile.traits.social ?? 50);
            const ambitiousVal = Math.round(profile.traits.leadership ?? profile.traits.ambitious ?? 50);

            const ppPayload = {
                user_id: profile.id,
                total_xp: profile.total_xp || 0,
                level: profile.level || 1,
                stories_completed: profile.stories_completed || 0,
                trait_risk_taker: riskVal,
                trait_creative: creativeVal,
                trait_analytical: analyticalVal,
                trait_social: socialVal,
                trait_ambitious: ambitiousVal,
                last_updated: new Date().toISOString()
            };

            const { error: traitError } = await supabase
                .from('personality_profiles')
                .upsert(ppPayload, { onConflict: 'user_id' });

            if (traitError) {
                console.warn('[Store] Supabase traits upsert failed, trying update:', traitError);
                await supabase.from('personality_profiles').update(ppPayload).eq('user_id', profile.id);
            }

            // High-reliability backend audit log for DNA telemetry
            logJourneyEvent(profile.id, 'dna_module', 'dna_sync', {
                traits: profile.traits,
                total_xp: profile.total_xp,
                level: profile.level,
                stories_completed: profile.stories_completed,
                synced_at: new Date().toISOString()
            }).catch(() => {});
        }
    } catch (err) {
        console.error('[Store] Failed to sync to backend', err);
    }
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            profile: null,
            completedOnboarding: false,
            levels: generateLevels(18),
            levelScores: {},
            xp: 0, // Legacy fallback. New stats live on profile
            showSubscriptionModal: false,

            setShowSubscriptionModal: (show) => set({ showSubscriptionModal: show }),

            addXp: (amount) => set((state) => ({ xp: state.xp + amount })),

            addSessionProgression: (sessionXp, skipSync = false) => {
                set((state) => {
                    if (!state.profile) return state;

                    const currentXp = state.profile.total_xp || 0;
                    const newXp = currentXp + sessionXp;
                    const levelInfo = calculateLevelInfo(newXp);
                    const currentStories = state.profile.stories_completed || 0;

                    return {
                        profile: {
                            ...state.profile,
                            total_xp: newXp,
                            level: levelInfo.level,
                            stories_completed: currentStories + 1
                        }
                    };
                });
                if (!skipSync) {
                    const { profile, levelScores } = get();
                    if (profile) syncStoreToBackend(profile, levelScores);
                }
            },

            incrementDailyStoryCount: (skipSync = false) => {
                set((state) => {
                    if (!state.profile) return state;
                    const today = new Date().toISOString().split('T')[0];
                    let newCount = 1;
                    if (state.profile.last_story_date === today) {
                        newCount = (state.profile.daily_free_stories || 0) + 1;
                    }
                    return {
                        profile: {
                            ...state.profile,
                            last_story_date: today,
                            daily_free_stories: newCount
                        }
                    };
                });
                if (!skipSync) {
                    const { profile, levelScores } = get();
                    if (profile) syncStoreToBackend(profile, levelScores);
                }
            },


            updateXpLocally: (amount) => {
                set((state) => {
                    if (!state.profile) return state;
                    const newXp = (state.profile.total_xp || 0) + amount;
                    const levelInfo = calculateLevelInfo(newXp);
                    return {
                        profile: {
                            ...state.profile,
                            total_xp: newXp,
                            level: levelInfo.level
                        }
                    };
                });
                const { profile, levelScores } = get();
                if (profile) syncStoreToBackend(profile, levelScores);
            },

            // ── Theme (2-way: city_dark | light) ─────────────────────────────
            // 'solar' is preserved in the type but hidden from UI until re-enabled.
            // On app load, any stored 'solar' value is silently reset to 'city_dark'.
            mapTheme: (() => {
                const stored = safeStorage.get('aya_map_theme') as MapTheme | null;
                if (!stored || stored === 'solar') {
                    safeStorage.set('aya_map_theme', 'city_dark');
                    return 'city_dark';
                }
                return stored;
            })(),
            setMapTheme: (theme) => {
                // Guard: if someone tries to set solar programmatically, silently redirect to city_dark
                const safeTheme: MapTheme = theme === 'solar' ? 'city_dark' : theme;
                safeStorage.set('aya_map_theme', safeTheme);
                set({ mapTheme: safeTheme });
            },
            cycleMapTheme: () => set((state) => {
                const order: MapTheme[] = ['city_dark', 'light']; // solar removed from cycle
                const safeCurrentIndex = order.indexOf(state.mapTheme) === -1 ? 0 : order.indexOf(state.mapTheme);
                const next = order[(safeCurrentIndex + 1) % order.length];
                safeStorage.set('aya_map_theme', next);
                return { mapTheme: next };
            }),
            // Deprecated shims — kept for backward compatibility
            get isCandyMode(): boolean { return ((get() || {}).mapTheme === 'light'); },
            toggleCandyMode: () => set((state) => {
                const order: MapTheme[] = ['city_dark', 'light']; // solar removed
                const safeCurrentIndex = order.indexOf(state.mapTheme) === -1 ? 0 : order.indexOf(state.mapTheme);
                const next = order[(safeCurrentIndex + 1) % order.length];
                safeStorage.set('aya_map_theme', next);
                return { mapTheme: next };
            }),

            // Audio Defaults
            musicVolume: 0.5,
            sfxVolume: 0.5,
            isMusicMuted: false,
            isSfxMuted: false,
            isNarrationMuted: false,

            setMusicVolume: (vol) => {
                set((state) => ({
                    musicVolume: vol,
                    profile: state.profile ? { ...state.profile, music_volume: vol } : null
                }));
                const pid = get().profile?.id;
                if (pid && !pid.startsWith('offline-')) {
                    supabase.from('users').update({ music_volume: vol }).eq('id', pid).catch(() => {});
                }
            },
            setSfxVolume: (vol) => {
                set((state) => ({
                    sfxVolume: vol,
                    profile: state.profile ? { ...state.profile, sfx_volume: vol } : null
                }));
                const pid = get().profile?.id;
                if (pid && !pid.startsWith('offline-')) {
                    supabase.from('users').update({ sfx_volume: vol }).eq('id', pid).catch(() => {});
                }
            },
            toggleMusicMute: () => {
                set((state) => {
                    const next = !state.isMusicMuted;
                    const pid = state.profile?.id;
                    if (pid && !pid.startsWith('offline-')) {
                        supabase.from('users').update({ is_music_muted: next }).eq('id', pid).catch(() => {});
                    }
                    return {
                        isMusicMuted: next,
                        profile: state.profile ? { ...state.profile, is_music_muted: next } : null
                    };
                });
            },
            toggleSfxMute: () => {
                set((state) => {
                    const next = !state.isSfxMuted;
                    const pid = state.profile?.id;
                    if (pid && !pid.startsWith('offline-')) {
                        supabase.from('users').update({ is_sfx_muted: next }).eq('id', pid).catch(() => {});
                    }
                    return {
                        isSfxMuted: next,
                        profile: state.profile ? { ...state.profile, is_sfx_muted: next } : null
                    };
                });
            },
            toggleNarrationMute: () => set((state) => ({ isNarrationMuted: !state.isNarrationMuted })),

            collectedLessons: [],
            collectLesson: (lesson) => set((state) => {
                // Prevent duplicates
                if (state.collectedLessons.some(l => l.id === lesson.id)) return state;
                return { collectedLessons: [...state.collectedLessons, lesson] };
            }),

            appLanguage: 'en',
            setAppLanguage: (lang) => set({ appLanguage: lang }),

            isIntroVideoCompleted: false,
            setIntroVideoCompleted: (val) => set({ isIntroVideoCompleted: val }),

            hasInteracted: false,
            setHasInteracted: (val) => set({ hasInteracted: val }),

            hasSolarLoadedThisSession: false,
            setSolarLoadedThisSession: (val) => set({ hasSolarLoadedThisSession: val }),

            activeLevel: null,
            setActiveLevel: (levelId) => set({ activeLevel: levelId }),
            
            pendingStreakData: null,
            setPendingStreakData: (data) => set({ pendingStreakData: data }),

            checkinData: null,
            setCheckinData: (data) => set({ checkinData: data }),

            activeSituationFilter: null,
            setActiveSituationFilter: (filter) => set({ activeSituationFilter: filter }),
            clearSituationFilter: () => set({ activeSituationFilter: null, checkinData: null }),
            
            browseAge: null,
            setBrowseAge: (age) => set({ browseAge: age }),

            sessionPreferences: {},
            updateSessionPreference: (tag, weight) => set((state) => {
                const current = state.sessionPreferences[tag] || 0;
                return { sessionPreferences: { ...state.sessionPreferences, [tag]: current + weight } };
            }),

            setProfile: (profile) => {
                console.log('[Store] Setting profile:', profile);
                set({ profile: { ...get().profile, ...profile } as UserProfile, completedOnboarding: true });
                // If it's a completely new profile and we have an ID, do a backend sync
                // The caller (e.g. restoreSession in GameRoot) must call it explicitly
                // so scores can be applied AFTER levels are loaded.
            },

            syncLevels: async () => {
                const { data, error } = await supabase.from('levels').select('*');
                if (error || !data || data.length === 0) {
                    console.warn('[Store] Failed to fetch levels from Supabase or table empty. Using local fallback.');
                    try {
                        const { generateLevels } = await import('../utils/levelGenerator');
                        const ageToUse = get().profile?.age || 18;
                        const fallbackLevels = generateLevels(ageToUse);
                        set({ levels: fallbackLevels });
                        console.log('[Store] Fallback levels generated:', fallbackLevels.length);
                    } catch (err) {
                        console.error("Failed to load local fallback levels", err);
                    }
                    return;
                }

                const latestMasterLevels: Level[] = data.map((row: any) => ({
                    id: row.id,
                    day_number: row.day_number,
                    title: row.title,
                    description: row.description,
                    personality: row.personality,
                    requiredStars: row.required_stars,
                    year: row.year,
                    age: row.age,
                    theme: row.theme,
                    archetype: row.archetype,
                    bio: row.bio,
                    fame: row.fame,
                    achievements: row.achievements,
                    lesson: row.lesson,
                    avatarUrl: row.avatar_url,
                    scenarioId: row.scenario_id,
                    idolTraits: row.idol_traits,
                    status: row.status,
                    isLocked: row.is_locked,
                    stars: row.stars,
                    part1: row.part1,
                    part2: row.part2,
                    placeholder: row.placeholder
                }));

                // Get local levels to merge
                let localLevels: Level[] = [];
                try {
                    const { generateLevels } = await import('../utils/levelGenerator');
                    const profileAge = get().profile?.age || 18;
                    localLevels = generateLevels(profileAge);
                } catch (e) {
                    console.error('[Store] Failed to generate local levels during sync:', e);
                }

                set((state) => {
                    const currentScores = state.levelScores;
                    
                    // Create a map of database levels by ID
                    const dbLevelsMap = new Map(latestMasterLevels.map(l => [l.id, l]));
                    
                    // For all local levels, if they exist in DB, use DB info (overwriting local). 
                    // Otherwise, keep the local level.
                    const mergedLevels = localLevels.map(localLevel => {
                        const dbLevel = dbLevelsMap.get(localLevel.id);
                        const score = currentScores[localLevel.id];
                        const activeLevel = dbLevel ? { ...localLevel, ...dbLevel, age: localLevel.age } : localLevel;
                        
                        let computedStatus = activeLevel.status;
                        if (score !== undefined && score > 0) {
                            computedStatus = 'completed';
                        }
                        
                        return {
                            ...activeLevel,
                            status: computedStatus,
                            isLocked: activeLevel.isLocked !== undefined ? activeLevel.isLocked : false,
                            stars: score !== undefined ? score : (activeLevel.stars || 0)
                        };
                    });
                    
                    // Add any database levels that are NOT in local levels (just in case)
                    const localIds = new Set(localLevels.map(l => l.id));
                    for (const dbLevel of latestMasterLevels) {
                        if (!localIds.has(dbLevel.id)) {
                            const score = currentScores[dbLevel.id];
                            mergedLevels.push({
                                ...dbLevel,
                                status: (score !== undefined && score > 0) ? 'completed' : dbLevel.status,
                                stars: score !== undefined ? score : (dbLevel.stars || 0)
                            });
                        }
                    }

                    return { levels: mergedLevels };
                });
            },

            // Daily Challenge & Streak Logic
            checkStreak: () => {
                set((state) => {
                    if (!state.profile) return state;

                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    
                    let lastActiveStr = state.profile.last_active_date;
                    let current = state.profile.current_streak || 0;
                    let completedToday = state.profile.daily_challenge_completed || false;
                    
                    if (lastActiveStr) {
                        if (lastActiveStr === todayStr) {
                            // Same day, no change to streak length, just maintain flags
                        } else {
                            // Treat both as UTC midnights to accurately calculate day difference regardless of local time
                            const lastD = new Date(`${lastActiveStr}T00:00:00Z`);
                            const todayD = new Date(`${todayStr}T00:00:00Z`);
                            const diffTime = Math.abs(todayD.getTime() - lastD.getTime());
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays === 1) {
                                // Active yesterday, reset daily challenge flag
                                completedToday = false;
                            } else if (diffDays > 1) {
                                // Missed a day or more, streak broken!
                                current = 0;
                                completedToday = false;
                            }
                        }
                    } else {
                        completedToday = false;
                    }

                    return {
                        profile: {
                            ...state.profile,
                            current_streak: current,
                            daily_challenge_completed: completedToday
                        }
                    };
                });
                const { profile, levelScores } = get();
                if (profile) syncStoreToBackend(profile, levelScores);
            },

            completeDailyChallenge: (skipSync = false) => {
                let result = { xpEarned: 0, oldStreak: 0, newStreak: 0, isMilestone: false };
                
                set((state) => {
                    if (!state.profile || state.profile.daily_challenge_completed) return state;

                    const currentStreak = state.profile.current_streak || 0;
                    const newStreak = currentStreak + 1;
                    const longestStreak = Math.max(state.profile.longest_streak || 0, newStreak);
                    
                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    
                    console.log(`[Streak] Incremented. New streak: ${newStreak}, Date: ${todayStr}`);

                    let bonusXp = 0;
                    let milestone = false;

                    // Standard daily completion gets standard session XP usually, but let's give default 10 XP for daily
                    let baseDailyXp = 20;

                    // Award Streak Bonus XP
                    if (newStreak === 3) { bonusXp = 30; milestone = true; }
                    else if (newStreak === 7) { bonusXp = 100; milestone = true; }
                    else if (newStreak === 30) { bonusXp = 500; milestone = true; }
                    else if (newStreak > 30 && newStreak % 10 === 0) { bonusXp = 100; } // Recurring bonus

                    const totalAward = baseDailyXp + bonusXp;

                    result = {
                        xpEarned: totalAward,
                        oldStreak: currentStreak,
                        newStreak: newStreak,
                        isMilestone: milestone
                    };

                    const newTotalXp = (state.profile.total_xp || 0) + totalAward;
                    const levelInfo = calculateLevelInfo(newTotalXp);

                    return {
                        profile: {
                            ...state.profile,
                            current_streak: newStreak,
                            longest_streak: longestStreak,
                            last_active_date: todayStr,
                            daily_challenge_completed: true,
                            total_xp: newTotalXp,
                            level: levelInfo.level
                        }
                    };
                });
                if (!skipSync) {
                    const { profile, levelScores } = get();
                    if (profile) syncStoreToBackend(profile, levelScores);
                }
                return result;
            },

            // Personality Actions
            updateTraits: (modifiers) => {
                set((state) => {
                    if (!state.profile) return state;

                    const currentTraits = state.profile.traits;
                    const newTraits = { ...currentTraits };

                    // Update and Clamp values 0-100
                    (Object.keys(modifiers) as Array<keyof PersonalityTraits>).forEach((key) => {
                        const change = modifiers[key] || 0;
                        newTraits[key] = Math.max(0, Math.min(100, (newTraits[key] || 50) + change));
                    });

                    return {
                        profile: {
                            ...state.profile,
                            traits: newTraits
                        }
                    };
                });
                const { profile, levelScores } = get();
                if (profile) syncStoreToBackend(profile, levelScores);
            },

            completeAssessment: (initialTraits, profileData) => {
                set((state) => {
                    if (!state.profile) return state;
                    return {
                        profile: {
                            ...state.profile,
                            traits: initialTraits, // Keep for backward compatibility
                            onboarding_scores: {
                                risk: initialTraits.risk,
                                creativity: initialTraits.creativity,
                                vision: initialTraits.vision,
                                empathy: initialTraits.empathy,
                                leadership: initialTraits.leadership
                            },
                            gameplay_scores: {
                                risk: initialTraits.risk,
                                creativity: initialTraits.creativity,
                                vision: initialTraits.vision,
                                empathy: initialTraits.empathy,
                                leadership: initialTraits.leadership
                            },
                            psychologicalProfile: profileData,
                            assessmentCompleted: true
                        }
                    };
                });
                const { profile, levelScores } = get();
                if (profile) syncStoreToBackend(profile, levelScores);
            },

            // The original `unlockedLevels` state and its usage in `unlockLevel` were removed
            // as per the instruction's updated UserState interface and initial state.
            // If level unlocking logic is still needed, it should be re-evaluated
            // in the context of the new `levels` array.
            unlockLevel: (levelId) => set((state) => ({
                levels: state.levels.map(l =>
                    l.id === levelId ? { ...l, status: 'unlocked' } : l
                )
            })),

            completeLevel: (levelId, stars, skipSync = false) => {
                set((state) => ({
                    levelScores: { ...state.levelScores, [levelId]: Math.max(state.levelScores[levelId] || 0, stars) },
                    levels: state.levels.map(l => String(l.id) === String(levelId) ? { ...l, status: 'completed', stars: Math.max(l.stars || 0, stars) } : l)
                }));
                if (!skipSync) {
                    const { profile, levelScores } = get();
                    if (profile) syncStoreToBackend(profile, levelScores);
                }
            },

            /** Single consolidated backend flush — call once after batching all story-end updates. */
            forceSync: () => {
                const { profile, levelScores } = get();
                if (profile) syncStoreToBackend(profile, levelScores);
            },

            resetProgress: () => set({
                profile: null,
                completedOnboarding: false,
                levels: [],
                levelScores: {},
                collectedLessons: []
                // We keep 'isCandyMode' and audio settings as user preference
            }),

            clearUserData: () => set({
                profile: null,
                completedOnboarding: false,
                levels: [],
                levelScores: {},
                xp: 0,
                collectedLessons: [],
                activeLevel: null,
                pendingStreakData: null,
                hasSolarLoadedThisSession: false,
            })
        }),
        {
            name: 'aya-user-store', // renamed for consistency with boot logs
            partialize: (state) => ({
                profile: state.profile,
                completedOnboarding: state.completedOnboarding,
                levelScores: state.levelScores,
                mapTheme: state.mapTheme,
                musicVolume: state.musicVolume,
                sfxVolume: state.sfxVolume,
                isMusicMuted: state.isMusicMuted,
                isSfxMuted: state.isSfxMuted,
                collectedLessons: state.collectedLessons,
                appLanguage: state.appLanguage
            }),
            onRehydrateStorage: () => {
                console.log('[Store] Hydration starting...');
                return (rehydratedState, error) => {
                    if (error) {
                        console.error('[Store] Hydration failed:', error);
                    } else {
                        console.log('[Store] Hydration complete. Profile:', rehydratedState?.profile?.name || 'none');
                        try {
                            const master = generateLevels(rehydratedState?.profile?.age || 18);
                            const currentScores = rehydratedState?.levelScores || {};
                            const rehydratedMap = new Map((rehydratedState?.levels || []).map((l: any) => [l.id, l]));
                            const merged = master.map((ml: any) => {
                                const stored = rehydratedMap.get(ml.id);
                                const score = currentScores[ml.id];
                                return {
                                    ...ml,
                                    ...(stored || {}),
                                    age: ml.age,
                                    status: (score !== undefined && score > 0) ? 'completed' : (stored?.status || ml.status || 'unlocked'),
                                    stars: Math.max(ml.stars || 0, score || 0, stored?.stars || 0)
                                };
                            });
                            useUserStore.setState({ levels: merged });
                        } catch (e) {
                            console.error('[Store] Level merge error during hydration:', e);
                        }
                    }
                };
            },
            storage: {
                getItem: (name) => {
                    try {
                        return JSON.parse(
                            localStorage.getItem(name) || 
                            sessionStorage.getItem(name) || 
                            'null'
                        );
                    } catch { return null; }
                },
                setItem: (name, value) => {
                    try {
                        localStorage.setItem(name, JSON.stringify(value));
                        sessionStorage.setItem(name, JSON.stringify(value));
                    } catch (e) {
                        try {
                            sessionStorage.setItem(name, JSON.stringify(value));
                        } catch {}
                    }
                },
                removeItem: (name) => {
                    try { localStorage.removeItem(name); } catch {}
                    try { sessionStorage.removeItem(name); } catch {}
                }
            }
        }
    ));
