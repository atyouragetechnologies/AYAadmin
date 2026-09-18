import { useState, useEffect, useCallback } from 'react';
import { getUserProfile, upsertUserProfile } from '../lib/firestore';
import { auth } from '../lib/firebase';
import { useUserStore } from '../store/userStore';

export const useSubscription = () => {
    const profile = useUserStore((state) => state.profile);
    const [isPaid, setIsPaid] = useState<boolean>(false);
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [isTrialActive, setIsTrialActive] = useState<boolean>(false);
    const [hasTrialAvailable, setHasTrialAvailable] = useState<boolean>(false);
    const [trialUsed, setTrialUsed] = useState<boolean>(false);
    const [trialStartDate, setTrialStartDate] = useState<string | null>(null);
    const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
    const [formattedEndDate, setFormattedEndDate] = useState<string>('');
    const [daysRemaining, setDaysRemaining] = useState<number>(7);
    const [loading, setLoading] = useState<boolean>(true);

    const updateTrialStateFromDates = useCallback((startStr?: string | null, endStr?: string | null, isUsed: boolean = false, accessType?: string | null) => {
        const paid = Boolean(
            accessType &&
            ['aya_plus', 'aya_plus_monthly', 'aya_plus_quarterly', 'aya_plus_annual', 'premium', 'premium_pro', 'jee15', 'neet15', 'upsc'].includes(accessType)
        );
        setIsPaid(paid);

        if (paid) {
            setIsPremium(true);
            setIsTrialActive(false);
            setHasTrialAvailable(false);
            setTrialUsed(true);
            return;
        }

        if (startStr) {
            const startDate = new Date(startStr);
            const endDate = endStr ? new Date(endStr) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            const now = new Date();
            const active = now < endDate;
            const diffMs = endDate.getTime() - now.getTime();
            const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

            const formatted = endDate.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            setTrialStartDate(startDate.toISOString());
            setTrialEndDate(endDate.toISOString());
            setFormattedEndDate(formatted);
            setDaysRemaining(days);
            setIsTrialActive(active);
            setTrialUsed(true);
            setHasTrialAvailable(false);
            setIsPremium(active);
        } else if (isUsed) {
            setIsTrialActive(false);
            setTrialUsed(true);
            setHasTrialAvailable(false);
            setIsPremium(false);
            setDaysRemaining(0);
        } else {
            setIsTrialActive(false);
            setTrialUsed(false);
            setHasTrialAvailable(true);
            setIsPremium(false);
            setDaysRemaining(7);
        }
    }, []);

    const checkTrialStatus = async () => {
        const localStart = profile?.trial_start_date || null;
        const localEnd = profile?.trial_end_date || null;
        const localUsed = !!profile?.trial_used;
        const accessType = profile?.access_type || null;

        const uid = auth.currentUser?.uid || profile?.id;
        if (!uid || uid.startsWith('offline-')) {
            updateTrialStateFromDates(localStart, localEnd, localUsed, accessType);
            setLoading(false);
            return;
        }

        try {
            const data = await getUserProfile(uid);
            if (data) {
                updateTrialStateFromDates(
                    (data as any).trialStartDate ?? localStart,
                    (data as any).trialEndDate ?? localEnd,
                    !!(data as any).trialUsed,
                    (data as any).accessType ?? accessType
                );
            } else {
                updateTrialStateFromDates(localStart, localEnd, localUsed, accessType);
            }
        } catch (err) {
            console.error('Error checking trial status from Firestore:', err);
            updateTrialStateFromDates(localStart, localEnd, localUsed, accessType);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkTrialStatus();
    }, [profile?.id, profile?.trial_start_date, profile?.trial_end_date, profile?.trial_used, profile?.access_type, updateTrialStateFromDates]);

    const activateTrial = async (): Promise<boolean> => {
        const now = new Date();
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const startIso = now.toISOString();
        const endIso = endDate.toISOString();

        const uid = auth.currentUser?.uid || profile?.id;
        if (uid && !uid.startsWith('offline-')) {
            try {
                await upsertUserProfile(uid, {
                    trialUsed: true,
                    trialStartDate: startIso,
                    trialEndDate: endIso,
                    accessType: 'trial',
                });
            } catch (err) {
                console.error('Error activating trial in Firestore:', err);
            }
        }

        // Update Zustand store
        const currentProfile = useUserStore.getState().profile;
        if (currentProfile) {
            useUserStore.getState().setProfile({
                ...currentProfile,
                trial_used: true,
                trial_start_date: startIso,
                trial_end_date: endIso,
                access_type: currentProfile.access_type && currentProfile.access_type !== 'free' ? currentProfile.access_type : 'trial',
            });
        }

        updateTrialStateFromDates(startIso, endIso, true, 'trial');
        setIsTrialActive(true);
        setHasTrialAvailable(false);
        setTrialUsed(true);
        setIsPremium(true);

        // Telemetry
        if (uid) {
            import('../lib/firestore').then(({ logAnalyticsEvent }) => {
                logAnalyticsEvent('journey_events', {
                    userId: uid,
                    journeyId: 'app_system',
                    eventType: 'trial_activated',
                    eventData: { trialStartDate: startIso, trialEndDate: endIso },
                });
            }).catch(() => {});
        }

        return true;
    };

    return {
        isPaid,
        isPremium,
        isTrialActive,
        hasTrialAvailable,
        trialUsed,
        trialStartDate,
        trialEndDate,
        formattedEndDate,
        daysRemaining,
        loading,
        activateTrial,
        refreshTrialStatus: checkTrialStatus
    };
};
