/**
 * accessControl.ts
 *
 * Client-side access control and feature gating helpers for AYA+ and Freemium monetization.
 *
 * NOTE: Server-side API endpoints (/api/check-access and /api/recommend-stories) remain
 * the authoritative source of truth for subscription access.
 *
 * Phase 5: Freemium + AYA+ + Premium Report + Production Hardening
 */

import { PRICING_CONFIG } from '../config/recommendationConfig';
import type { UserProfile } from '../types/gameTypes';
import { useUserStore } from '../store/userStore';

// Free-tier users may play a maximum of 3 stories in their entire lifetime.
export const FREE_LIFETIME_STORY_LIMIT = 3;
export const FREE_DAILY_STORY_LIMIT = 3; // Kept for backwards compatibility with imports, but used as lifetime limit.

export function isAyaPlusUser(profile?: UserProfile | null): boolean {
    const activeProfile = profile || useUserStore.getState().profile;
    if (!activeProfile) return false;
    const accessType = activeProfile.access_type || 'free';
    // Strict paid tiers only — 'trial' removed completely
    return ['aya_plus', 'aya_plus_monthly', 'aya_plus_quarterly', 'aya_plus_semi_annual', 'aya_plus_six_month', 'aya_plus_annual', 'premium', 'premium_pro', 'jee15', 'neet15', 'upsc'].includes(accessType);
}

export function getCompletedStoriesCount(profile?: UserProfile | null): number {
    const storeState = useUserStore.getState();
    const activeProfile = profile || storeState.profile;

    // 1. Check profile counters
    const profileCompleted = Math.max(
        activeProfile?.stories_completed || 0,
        activeProfile?.story_count || 0
    );

    // 2. Check levelScores from local Zustand store
    const levelScores = storeState.levelScores || {};
    const scoreCompleted = Object.values(levelScores).filter((s) => (Number(s) || 0) > 0).length;

    // 3. Check levels array for completed status
    const levelsCompleted = (storeState.levels || []).filter((l) => l.status === 'completed').length;

    return Math.max(profileCompleted, scoreCompleted, levelsCompleted);
}

export function getRemainingFreeStories(profile?: UserProfile | null): number {
    const storeState = useUserStore.getState();
    const activeProfile = profile || storeState.profile;
    if (isAyaPlusUser(activeProfile)) return 999;

    // AYA uses a strict lifetime limit of 3 stories for free users.
    const completed = getCompletedStoriesCount(activeProfile);
    return Math.max(0, FREE_LIFETIME_STORY_LIMIT - completed);
}

export function canPlayStory(profile: UserProfile | null, isStoryPremium: boolean = false): { allowed: boolean, reason?: 'limit_reached' | 'premium_only' } {
    const storeState = useUserStore.getState();
    const activeProfile = profile || storeState.profile;

    if (isAyaPlusUser(activeProfile)) return { allowed: true };
    
    if (isStoryPremium) return { allowed: false, reason: 'premium_only' };
    
    const remaining = getRemainingFreeStories(activeProfile);
    if (remaining <= 0) return { allowed: false, reason: 'limit_reached' };
    
    return { allowed: true };
}

export function canAccessStory(profile: UserProfile | null, isStoryPremium: boolean): boolean {
    return canPlayStory(profile, isStoryPremium).allowed;
}

export function getSubscriptionPlanDetails() {
    const sixMonthPlan = {
        id: 'aya_plus_semi_annual',
        name: 'AYA PRO 6 Months',
        amount: PRICING_CONFIG.six_month_price_inr || 1999,
        originalAmount: PRICING_CONFIG.six_month_original_inr || 14999,
        interval: '6 months',
        monthlyEquiv: `₹${Math.round((PRICING_CONFIG.six_month_price_inr || 1999) / 6)}/mo`,
        currency: PRICING_CONFIG.currency_symbol,
        savingsLabel: 'Save 87%'
    };

    return {
        monthly: {
            id: 'aya_plus_monthly',
            name: 'AYA PRO 1 Month',
            amount: PRICING_CONFIG.monthly_price_inr,
            originalAmount: PRICING_CONFIG.monthly_original_inr,
            interval: 'month',
            currency: PRICING_CONFIG.currency_symbol,
            savingsLabel: 'Save 34%'
        },
        sixMonths: sixMonthPlan,
        threeMonths: sixMonthPlan, // alias for backwards compatibility
        annual: {
            id: 'aya_plus_annual',
            name: 'AYA PRO 1 Year (12 Months)',
            amount: PRICING_CONFIG.annual_price_inr,
            originalAmount: PRICING_CONFIG.annual_original_inr,
            interval: '12 months',
            monthlyEquiv: `₹${Math.round(PRICING_CONFIG.annual_price_inr / 12)}/mo`,
            currency: PRICING_CONFIG.currency_symbol,
            savingsLabel: 'Best Value · Save 88%'
        },
        dnaReport: {
            id: 'aya_dna_career_report',
            name: 'Full AYA DNA + Aligned Directions Report',
            amount: PRICING_CONFIG.report_price_min_inr,
            currency: PRICING_CONFIG.currency_symbol,
            type: 'one_time'
        }
    };
}
