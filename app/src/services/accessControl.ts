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

// Free-tier users may play this many stories per calendar day (UTC-based date key).
export const FREE_DAILY_STORY_LIMIT = 3;

export function isAyaPlusUser(profile?: UserProfile | null): boolean {
    if (!profile) return false;
    const accessType = profile.access_type || 'free';
    return ['aya_plus', 'aya_plus_monthly', 'aya_plus_quarterly', 'aya_plus_semi_annual', 'aya_plus_six_month', 'aya_plus_annual', 'premium', 'premium_pro', 'trial', 'jee15', 'neet15', 'upsc'].includes(accessType);
}

export function getRemainingFreeStories(profile?: UserProfile | null): number {
    if (!profile) return FREE_DAILY_STORY_LIMIT;
    if (isAyaPlusUser(profile)) return 999;

    const today = new Date().toISOString().split('T')[0];
    if (profile.last_story_date === today) {
        return Math.max(0, FREE_DAILY_STORY_LIMIT - (profile.daily_free_stories || 0));
    }
    return FREE_DAILY_STORY_LIMIT;
}

export function canPlayStory(profile: UserProfile | null, isStoryPremium: boolean = false): { allowed: boolean, reason?: 'limit_reached' | 'premium_only' } {
    if (isAyaPlusUser(profile)) return { allowed: true };
    
    if (isStoryPremium) return { allowed: false, reason: 'premium_only' };
    
    const remaining = getRemainingFreeStories(profile);
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
