/**
 * insightService.ts
 *
 * Dedicated service for longitudinal identity insights, behavioral dissonance,
 * and chapter evolution.
 *
 * Phase 3: Personalized User Experience + DNA Insights
 */

import { CURRENT_CHAPTERS, RECOMMENDATION_CONFIG } from '../config/recommendationConfig';
import type { DnaTrait, SurpriseInsight, CurrentChapter, EmergingYouInsight } from '../types/ayaTypes';
import type { PersonalityTraits, PsychometricScores } from '../types/gameTypes';

const TRAIT_DISPLAY_NAMES: Record<DnaTrait, string> = {
    risk: 'Risk Tolerance',
    creativity: 'Creative Instinct',
    vision: 'Vision & Systems Thinking',
    empathy: 'Empathy & Social Attunement',
    leadership: 'Decisive Leadership'
};

/**
 * Compare user's baseline self-view (onboarding) vs active gameplay decisions.
 * Returns a surprise insight if any trait has deviated significantly (>= 12 pts).
 * Language is always curiosity-driven and never shaming.
 */
export function generateSurprisedInsight(
    onboardingScores?: PsychometricScores | Record<string, number>,
    gameplayScores?: PsychometricScores | PersonalityTraits | Record<string, number>
): SurpriseInsight | null {
    if (!onboardingScores || !gameplayScores) return null;

    const traits: DnaTrait[] = ['risk', 'creativity', 'vision', 'empathy', 'leadership'];
    let maxDelta = 0;
    let selectedTrait: DnaTrait | null = null;
    let direction: 'higher' | 'lower' = 'higher';

    for (const t of traits) {
        const selfView = (onboardingScores as any)[t] ?? 50;
        const actualAction = (gameplayScores as any)[t] ?? 50;
        const delta = actualAction - selfView;

        if (Math.abs(delta) >= RECOMMENDATION_CONFIG.surprise_insight_min_delta && Math.abs(delta) > maxDelta) {
            maxDelta = Math.abs(delta);
            selectedTrait = t;
            direction = delta > 0 ? 'higher' : 'lower';
        }
    }

    if (!selectedTrait || maxDelta < RECOMMENDATION_CONFIG.surprise_insight_min_delta) {
        return null;
    }

    const traitName = TRAIT_DISPLAY_NAMES[selectedTrait];

    let headline = '';
    let detail = '';

    if (direction === 'higher') {
        headline = `You showed more ${traitName.toLowerCase()} than you initially gave yourself credit for.`;
        detail = `In your initial self-view, you rated your ${traitName} lower, but when facing real high-stakes scenario decisions, your choices consistently leaned into action.`;
    } else {
        headline = `You were more strategic and measured than your baseline suggested.`;
        detail = `While you initially viewed yourself as bolder in ${traitName.toLowerCase()}, your gameplay decisions favored calibration and careful thought when outcomes mattered.`;
    }

    return {
        showed: true,
        trait: selectedTrait,
        delta: Math.round(maxDelta),
        direction,
        headline,
        detail
    };
}

/**
 * Determine dynamic "Current Chapter" based on dominant traits and situation.
 */
export function generateCurrentChapter(
    traits: PersonalityTraits | PsychometricScores | Record<string, number>,
    situationTag?: string
): CurrentChapter {
    const risk = (traits as any).risk ?? 50;
    const creativity = (traits as any).creativity ?? 50;
    const vision = (traits as any).vision ?? 50;
    const empathy = (traits as any).empathy ?? 50;
    const leadership = (traits as any).leadership ?? 50;

    if (situationTag === 'starting_something' || (leadership > 70 && risk > 60)) {
        return CURRENT_CHAPTERS.Builder;
    }
    if (situationTag === 'failure_setback' || situationTag === 'feeling_stuck') {
        return CURRENT_CHAPTERS.Resilient;
    }
    if (creativity > 70 && vision > 65) {
        return CURRENT_CHAPTERS.Creator;
    }
    if (vision > 75) {
        return CURRENT_CHAPTERS.Visionary;
    }
    if (leadership > 75) {
        return CURRENT_CHAPTERS.Leader;
    }
    if (risk > 70) {
        return CURRENT_CHAPTERS.Challenger;
    }
    if (empathy > 70) {
        return CURRENT_CHAPTERS.Seeker;
    }

    return CURRENT_CHAPTERS.Explorer;
}

/**
 * Generate emerging trajectory trends for DNA traits.
 */
export function generateEmergingYou(
    onboardingScores?: PsychometricScores | Record<string, number>,
    gameplayScores?: PsychometricScores | PersonalityTraits | Record<string, number>
): EmergingYouInsight[] {
    if (!onboardingScores || !gameplayScores) return [];

    const traits: DnaTrait[] = ['risk', 'creativity', 'vision', 'empathy', 'leadership'];
    const insights: EmergingYouInsight[] = [];

    for (const t of traits) {
        const base = (onboardingScores as any)[t] ?? 50;
        const current = (gameplayScores as any)[t] ?? 50;
        const delta = current - base;

        let direction: 'rising' | 'falling' | 'stable' = 'stable';
        if (delta >= 4) direction = 'rising';
        else if (delta <= -4) direction = 'falling';

        insights.push({
            trait: t,
            direction,
            delta: Math.round(delta),
            // NOTE: sessions_analyzed is the configured window, not necessarily actual DB sessions played
            sessions_analyzed: RECOMMENDATION_CONFIG.emerging_you_session_count
        });
    }

    return insights;
}

