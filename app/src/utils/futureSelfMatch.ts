import type { PersonalityTraits } from '../types/gameTypes';
import { generateLevels } from './levelGenerator';

// ─── Life Traits ─────────────────────────────────────────────────────────────
export interface LifeTraits {
    resilience: number;
    discipline: number;
    courage: number;
    creativity: number;
    emotional_control: number;
    leadership: number;
    risk_intelligence: number;
    consistency: number;
}

// ─── Archetype Definition ────────────────────────────────────────────────────
export interface FutureArchetype {
    name: string;
    emoji: string;
    description: string;
    realMatch: string;
    realMatchAvatar: string;
    traits: Partial<LifeTraits>;
    percentile: string;
    color: string;        // primary neon hex
    colorSecondary: string;
}

export interface FutureMatch {
    archetype: FutureArchetype;
    score: number;        // 0-100, match quality
    lifeTraits: LifeTraits;
}

// ─── Archetypes ──────────────────────────────────────────────────────────────
export const FUTURE_ARCHETYPES: Record<string, FutureArchetype> = {
    'Elite Founder': {
        name: 'Elite Founder',
        emoji: '⚡',
        description: 'You make bold moves, think independently and build things from nothing.',
        realMatch: 'Ritesh Agarwal',
        realMatchAvatar: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_ritesh.webp',
        traits: { courage: 80, risk_intelligence: 75, creativity: 70, leadership: 75 },
        percentile: 'Top 3%',
        color: '#f59e0b',
        colorSecondary: '#fbbf24',
    },
    'Creative Visionary': {
        name: 'Creative Visionary',
        emoji: '🎨',
        description: 'You see the world differently and express what others cannot articulate.',
        realMatch: 'A.R. Rahman',
        realMatchAvatar: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_rahman.webp',
        traits: { creativity: 85, emotional_control: 75, resilience: 70 },
        percentile: 'Top 5%',
        color: '#d575ff',
        colorSecondary: '#a855f7',
    },
    'Strategic Leader': {
        name: 'Strategic Leader',
        emoji: '🧠',
        description: 'You think 10 steps ahead and build systems that outlast you.',
        realMatch: 'Sundar Pichai',
        realMatchAvatar: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_sundar.webp',
        traits: { discipline: 80, leadership: 80, risk_intelligence: 75 },
        percentile: 'Top 4%',
        color: '#00f2ff',
        colorSecondary: '#22d3ee',
    },
    'World Changer': {
        name: 'World Changer',
        emoji: '🌍',
        description: 'You are driven by purpose bigger than yourself and inspire others to follow.',
        realMatch: 'Malala Yousafzai',
        realMatchAvatar: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_malala.webp',
        traits: { courage: 85, resilience: 80, leadership: 75 },
        percentile: 'Top 2%',
        color: '#00ff9d',
        colorSecondary: '#34d399',
    },
    'Elite Performer': {
        name: 'Elite Performer',
        emoji: '🏆',
        description: 'You outwork everyone through obsessive discipline and consistency.',
        realMatch: 'Kobe Bryant',
        realMatchAvatar: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_kobe.webp',
        traits: { discipline: 90, consistency: 85, resilience: 80 },
        percentile: 'Top 1%',
        color: '#ff51fa',
        colorSecondary: '#ec4899',
    },
    'Quiet Genius': {
        name: 'Quiet Genius',
        emoji: '💡',
        description: 'You solve problems others cannot see and think in systems and patterns.',
        realMatch: 'Nikola Tesla',
        realMatchAvatar: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_tesla.webp',
        traits: { risk_intelligence: 85, creativity: 80, discipline: 75 },
        percentile: 'Top 5%',
        color: '#99f7ff',
        colorSecondary: '#67e8f9',
    },
};

// ─── Consistency Score from Streak ───────────────────────────────────────────
export function getConsistencyScore(streak: number): number {
    if (streak === 0) return 35;
    if (streak <= 3) return 50;
    if (streak <= 7) return 68;
    if (streak <= 14) return 80;
    if (streak <= 30) return 92;
    return 98;
}

