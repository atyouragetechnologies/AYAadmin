export type StoryEmotion = 
  | 'triumph' 
  | 'grief' 
  | 'tension' 
  | 'joy' 
  | 'hope' 
  | 'love' 
  | 'mystery' 
  | 'calm' 
  | 'determination' 
  | 'fear' 
  | 'anger' 
  | 'loneliness' 
  | 'wonder' 
  | 'nostalgia' 
  | 'uncertainty' 
  | 'confidence' 
  | 'pride' 
  | 'frustration' 
  | 'shyness' 
  | 'self-belief' 
  | 'confusion' 
  | 'courage' 
  | 'curiosity'
  | 'liberation'
  | 'perfection';

export interface EmotionTheme {
  emotion: StoryEmotion;
  cardOverlay: string;
  badgeColor: string;
  badgeGlow: string;
  choiceBorder: string;
  vignette: string;
  cardBorder: string;
}

export const EMOTION_THEMES: Record<StoryEmotion, EmotionTheme> = {
  // 1. TRIUMPH (Gold / Glory)
  triumph: {
    emotion: 'triumph',
    cardOverlay: 'rgba(180, 140, 0, 0.18)',
    badgeColor: '#ffd700',
    badgeGlow: '0 0 25px rgba(255, 215, 0, 0.6)',
    choiceBorder: 'rgba(255, 215, 0, 0.5)',
    vignette: 'rgba(120, 90, 0, 0.25)',
    cardBorder: 'rgba(255, 215, 0, 0.35)',
  },
  // 2. GRIEF (Deep Crimson Blood Red)
  grief: {
    emotion: 'grief',
    cardOverlay: 'rgba(80, 10, 20, 0.35)',
    badgeColor: '#ef4444',
    badgeGlow: '0 0 25px rgba(239, 68, 68, 0.6)',
    choiceBorder: 'rgba(239, 68, 68, 0.5)',
    vignette: 'rgba(90, 0, 10, 0.4)',
    cardBorder: 'rgba(239, 68, 68, 0.35)',
  },
  // 3. TENSION (Neon Fire Orange)
  tension: {
    emotion: 'tension',
    cardOverlay: 'rgba(100, 40, 0, 0.25)',
    badgeColor: '#f97316',
    badgeGlow: '0 0 25px rgba(249, 115, 22, 0.6)',
    choiceBorder: 'rgba(249, 115, 22, 0.5)',
    vignette: 'rgba(80, 30, 0, 0.3)',
    cardBorder: 'rgba(249, 115, 22, 0.35)',
  },
  // 4. JOY (Vibrant Electric Pink)
  joy: {
    emotion: 'joy',
    cardOverlay: 'rgba(190, 24, 93, 0.2)',
    badgeColor: '#f472b6',
    badgeGlow: '0 0 25px rgba(244, 114, 182, 0.6)',
    choiceBorder: 'rgba(244, 114, 182, 0.5)',
    vignette: 'rgba(130, 20, 70, 0.25)',
    cardBorder: 'rgba(244, 114, 182, 0.35)',
  },
  // 5. HOPE (Golden Sunrise Amber)
  hope: {
    emotion: 'hope',
    cardOverlay: 'rgba(180, 100, 0, 0.2)',
    badgeColor: '#fbbf24',
    badgeGlow: '0 0 25px rgba(251, 191, 36, 0.6)',
    choiceBorder: 'rgba(251, 191, 36, 0.5)',
    vignette: 'rgba(120, 70, 0, 0.25)',
    cardBorder: 'rgba(251, 191, 36, 0.35)',
  },
  // 6. LOVE (Romantic Magenta Rose)
  love: {
    emotion: 'love',
    cardOverlay: 'rgba(160, 20, 90, 0.2)',
    badgeColor: '#ec4899',
    badgeGlow: '0 0 25px rgba(236, 72, 153, 0.6)',
    choiceBorder: 'rgba(236, 72, 153, 0.5)',
    vignette: 'rgba(130, 15, 70, 0.25)',
    cardBorder: 'rgba(236, 72, 153, 0.35)',
  },
  // 7. MYSTERY (Deep Violet Purple)
  mystery: {
    emotion: 'mystery',
    cardOverlay: 'rgba(80, 20, 120, 0.25)',
    badgeColor: '#a855f7',
    badgeGlow: '0 0 25px rgba(168, 85, 247, 0.6)',
    choiceBorder: 'rgba(168, 85, 247, 0.5)',
    vignette: 'rgba(60, 10, 90, 0.35)',
    cardBorder: 'rgba(168, 85, 247, 0.35)',
  },
  // 8. CALM (Radiant Emerald Green)
  calm: {
    emotion: 'calm',
    cardOverlay: 'rgba(6, 78, 59, 0.2)',
    badgeColor: '#10b981',
    badgeGlow: '0 0 25px rgba(16, 185, 129, 0.6)',
    choiceBorder: 'rgba(16, 185, 129, 0.5)',
    vignette: 'rgba(2, 44, 34, 0.25)',
    cardBorder: 'rgba(16, 185, 129, 0.35)',
  },
  // 9. DETERMINATION (Electric Cobalt Sapphire)
  determination: {
    emotion: 'determination',
    cardOverlay: 'rgba(30, 58, 138, 0.25)',
    badgeColor: '#2563eb',
    badgeGlow: '0 0 25px rgba(37, 99, 235, 0.6)',
    choiceBorder: 'rgba(37, 99, 235, 0.5)',
    vignette: 'rgba(15, 23, 62, 0.35)',
    cardBorder: 'rgba(37, 99, 235, 0.35)',
  },
  // 10. FEAR (Dark Shadow Indigo)
  fear: {
    emotion: 'fear',
    cardOverlay: 'rgba(49, 46, 129, 0.3)',
    badgeColor: '#6366f1',
    badgeGlow: '0 0 25px rgba(99, 102, 241, 0.6)',
    choiceBorder: 'rgba(99, 102, 241, 0.5)',
    vignette: 'rgba(30, 27, 75, 0.4)',
    cardBorder: 'rgba(99, 102, 241, 0.35)',
  },
  // 11. ANGER (Blazing Crimson Outrage)
  anger: {
    emotion: 'anger',
    cardOverlay: 'rgba(140, 20, 20, 0.35)',
    badgeColor: '#dc2626',
    badgeGlow: '0 0 25px rgba(220, 38, 38, 0.6)',
    choiceBorder: 'rgba(220, 38, 38, 0.5)',
    vignette: 'rgba(80, 10, 10, 0.4)',
    cardBorder: 'rgba(220, 38, 38, 0.35)',
  },
  // 12. LONELINESS (Midnight Frost Slate)
  loneliness: {
    emotion: 'loneliness',
    cardOverlay: 'rgba(51, 65, 85, 0.25)',
    badgeColor: '#64748b',
    badgeGlow: '0 0 25px rgba(100, 116, 139, 0.6)',
    choiceBorder: 'rgba(100, 116, 139, 0.5)',
    vignette: 'rgba(15, 23, 42, 0.35)',
    cardBorder: 'rgba(100, 116, 139, 0.35)',
  },
  // 13. WONDER (Electric Cyber Cyan)
  wonder: {
    emotion: 'wonder',
    cardOverlay: 'rgba(8, 70, 90, 0.2)',
    badgeColor: '#06b6d4',
    badgeGlow: '0 0 25px rgba(6, 182, 212, 0.6)',
    choiceBorder: 'rgba(6, 182, 212, 0.5)',
    vignette: 'rgba(8, 51, 68, 0.25)',
    cardBorder: 'rgba(6, 182, 212, 0.35)',
  },
  // 14. NOSTALGIA (Warm Bronze Terracotta)
  nostalgia: {
    emotion: 'nostalgia',
    cardOverlay: 'rgba(120, 60, 25, 0.25)',
    badgeColor: '#c08457',
    badgeGlow: '0 0 25px rgba(192, 132, 87, 0.6)',
    choiceBorder: 'rgba(192, 132, 87, 0.5)',
    vignette: 'rgba(80, 40, 15, 0.3)',
    cardBorder: 'rgba(192, 132, 87, 0.35)',
  },

  // Specialized / Aliases
  curiosity: {
    emotion: 'wonder',
    cardOverlay: 'rgba(8, 70, 90, 0.2)',
    badgeColor: '#06b6d4',
    badgeGlow: '0 0 25px rgba(6, 182, 212, 0.6)',
    choiceBorder: 'rgba(6, 182, 212, 0.5)',
    vignette: 'rgba(8, 51, 68, 0.25)',
    cardBorder: 'rgba(6, 182, 212, 0.35)',
  },
  confusion: {
    emotion: 'mystery',
    cardOverlay: 'rgba(80, 20, 120, 0.25)',
    badgeColor: '#a855f7',
    badgeGlow: '0 0 25px rgba(168, 85, 247, 0.6)',
    choiceBorder: 'rgba(168, 85, 247, 0.5)',
    vignette: 'rgba(60, 10, 90, 0.35)',
    cardBorder: 'rgba(168, 85, 247, 0.35)',
  },
  courage: {
    emotion: 'determination',
    cardOverlay: 'rgba(30, 58, 138, 0.25)',
    badgeColor: '#2563eb',
    badgeGlow: '0 0 25px rgba(37, 99, 235, 0.6)',
    choiceBorder: 'rgba(37, 99, 235, 0.5)',
    vignette: 'rgba(15, 23, 62, 0.35)',
    cardBorder: 'rgba(37, 99, 235, 0.35)',
  },
  shyness: {
    emotion: 'calm',
    cardOverlay: 'rgba(6, 78, 59, 0.2)',
    badgeColor: '#10b981',
    badgeGlow: '0 0 25px rgba(16, 185, 129, 0.6)',
    choiceBorder: 'rgba(16, 185, 129, 0.5)',
    vignette: 'rgba(2, 44, 34, 0.25)',
    cardBorder: 'rgba(16, 185, 129, 0.35)',
  },
  'self-belief': {
    emotion: 'determination',
    cardOverlay: 'rgba(30, 58, 138, 0.25)',
    badgeColor: '#2563eb',
    badgeGlow: '0 0 25px rgba(37, 99, 235, 0.6)',
    choiceBorder: 'rgba(37, 99, 235, 0.5)',
    vignette: 'rgba(15, 23, 62, 0.35)',
    cardBorder: 'rgba(37, 99, 235, 0.35)',
  },
  pride: {
    emotion: 'triumph',
    cardOverlay: 'rgba(180, 140, 0, 0.18)',
    badgeColor: '#ffd700',
    badgeGlow: '0 0 25px rgba(255, 215, 0, 0.6)',
    choiceBorder: 'rgba(255, 215, 0, 0.5)',
    vignette: 'rgba(120, 90, 0, 0.25)',
    cardBorder: 'rgba(255, 215, 0, 0.35)',
  },
  frustration: {
    emotion: 'anger',
    cardOverlay: 'rgba(140, 20, 20, 0.35)',
    badgeColor: '#dc2626',
    badgeGlow: '0 0 25px rgba(220, 38, 38, 0.6)',
    choiceBorder: 'rgba(220, 38, 38, 0.5)',
    vignette: 'rgba(80, 10, 10, 0.4)',
    cardBorder: 'rgba(220, 38, 38, 0.35)',
  },
  uncertainty: {
    emotion: 'loneliness',
    cardOverlay: 'rgba(51, 65, 85, 0.25)',
    badgeColor: '#64748b',
    badgeGlow: '0 0 25px rgba(100, 116, 139, 0.6)',
    choiceBorder: 'rgba(100, 116, 139, 0.5)',
    vignette: 'rgba(15, 23, 42, 0.35)',
    cardBorder: 'rgba(100, 116, 139, 0.35)',
  },
  confidence: {
    emotion: 'triumph',
    cardOverlay: 'rgba(180, 140, 0, 0.18)',
    badgeColor: '#ffd700',
    badgeGlow: '0 0 25px rgba(255, 215, 0, 0.6)',
    choiceBorder: 'rgba(255, 215, 0, 0.5)',
    vignette: 'rgba(120, 90, 0, 0.25)',
    cardBorder: 'rgba(255, 215, 0, 0.35)',
  },
  liberation: {
    emotion: 'hope',
    cardOverlay: 'rgba(180, 100, 0, 0.2)',
    badgeColor: '#fbbf24',
    badgeGlow: '0 0 25px rgba(251, 191, 36, 0.6)',
    choiceBorder: 'rgba(251, 191, 36, 0.5)',
    vignette: 'rgba(120, 70, 0, 0.25)',
    cardBorder: 'rgba(251, 191, 36, 0.35)',
  },
  perfection: {
    emotion: 'determination',
    cardOverlay: 'rgba(30, 58, 138, 0.25)',
    badgeColor: '#2563eb',
    badgeGlow: '0 0 25px rgba(37, 99, 235, 0.6)',
    choiceBorder: 'rgba(37, 99, 235, 0.5)',
    vignette: 'rgba(15, 23, 62, 0.35)',
    cardBorder: 'rgba(37, 99, 235, 0.35)',
  }
};

