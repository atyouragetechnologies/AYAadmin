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

export function isAyaPlusUser(profile?: UserProfile | null): boolean {
    if (!profile) return false;
    const accessType = profile.access_type || 'free';
    return ['aya_plus', 'aya_plus_monthly', 'aya_plus_quarterly', 'aya_plus_annual', 'premium', 'premium_pro', 'trial', 'jee15', 'neet15', 'upsc'].includes(accessType);
}

export function getRemainingFreeStories(profile?: UserProfile | null): number {
    if (!profile) return 3;
    if (isAyaPlusUser(profile)) return 999;
    
    const today = new Date().toISOString().split('T')[0];
    if (profile.last_story_date === today) {
        return Math.max(0, 3 - (profile.daily_free_stories || 0));
    }
    return 3;
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
        threeMonths: {
            id: 'aya_plus_quarterly',
            name: 'AYA PRO 3 Months',
            amount: PRICING_CONFIG.three_month_price_inr,
            originalAmount: PRICING_CONFIG.three_month_original_inr,
            interval: '3 months',
            monthlyEquiv: `₹${Math.round(PRICING_CONFIG.three_month_price_inr / 3)}/mo`,
            currency: PRICING_CONFIG.currency_symbol,
            savingsLabel: 'Save 20%'
        },
        annual: {
            id: 'aya_plus_annual',
            name: 'AYA PRO 1 Year',
            amount: PRICING_CONFIG.annual_price_inr,
            originalAmount: PRICING_CONFIG.annual_original_inr,
            interval: 'year',
            monthlyEquiv: `₹${Math.round(PRICING_CONFIG.annual_price_inr / 12)}/mo`,
            currency: PRICING_CONFIG.currency_symbol,
            savingsLabel: 'Best Value · Save 20%'
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
