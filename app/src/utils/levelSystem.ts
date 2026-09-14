export interface LevelInfo {
    level: number;
    title: string;
    xpFloor: number;
    xpCeiling: number;
}

export const LEVEL_TIERS: LevelInfo[] = [
    { level: 1, title: "Curious Mind", xpFloor: 0, xpCeiling: 99 },
    { level: 2, title: "Awakened Soul", xpFloor: 100, xpCeiling: 249 },
    { level: 3, title: "Rising Force", xpFloor: 250, xpCeiling: 499 },
    { level: 4, title: "Visionary", xpFloor: 500, xpCeiling: 999 },
    { level: 5, title: "Legend in Making", xpFloor: 1000, xpCeiling: 1999 },
    { level: 6, title: "Icon", xpFloor: 2000, xpCeiling: 999999 } // Cap
];

export const calculateLevelInfo = (xp: number): LevelInfo => {
    // Return highest applicable tier
    for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_TIERS[i].xpFloor) {
            return LEVEL_TIERS[i];
        }
    }
    return LEVEL_TIERS[0];
};

export const getNextLevelInfo = (currentLevel: number): LevelInfo | null => {
    const nextLayer = LEVEL_TIERS.find(t => t.level === currentLevel + 1);
    return nextLayer || null; // Null means Max Level
};
