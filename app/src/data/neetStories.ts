import type { Level } from '../types/gameTypes';

export const neetStories: Level[] = Array.from({ length: 15 }, (_, i) => {
    const day = i + 1;
    return {
        id: `neet-day-${day}`,
        day_number: day,
        title: 'Coming Soon',
        description: 'This story will unlock soon.',
        personality: '',
        placeholder: true,
        requiredStars: 0,
        year: 2024,
        age: 18,
        theme: 'NEET',
        archetype: 'Student',
        status: 'locked',
        isLocked: true,
        stars: 0,
        scenarioId: `neet-day-${day}`,
        avatarUrl: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_business.webp'
    };
});
