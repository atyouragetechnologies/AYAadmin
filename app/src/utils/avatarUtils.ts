import { IDOL_MINDSETS } from '../data/idolMindsets';

export const PERSONALITY_AVATAR_MAP: Record<string, string> = {
    'Elon Musk': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_elon_musk.webp',
    'Ratan Tata': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_ratan_tata.webp',
    'Virat Kohli': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_virat_kohli.webp',
    'Michael Jackson': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-michael-jackson.webp',
    'Rani Lakshmibai': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-rani-lakshmibai.webp',
    'Bhagat Singh': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-bhagat-singh.webp',
    'Cristiano Ronaldo': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-cristiano-ronaldo.webp',
    'Narendra Modi': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Narendra Modi.webp',
    'Bhuvan Bam': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_bhuvan bam.webp',
    'Shahrukh Khan': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Shah_Rukh_Khan.webp',
    'Michael Jordan': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-michael-jackson.webp',
    'Taylor Swift': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_taylor_swift.webp',
    'Billie Eilish': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-billie-20.webp',
    'Karan Aujla': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_KaranAujla.webp',
    'Siddhu Moosewala': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_SiddhuMoosewala.webp',
    'Sidhu Moose Wala': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_SiddhuMoosewala.webp',
    'Pratosh Bansal': 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_Pratosh_Bansal.webp',
};

export const resolvePersonalityAvatar = (name: string): string => {
    const clean = (name || '').trim();
    if (PERSONALITY_AVATAR_MAP[clean]) return PERSONALITY_AVATAR_MAP[clean];
    const mindset = IDOL_MINDSETS[clean];
    if (mindset?.avatarUrl && mindset.avatarUrl !== 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_business.webp') return mindset.avatarUrl;
    return PERSONALITY_AVATAR_MAP[clean] || mindset?.avatarUrl || 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_business.webp';
};
