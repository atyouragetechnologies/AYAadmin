import type { PsychologicalProfile, PersonalityTraits } from '../types/gameTypes';
import { IDOL_MINDSETS } from '../data/idolMindsets';

export const PersonalityAnalysisEngine = {
    // 1. Generate Deep Reasoning
    generateReasoning: (profile: PsychologicalProfile, dominantTrait: string, idolName: string) => {
        const motivationMap: Record<string, string> = {
            'Impact': "a deep desire to change the world around you",
            'Stability': "a pragmatic need for security and foundation",
            'Fame': "a drive for recognition and influence",
            'Freedom': "an unquenchable thirst for autonomy"
        };
        const riskMap: Record<string, string> = {
            'Bold': "you leap before you look, trusting your instincts",
            'Balanced': "you weigh the odds carefully but act decisively",
            'Cautious': "you prefer to mitigate downsides before moving",
            'Calculated': "you treat life like a chess game"
        };
        const emotionalMap: Record<string, string> = {
            'Sensitive': "you feel the weight of every decision",
            'Resilient': "you convert setbacks into fuel entirely",
            'Analytical': "you detach and solve problems with cold logic",
            'Avoidant': "you prefer to keep moving rather than dwelling"
        };

        const mText = motivationMap[profile.motivation] || "a unique drive";
        const rText = riskMap[profile.risk] || "a balanced approach to risk";
        const eText = emotionalMap[profile.emotional] || "a resilient nature";

        return `Your match with ${idolName} isn't just about surface traits. It's because you are driven by ${mText}. Your choices reveal that ${rText}, and when the pressure mounts, ${eText}. This specific combination of ${dominantTrait} and ${profile.coreValue} creates a mindset pattern we call the "${IDOL_MINDSETS[idolName.trim()]?.archetypeTitle || 'Visionary'}".`;
    },

    // 2. Core Strengths
    getStrengths: (profile: PsychologicalProfile, topTrait: string) => {
        const strengths = [
            {
                title: topTrait.charAt(0).toUpperCase() + topTrait.slice(1) + " Dominance",
                desc: `You naturally lean into ${topTrait}, giving you an edge in situtations requiring this specific virtue.`
            }
        ];

        if (profile.risk === 'Bold') {
            strengths.push({ title: "Fearless Initiation", desc: "You don't wait for permission. You act while others are still analyzing." });
        } else if (profile.risk === 'Balanced') {
            strengths.push({ title: "Strategic Positioning", desc: "You rarely make unforced errors, preserving your resources for the right moment." });
        }

        if (profile.social === 'Leader') {
            strengths.push({ title: "Natural Command", desc: "People instinctively look to you when the path isn't clear." });
        } else if (profile.social === 'Supporter') {
            strengths.push({ title: "Emotional Glue", desc: "You see the human dynamics that others miss, keeping teams united." });
        }

        if (profile.passion === 'Intellectual') {
            strengths.push({ title: "Deep Synthesis", desc: "You can connect unrelated dots to form new, powerful ideas." });
        } else if (profile.passion === 'Creative') {
            strengths.push({ title: "Originator Mindset", desc: "You are comfortable in the blank page stage of a project." });
        }

        return strengths.slice(0, 3); // Return top 3
    },

    // 3. Blind Spots (The "Hard Truth")
    getBlindSpots: (profile: PsychologicalProfile) => {
        const spots = [];

        if (profile.risk === 'Bold') {
            spots.push({ title: "Reckless Velocity", desc: "You move so fast you sometimes break things that can't be fixed." });
        } else if (profile.risk === 'Cautious') {
            spots.push({ title: "Opportunity Paralysis", desc: "Your fear of losing what you have stops you from gaining what you could have." });
        }

        if (profile.motivation === 'Fame') {
            spots.push({ title: "Validation Trap", desc: "You may be too dependent on external applause to feel worthy." });
        } else if (profile.motivation === 'Stability') {
            spots.push({ title: "Comfort Cage", desc: "You prioritize safety so much that you may never realize your true potential." });
        }

        if (profile.emotional === 'Analytical') {
            spots.push({ title: "Emotional Blindness", desc: "You can solve the logic but miss the human heart of the problem." });
        } else if (profile.emotional === 'Sensitive') {
            spots.push({ title: "Burnout Risk", desc: "You absorb too much signal, which can lead to rapid emotional exhaustion." });
        }

        return spots.slice(0, 2);
    },

    // 4. Legendary Comparison
    getComparison: (userProfile: PsychologicalProfile, idolName: string) => {
        const cleanName = (idolName || "Default").trim();
        const idolData = IDOL_MINDSETS[cleanName] || IDOL_MINDSETS["Default"];
        if (!idolData.profile) return null;

        const matches: string[] = [];
        const diffs: string[] = [];

        (Object.keys(userProfile) as Array<keyof PsychologicalProfile>).forEach(k => {
            if ((userProfile as any)[k] === (idolData.profile as any)[k]) matches.push(k);
            else diffs.push(k);
        });

        // Construct narrative
        const sharedValue = matches.includes('coreValue') ? userProfile.coreValue : (matches[0] || 'Vision');
        const diffTrait = diffs[0] || 'Style';

        const idolVal = diffTrait !== 'Style' ? (idolData.profile as any)[diffTrait] : 'different';
        const userVal = diffTrait !== 'Style' ? (userProfile as any)[diffTrait] : 'unique';

        return {
            title: `Like ${idolName.split(' ')[0]}, you value ${sharedValue}.`,
            desc: `You both operate with a core belief in ${sharedValue}. However, where ${idolName} tends to be ${idolVal}, you bring a more ${userVal} approach. This makes your path unique.`
        };
    },

    // 5. Emotional Identity Statement
    getIdentityStatement: (profile: PsychologicalProfile) => {
        return `Your mindset shows the potential to become a ${profile.risk.toLowerCase()} builder of ${profile.coreValue.toLowerCase()} — IF you commit to consistent action using your ${profile.passion.toLowerCase()} energy.`;
    },

    // 6. Find Best Match
    findBestMatch: (userProfile: PsychologicalProfile, userTraits: PersonalityTraits) => {
        let bestMatch = { name: "Default", score: -1 };

        Object.values(IDOL_MINDSETS).forEach(idol => {
            if (idol.name === "Default" || !idol.profile) return;

            let score = 0;
            // Profile Match (Weighted)
            if (userProfile.coreValue === idol.profile.coreValue) score += 30;
            if (userProfile.motivation === idol.profile.motivation) score += 25;
            if (userProfile.passion === idol.profile.passion) score += 15;
            if (userProfile.risk === idol.profile.risk) score += 15;

            if (score > bestMatch.score) {
                bestMatch = { name: idol.name, score };
            }
        });

        // Fallback if no specific profile match
        if (bestMatch.score === -1) return { name: "Steve Jobs", traits: { ...userTraits } };

        return { name: bestMatch.name, traits: { ...userTraits } }; // We don't strictly have "idol traits" defined numerically 1:1, so we pass user traits mostly or default
    }
};