const CORE_EMOTIONS: StoryEmotion[] = [
  'anger', 'determination', 'fear', 'grief', 'hope', 'joy',
  'loneliness', 'love', 'mystery', 'nostalgia', 'tension',
  'triumph', 'wonder', 'calm'
];

export const detectEmotion = (text: string, badgeLabel: string): StoryEmotion => {
  // Step 1: Badge Override
  const badge = badgeLabel.toUpperCase();
  if (/DISTRACTION|BURN RATE|DEFEAT|REGRET|MISTAKE|FAILED/i.test(badge)) return 'grief';
  if (/MASTERY|VICTORY|TRIUMPH|MILESTONE|CHAMPION|SUCCESS|ACCOMPLISHED/i.test(badge)) return 'triumph';
  if (/SACRIFICE|GRIT|RESOLVE|DISCIPLINE|UNBREAKABLE|PERSISTENCE/i.test(badge)) return 'determination';
  if (/OUTRAGE|REBELLION|DEFIANCE|FIGHT/i.test(badge)) return 'anger';
  if (/DISCOVERY|WONDER|EUREKA|VISION/i.test(badge)) return 'wonder';
  if (/SOLITUDE|ISOLATION|LONELY/i.test(badge)) return 'loneliness';
  if (/LOVE|DEVOTION|FAMILY|HEART/i.test(badge)) return 'love';

  // Step 2: High-accuracy keyword scoring across all 14 emotions
  const t = text.toLowerCase();

  const scores: Record<StoryEmotion, number> = {
    anger: 0,
    fear: 0,
    grief: 0,
    loneliness: 0,
    wonder: 0,
    nostalgia: 0,
    determination: 0,
    joy: 0,
    love: 0,
    hope: 0,
    mystery: 0,
    calm: 0,
    triumph: 0,
    tension: 0,
    curiosity: 0,
    confusion: 0,
    courage: 0,
    shyness: 0,
    'self-belief': 0,
    pride: 0,
    frustration: 0,
    uncertainty: 0,
    confidence: 0,
    liberation: 0,
    perfection: 0
  };

  // ANGER
  if (/puppet|formula|grateful|rage|furious|injustice|unfair|cheat|rigged|protest|rebel|strike|exploited|humiliated|insult|refuse|banned|betrayed|anger|angry|hypocrisy|oppression|disrespect|stand your ground/.test(t)) {
    scores.anger += 10;
  }

  // FEAR
  if (/arrest|panic|terror|danger|bomb|raid|hide|hiding|enemy|execution|trapped|war|hunted|flee|survive|fatal|horror|nightmare|scared|fear|afraid|terrified|gestapo|undercover|gunshot|threat/.test(t)) {
    scores.fear += 10;
  }

  // GRIEF
  if (/died|death|passed away|funeral|mourn|tragedy|tears|weep|depressed|heartbreak|sorrow|bankrupt|lost everything|failed|failure|destroyed|grief|crushed|broken column|hospital|injury|pain|illness|diagnosis/.test(t)) {
    scores.grief += 10;
  }

  // LONELINESS
  if (/alone|lonely|isolated|nobody|outcast|stranger|left out|ignored|empty room|2 am|2am|hotel room|far from home|forgotten|silence|solitude|alien|couch surfer|sleeping on the floor|different from everyone/.test(t)) {
    scores.loneliness += 10;
  }

  // WONDER
  if (/discover|universe|cosmos|telescope|invention|invent|machine|code|coding|computer|software|electrical|experiment|vision|magic|imagine|wonder|curious|marvel|breakthrough|ai|space|stars|technology/.test(t)) {
    scores.wonder += 10;
  }

  // NOSTALGIA
  if (/remember|memory|childhood|diary|past|old days|grandfather|grandmother|roots|village|vintage|photograph|grew up|innocence|heritage|nostalgia|checked diary|1942|amsterdam/.test(t)) {
    scores.nostalgia += 10;
  }

  // DETERMINATION
  if (/grind|4 am|4am|workout|train|practice|discipline|resolve|persist|never give up|relentless|focus|stamina|athlete|captain|willpower|conquer|sweat|endure|determination|hustle|hours and hours|refuse to quit/.test(t)) {
    scores.determination += 10;
  }

  // JOY
  if (/celebrate|celebration|laugh|laughter|smile|fun|dance|dancing|party|thrilled|comedy|jokes|giggling|exciting|happiness|cheerful|joy|amused|hilarious/.test(t)) {
    scores.joy += 10;
  }

  // LOVE
  if (/love|relationship|partner|girlfriend|boyfriend|gauri|married|marriage|family|tender|devotion|affection|darling|cherish|bond|heartwarming|together forever/.test(t)) {
    scores.love += 10;
  }

  // HOPE
  if (/dream|promise|fresh start|new beginning|brighter|believe|future|horizon|dawn|aspiring|opportunity|potential|optimism|faith|hope|one day|doors open|starting out/.test(t)) {
    scores.hope += 10;
  }

  // MYSTERY
  if (/secret|undercover|disguised|enigma|puzzle|cryptic|cipher|riddle|shadow|anonymous|unknown|suspicious|masked|investigate|mystery|clue|hidden message|classified/.test(t)) {
    scores.mystery += 10;
  }

  // CALM
  if (/peaceful|quiet|still|stillness|reflect|reflection|breath|breathe|serene|gentle|meditation|patient|balance|steady|calm|tranquil|resting|buddha/.test(t)) {
    scores.calm += 10;
  }

  // TRIUMPH
  if (/champion|won|victory|gold medal|trophy|grammy|breakout|legendary|greatness|applause|ovation|breakthrough|triumph|crowned|legend|world cup|first place|celebrated by millions/.test(t)) {
    scores.triumph += 10;
  }

  // TENSION (Strictly for high-stakes crossroads / showdowns)
  if (/clock ticking|high stakes|showdown|clash|face-off|brink|ultimatum|critical moment|do-or-die|crossroads|sudden death|cliffhanger|tension/.test(t)) {
    scores.tension += 10;
  }

  // Find max score
  let maxScore = 0;
  let bestEmotion: StoryEmotion | null = null;
  for (const emo of CORE_EMOTIONS) {
    if (scores[emo] > maxScore) {
      maxScore = scores[emo];
      bestEmotion = emo;
    }
  }

  if (bestEmotion && maxScore > 0) {
    return bestEmotion;
  }

  // Step 3: Balanced, deterministic hash distribution when text is neutral
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return CORE_EMOTIONS[hash % CORE_EMOTIONS.length];
};

