import type { PsychometricScores } from '../types/gameTypes';

export interface GapAnalysisResult {
    maxDissonanceTrait: keyof PsychometricScores | null;
    maxDelta: number;
    dissonanceData: Record<keyof PsychometricScores, number>;
    message: string;
}

/**
 * Calculates the cognitive dissonance (gap) between a user's self-concept (onboarding)
 * and their enacted behavior (gameplay).
 * 
 * @param onboarding Initial survey scores (static)
 * @param gameplay Rolling EMA scores (dynamic)
 * @returns Structured gap analysis highlighting the biggest divergence
 */
export const calculateCognitiveDissonance = (
    onboarding: PsychometricScores,
    gameplay: PsychometricScores
): GapAnalysisResult => {
    if (!onboarding || !gameplay) {
        return {
            maxDissonanceTrait: null,
            maxDelta: 0,
            dissonanceData: { risk: 0, creativity: 0, vision: 0, empathy: 0, leadership: 0 },
            message: "Insufficient data for gap analysis."
        };
    }

    const traits: Array<keyof PsychometricScores> = ['risk', 'creativity', 'vision', 'empathy', 'leadership'];
    const dissonanceData = {} as Record<keyof PsychometricScores, number>;
    
    let maxDelta = -1;
    let maxDissonanceTrait: keyof PsychometricScores | null = null;

    traits.forEach(trait => {
        const delta = Math.abs((gameplay[trait] || 0) - (onboarding[trait] || 0));
        dissonanceData[trait] = delta;
        
        if (delta > maxDelta) {
            maxDelta = delta;
            maxDissonanceTrait = trait;
        }
    });

    let message = "Your self-perception perfectly matches your actions.";
    if (maxDissonanceTrait && maxDelta > 10) {
        const selfScore = onboarding[maxDissonanceTrait];
        const gameScore = gameplay[maxDissonanceTrait];
        const direction = gameScore > selfScore ? "higher" : "lower";
        
        message = `Cognitive Dissonance Detected: You view yourself differently in '${maxDissonanceTrait}'. Your gameplay shows a ${direction} tendency than your initial survey.`;
    }

    return {
        maxDissonanceTrait,
        maxDelta,
        dissonanceData,
        message
    };
};
