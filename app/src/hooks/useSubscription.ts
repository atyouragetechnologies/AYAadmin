import { useState, useEffect, useCallback } from 'react';
import { getUserProfile } from '../lib/firestore';
import { auth } from '../lib/firebase';
import { useUserStore } from '../store/userStore';

export const useSubscription = () => {
    const profile = useUserStore((state) => state.profile);
    const [isPaid, setIsPaid] = useState<boolean>(false);
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [isTrialActive, setIsTrialActive] = useState<boolean>(false);
    const [hasTrialAvailable, setHasTrialAvailable] = useState<boolean>(false);
    const [trialUsed, setTrialUsed] = useState<boolean>(false);
    const [trialStartDate] = useState<string | null>(null);
    const [trialEndDate] = useState<string | null>(null);
    const [formattedEndDate] = useState<string>('');
    const [daysRemaining] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const updateTrialStateFromDates = useCallback((_startStr?: string | null, _endStr?: string | null, _isUsed: boolean = false, accessType?: string | null) => {
        const paid = Boolean(
            accessType &&
            ['aya_plus', 'aya_plus_monthly', 'aya_plus_quarterly', 'aya_plus_semi_annual', 'aya_plus_six_month', 'aya_plus_annual', 'premium', 'premium_pro', 'jee15', 'neet15', 'upsc'].includes(accessType)
        );
        setIsPaid(paid);
        setIsPremium(paid);
        setIsTrialActive(false);
        setHasTrialAvailable(false);
        setTrialUsed(true);
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
        console.warn('Trials are disabled.');
        return false;
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