// ─── Calculate 8 Life Traits ─────────────────────────────────────────────────
export function calculateLifeTraits(
    traits: PersonalityTraits,
    streak: number = 0
): LifeTraits {
    const consistencyScore = getConsistencyScore(streak);

    // Map PersonalityTraits fields to the right keys defensively
    const risk = (traits as any)?.risk ?? (traits as any)?.trait_risk_taker ?? 50;
    const creativity = (traits as any)?.creativity ?? (traits as any)?.trait_creative ?? 50;
    const analytical = (traits as any)?.vision ?? (traits as any)?.trait_analytical ?? 50;
    const social = (traits as any)?.empathy ?? (traits as any)?.trait_social ?? 50;
    const ambitious = (traits as any)?.leadership ?? (traits as any)?.trait_ambitious ?? 50;

    const clamp = (v: number) => Math.max(10, Math.min(98, Math.round(v)));

    return {
        resilience:         clamp(risk * 0.45 + ambitious * 0.45 + (100 - social) * 0.10),
        discipline:         clamp(analytical * 0.45 + consistencyScore * 0.35 + ambitious * 0.20),
        courage:            clamp(risk * 0.55 + ambitious * 0.35 + (100 - analytical) * 0.10),
        creativity:         clamp(creativity * 0.70 + analytical * 0.20 + risk * 0.10),
        emotional_control:  clamp(social * 0.40 + analytical * 0.40 + (100 - risk) * 0.20),
        leadership:         clamp(ambitious * 0.50 + social * 0.30 + analytical * 0.20),
        risk_intelligence:  clamp(risk * 0.45 + analytical * 0.45 + creativity * 0.10),
        consistency:        clamp(consistencyScore * 0.65 + analytical * 0.20 + ambitious * 0.15),
    };
}

// 🌀 Match Archetype 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀
export function matchFutureArchetype(lifeTraits: LifeTraits): FutureMatch {
    const levels = generateLevels(18); // Pass an arbitrary age to get all levels

    const uniquePersonalities = new Map<string, any>();
    levels.forEach((level: any) => {
        if (level.personality && !uniquePersonalities.has(level.personality)) {
            uniquePersonalities.set(level.personality, level);
        }
    });

    let bestMatch: any = null;
    let bestDistance = Infinity;

    // Convert idolTraits to lifeTraits shape for comparison
    const mapIdolToLife = (idolTraits: any): Partial<LifeTraits> => {
        if (!idolTraits) return {};
        return {
            resilience: idolTraits.resilience ?? idolTraits.risk ?? 70,
            discipline: idolTraits.discipline ?? 75,
            courage: idolTraits.risk ?? 70,
            creativity: idolTraits.creativity ?? 70,
            emotional_control: idolTraits.empathy ?? 65,
            leadership: idolTraits.leadership ?? 75,
            risk_intelligence: idolTraits.vision ?? 75,
            consistency: idolTraits.discipline ?? 70,
        };
    };

    uniquePersonalities.forEach((level) => {
        const archetypeTraits = mapIdolToLife(level.idolTraits);
        const traitKeys = Object.keys(archetypeTraits) as (keyof LifeTraits)[];
        if (traitKeys.length === 0) return;
        
        let sumSq = 0;
        for (const key of traitKeys) {
            const target = archetypeTraits[key] ?? 50;
            const actual = lifeTraits[key] ?? 50;
            sumSq += Math.pow(target - actual, 2);
        }
        const distance = Math.sqrt(sumSq / traitKeys.length);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestMatch = level;
        }
    });

    const score = Math.max(50, Math.min(99, Math.round(100 - (bestDistance / 100) * 80)));

    const colors = ['#f59e0b', '#d575ff', '#00f2ff', '#00ff9d', '#ff51fa', '#99f7ff'];
    const secColors = ['#fbbf24', '#a855f7', '#22d3ee', '#34d399', '#ec4899', '#67e8f9'];
    const personalityName = bestMatch?.personality || bestMatch?.archetype || 'Visionary';
    const cIndex = (personalityName?.length || 0) % colors.length;

    const generatedArchetype: FutureArchetype = bestMatch ? {
        name: bestMatch.archetype || 'Visionary',
        emoji: '⭐',
        description: bestMatch.lesson || bestMatch.bio || 'You make bold moves, think independently and build things from nothing.',
        realMatch: personalityName,
        realMatchAvatar: bestMatch.avatarUrl || 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_virat_kohli.webp',
        traits: mapIdolToLife(bestMatch.idolTraits),
        percentile: `Top ${Math.max(1, Math.min(10, Math.round(bestDistance / 3)))}%`,
        color: colors[cIndex],
        colorSecondary: secColors[cIndex],
    } : FUTURE_ARCHETYPES['Strategic Leader'];

    return {
        archetype: generatedArchetype,
        score,
        lifeTraits,
    };
}

// ─── Weakest Trait ────────────────────────────────────────────────────────────
export function getWeakestTrait(lifeTraits: LifeTraits): string {
    const labels: Record<keyof LifeTraits, string> = {
        resilience: 'Resilience',
        discipline: 'Discipline',
        courage: 'Courage',
        creativity: 'Creativity',
        emotional_control: 'Emotional Control',
        leadership: 'Leadership',
        risk_intelligence: 'Risk Intelligence',
        consistency: 'Consistency',
    };
    const sorted = (Object.keys(lifeTraits) as (keyof LifeTraits)[])
        .sort((a, b) => lifeTraits[a] - lifeTraits[b]);
    return labels[sorted[0]] ?? 'Consistency';
}