/**
 * Generate career exploration recommendations (soft, non-deterministic language).
 */
export function getPotentiallyAlignedDirections(traits: PersonalityTraits | Record<string, number>): string[] {
    const risk = (traits as any).risk ?? 50;
    const creativity = (traits as any).creativity ?? 50;
    const vision = (traits as any).vision ?? 50;
    const empathy = (traits as any).empathy ?? 50;
    const leadership = (traits as any).leadership ?? 50;

    const directions = new Set<string>();

    if (creativity > 60 && vision > 60) {
        directions.add('Product Architecture & Creative Technology');
        directions.add('Brand Strategy & Conceptual Direction');
        directions.add('Immersive AR/VR Experience Design');
        directions.add('Interactive Media & Game Direction');
    }
    if (leadership > 60 && risk > 60) {
        directions.add('Venture Incubation & Early-Stage Leadership');
        directions.add('Operational Strategy in High-Pace Environments');
        directions.add('Angel Investing & Venture Capital');
        directions.add('Crisis Management & Tactical Turnaround');
        directions.add('Growth Hacking & Market Disruption');
    }
    if (empathy > 60 && leadership > 55) {
        directions.add('People & Organizational Culture Leadership');
        directions.add('Community Ecosystem Strategy');
        directions.add('Diversity, Equity & Inclusion (DEI) Directing');
        directions.add('Non-Profit Foundation Leadership');
        directions.add('Executive Coaching & Talent Architecture');
    }
    if (vision > 65 && risk < 60) {
        directions.add('Systems Research, Quantitative Policy & Strategic Foresight');
        directions.add('Intelligence Analysis & Complex Modeling');
        directions.add('Macro-Economic Forecasting');
        directions.add('Corporate Sustainability Strategy');
        directions.add('Urban Planning & Smart City Architecture');
    }
    if (creativity > 65 && empathy > 60) {
        directions.add('Human-Centered Design & UX Architecture');
        directions.add('Social Impact Innovation & Philanthropy');
        directions.add('Documentary Filmmaking & Narrative Journalism');
        directions.add('Art Therapy & Creative Rehabilitation');
        directions.add('Educational Technology & Curriculum Design');
    }
    if (risk > 70 && creativity > 65) {
        directions.add('Disruptive Tech Founder & Growth Hacking');
        directions.add('Creative Directing & Avant-Garde Media');
        directions.add('Experimental Product Research (Moonshot Projects)');
        directions.add('Independent Indie Studio Founder');
    }
    if (vision > 60 && empathy > 60) {
        directions.add('Behavioral Economics & Policy Design');
        directions.add('Organizational Psychology & Executive Coaching');
        directions.add('Public Health Strategy & Global Ethics');
        directions.add('Diplomatic Relations & Conflict Resolution');
    }
    if (leadership > 70 && vision > 65) {
        directions.add('Corporate Strategy & Turnaround Management');
        directions.add('Global Supply Chain & Logistics Leadership');
        directions.add('Chief Operating Officer (COO) Roles');
        directions.add('Large-Scale Infrastructure Directing');
    }
    if (risk < 45 && vision > 60) {
        directions.add('Data Science, Actuarial & Risk Mitigation');
        directions.add('Compliance, Governance & Cyber Security');
        directions.add('Quantitative Finance & Algorithmic Trading');
        directions.add('Quality Assurance & Aerospace Engineering');
    }
    if (creativity > 70) {
        directions.add('Original Content Creation & Narrative Design');
        directions.add('Concept Art & Worldbuilding');
        directions.add('Music Production & Sound Engineering');
        directions.add('Culinary Arts & Gastronomic Innovation');
    }
    if (empathy > 70) {
        directions.add('Clinical Therapy & Crisis Negotiation');
        directions.add('Hospice Care & Advanced Medical Empathy');
        directions.add('Special Education & Developmental Support');
        directions.add('Patient Advocacy & Healthcare Navigation');
    }
    if (leadership > 70) {
        directions.add('Public Sector Leadership & Diplomacy');
        directions.add('Political Campaign Strategy');
        directions.add('Military Tactical Leadership & Strategy');
        directions.add('Board of Directors & Corporate Governance');
    }
    if (risk > 75) {
        directions.add('Extreme Sports Professional & Stunt Direction');
        directions.add('Deep Tech Pioneer (Space, AI, BioHacking)');
        directions.add('Commodities & High-Frequency Day Trading');
        directions.add('Frontline Journalism & Investigative Reporting');
    }
    if (vision > 75) {
        directions.add('Theoretical Physics & Advanced Mathematics');
        directions.add('Climate Tech & Geo-Engineering Research');
        directions.add('Artificial Intelligence Ethics & Safety');
        directions.add('Futurist & Trend Forecasting');
    }
    const discipline = (traits as any).discipline ?? 50;
    if (discipline && discipline > 75) {
        directions.add('Elite Athletics & Olympic Training');
        directions.add('Surgical Medicine & Neurobiology');
        directions.add('Classical Music Performance');
    }

    if (directions.size === 0) {
        directions.add('Interdisciplinary Creative Strategy');
        directions.add('Emerging Technologies & Product Management');
        directions.add('Independent Consulting & Freelance Mastery');
        directions.add('Operations Management & Business Administration');
        directions.add('Digital Marketing & E-Commerce Strategy');
    }

    // Shuffle and pick top 8 dynamically aligned
    const options = Array.from(directions);
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    return options.slice(0, 8);
}
