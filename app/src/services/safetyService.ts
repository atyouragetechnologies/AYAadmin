/**
 * safetyService.ts
 *
 * Real-time Acute Distress & Crisis Safety Filter.
 * Evaluates user input from Problem Check-ins, Reflections, and Search queries.
 *
 * If severe distress or self-harm/crisis markers are detected, AYA immediately
 * routes the user to compassionate human care resources rather than offering
 * gamified historical stories as therapy.
 */

import type { SafetyAssessment } from '../types/gameTypes';

// High-priority crisis regex patterns
const CRISIS_PATTERNS = [
    /\b(kill\s*(myself|me))\b/i,
    /\b(suicid(e|al|ing))\b/i,
    /\b(end\s*(my\s*life|it\s*all))\b/i,
    /\b(want\s*to\s*die)\b/i,
    /\b(self[\s-]*harm)\b/i,
    /\b(hurt\s*myself)\b/i,
    /\b(no\s*reason\s*to\s*live)\b/i,
    /\b(cannot\s*go\s*on\s*living)\b/i,
    /\b(better\s*off\s*dead)\b/i,
];

const GLOBAL_HELPLINES = [
    {
        country: 'India',
        name: 'Tele-MANAS (Govt of India 24/7)',
        contact: '14416 / 1800-891-4416',
        url: 'https://telemanas.mohfw.gov.in',
    },
    {
        country: 'India',
        name: 'Vandrevala Foundation Helpline',
        contact: '+91 9999 666 555',
        url: 'https://www.vandrevalafoundation.com',
    },
    {
        country: 'United States & Canada',
        name: 'Suicide & Crisis Lifeline',
        contact: '988 (Call or Text)',
        url: 'https://988lifeline.org',
    },
    {
        country: 'United Kingdom',
        name: 'Samaritans (24/7 Free)',
        contact: '116 123',
        url: 'https://www.samaritans.org',
    },
    {
        country: 'International',
        name: 'Befrienders Worldwide / Find A Helpline',
        contact: 'Free, confidential support worldwide',
        url: 'https://findahelpline.com',
    },
];

export const safetyService = {
    /**
     * Evaluates a text string for crisis markers.
     */
    evaluateText(text: string): SafetyAssessment {
        if (!text || typeof text !== 'string') {
            return { isCrisis: false, severity: 'none', matchedKeywords: [] };
        }

        const trimmed = text.trim();
        const matchedKeywords: string[] = [];

        for (const pattern of CRISIS_PATTERNS) {
            const match = trimmed.match(pattern);
            if (match) {
                matchedKeywords.push(match[0]);
            }
        }

        if (matchedKeywords.length > 0) {
            return {
                isCrisis: true,
                severity: 'high',
                matchedKeywords,
                supportMessage:
                    "It sounds like you're carrying something extraordinarily heavy right now. AYA is a self-discovery and growth game, not crisis support or clinical care. Please connect with someone who can listen and support you safely right now.",
                helplines: GLOBAL_HELPLINES,
            };
        }

        return {
            isCrisis: false,
            severity: 'none',
            matchedKeywords: [],
        };
    },

    /**
     * Returns the verified list of support helplines.
     */
    getHelplines() {
        return GLOBAL_HELPLINES;
    },
};
