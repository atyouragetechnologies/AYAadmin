/**
 * LOCAL CLIENT-SIDE STORY METADATA
 *
 * PURPOSE: Offline-first situation-driven story map filtering.
 * Used by: LevelMap ("What are you dealing with?" → situation filter)
 *
 * KEY RULE: storyId MUST exactly match scenarioId in levelGenerator.ts / STORY_DATABASE
 * - This file is the source of truth for runtime map filtering (no Supabase request needed)
 * - Supabase story_metadata table mirrors this data for server-side analytics/recommendations
 * - Never add story IDs here that don't exist in levelGenerator.ts / scenarios.ts
 *
 * Generated: 2026-08-29T14:47:51.668Z
 * Total stories: 78
 */

export interface StoryMetadata {
  storyId: string;
  situationTags: string[];
  problemTags: string[];
  emotionalTags: string[];
  intentTags: string[];
  lifeStageTags: string[];
  ageMin: number | null;
  ageMax: number | null;
  dominantTrait: string;
  resolutionArchetype: string;
  lessonTags: string[];
  difficulty: number | null;
  relatability: number | null;
  era: string;
  culturalContext: string;
  semanticDescription: string;
  triggerPhrases: string[];
  bestForMode: string;
  whyThisStoryTemplate: string;
  isPremium: boolean;
  premiumTier: string | null;
  sources?: any[];
}

export const STORY_METADATA: StoryMetadata[] = [
  {
    "storyId": "lvl_age_18_pratosh",
    "situationTags": [
      "starting_something",
      "career_uncertainty",
      "feeling_stuck",
      "discipline",
      "identity_question"
    ],
    "problemTags": [
      "lack_of_real_world_awareness",
      "navigating_newfound_freedom",
      "false_security_of_academics",
      "academic_comfort_trap"
    ],
    "emotionalTags": [
      "confused",
      "curious",
      "seeking"
    ],
    "intentTags": [
      "find_direction",
      "challenge_myself"
    ],
    "lifeStageTags": [
      "teen",
      "college"
    ],
    "ageMin": 18,
    "ageMax": 24,
    "dominantTrait": "initiative",
    "resolutionArchetype": "action_step",
    "lessonTags": [
      "initiative",
      "real_world_awareness",
      "industry_exposure",
      "action_step"
    ],
    "difficulty": 2,
    "relatability": 5,
    "era": "1990s",
    "culturalContext": "indian",
    "semanticDescription": "A story about Pratosh Bansal at age 18 navigating The Classroom Illusion: navigating the first year of an engineering degree with newfound freedom, facing the choice between standard classroom syllabus comfort versus stepping out to gain real-world industry exposure.",
    "triggerPhrases": [
      "pratosh bansal",
      "the classroom illusion",
      "pratosh bansal age 18",
      "starting_something",
      "college freedom",
      "engineering degree",
      "industry exposure"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Pratosh Bansal at age 18 faced a pivotal choice in The Classroom Illusion — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null,
    "sources": [
      {
        "claim": "first year ya second year mein mujhe lagta hai ki aur industry exposure lena chahiye tha.",
        "source": "Interview Transcript, 2026"
      },
      {
        "claim": "jab aap ek open environment mein aa jaate hain, toh bahut saari aapko freedom mil jaati hai.",
        "source": "Interview Transcript, 2026"
      },
      {
        "claim": "So main classroom teaching toh definitely achhe se karta tha...",
        "source": "Interview Transcript, 2026"
      },
      {
        "claim": "aap miss karte ho usko, toh aapko aage thodi struggle zyada ho jaati hai.",
        "source": "Interview Transcript, 2026"
      }
    ]
  },
  {
    "storyId": "lvl_age_19_pratosh",
    "situationTags": [
      "starting_something",
      "career_uncertainty",
      "feeling_stuck",
      "discipline",
      "identity_question",
      "big_decision"
    ],
    "problemTags": [
      "lack_of_real_world_awareness",
      "navigating_newfound_freedom",
      "false_security_of_academics"
    ],
    "emotionalTags": [
      "confused",
      "curious",
      "seeking"
    ],
    "intentTags": [
      "find_direction",
      "challenge_myself"
    ],
    "lifeStageTags": [
      "teen",
      "college"
    ],
    "ageMin": 18,
    "ageMax": 24,
    "dominantTrait": "initiative",
    "resolutionArchetype": "action_step",
    "lessonTags": [
      "initiative",
      "real_world_awareness",
      "industry_exposure",
      "action_step"
    ],
    "difficulty": 2,
    "relatability": 5,
    "era": "1990s",
    "culturalContext": "indian",
    "semanticDescription": "A story about Pratosh Bansal at age 19 navigating The Classroom Illusion: navigating the early years of an engineering degree in an open college environment, deciding how to approach learning between syllabus comfort and real-world industry exposure.",
    "triggerPhrases": [
      "pratosh bansal",
      "the classroom illusion",
      "pratosh bansal age 19",
      "starting_something",
      "college freedom",
      "engineering degree",
      "industry exposure"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Pratosh Bansal at age 19 faced a pivotal choice in The Classroom Illusion — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null,
    "sources": [
      {
        "claim": "first year ya second year mein mujhe lagta hai ki aur industry exposure lena chahiye tha.",
        "source": "Interview Transcript"
      },
      {
        "claim": "jab aap ek open environment mein aa jaate hain, toh bahut saari aapko freedom mil jaati hai.",
        "source": "Interview Transcript"
      },
      {
        "claim": "So main classroom teaching toh definitely achhe se karta tha...",
        "source": "Interview Transcript"
      },
      {
        "claim": "aap miss karte ho usko, toh aapko aage thodi struggle zyada ho jaati hai.",
        "source": "Interview Transcript"
      }
    ]
  },
  {
    "storyId": "lvl_age_18_kobe_1",
    "situationTags": [
      "failure_setback",
      "performance_anxiety",
      "proving_oneself"
    ],
    "problemTags": [
      "fear_of_failure",
      "humiliation",
      "resilience"
    ],
    "emotionalTags": [
      "humiliated",
      "determined",
      "focused"
    ],
    "intentTags": [
      "build_resilience",
      "overcome_failure",
      "master_craft"
    ],
    "lifeStageTags": [
      "teen",
      "young_adult"
    ],
    "ageMin": 18,
    "ageMax": 25,
    "dominantTrait": "discipline",
    "resolutionArchetype": "conquer",
    "lessonTags": [
      "resilience",
      "discipline",
      "mamba_mentality",
      "courage"
    ],
    "difficulty": 3,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Kobe Bryant at age 18 navigating devastating playoff airballs: At 18, after shooting 4 crushing airballs in crunch time to knock the Lakers out of the playoffs, you face brutal media mockery. How will you respond?",
    "triggerPhrases": [
      "kobe bryant",
      "kobe",
      "kobe bryant age 18",
      "airballs",
      "the four airballs",
      "mamba mentality",
      "failure",
      "public embarrassment"
    ],
    "bestForMode": "confront",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Kobe Bryant at age 18 faced a pivotal choice in The Four Airballs — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_13_anne_1",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "empathy",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Anne Frank at age 13 navigating the notebook: At 13, Anne receives a diary for her birthday. What will she use it for?",
    "triggerPhrases": [
      "anne frank",
      "the notebook",
      "anne frank age 13",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Anne Frank at age 13 faced a pivotal choice in The Notebook — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_13_anne_2",
    "situationTags": [
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "empathy",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Anne Frank at age 13 navigating when ordinary life disappears: Weeks later, Anne\\",
    "triggerPhrases": [
      "anne frank",
      "when ordinary life disappears",
      "anne frank age 13",
      "big_decision"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Anne Frank at age 13 faced a pivotal choice in When Ordinary Life Disappears — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_15_elon_musk",
    "situationTags": [
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Elon Musk at age 15 navigating the thing you love: At 15, Elon Musk navigates being a bookish, introverted teenager with a passion for computers and coding, deciding how to protect his interests.",
    "triggerPhrases": [
      "elon musk",
      "the thing you love",
      "elon musk age 15",
      "identity_question"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Elon Musk at age 15 faced a pivotal choice in The Thing You Love — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_15_ratan_tata",
    "situationTags": [
      "career_uncertainty",
      "identity_question",
      "confidence_low"
    ],
    "problemTags": [
      "isolation"
    ],
    "emotionalTags": [
      "anxious"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "leadership",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Ratan Tata at age 15 navigating the quiet voice: At 15, Ratan Tata experiences shyness and fear of public speaking while attending school in Bombay, discovering how quiet self-expression can build confidence.",
    "triggerPhrases": [
      "ratan tata",
      "the quiet voice",
      "ratan tata age 15",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Ratan Tata at age 15 faced a pivotal choice in The Quiet Voice — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_15_virat_kohli",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "risk",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Virat Kohli at age 15 navigating more than your own score: At 15, Virat Kohli is appointed captain of Delhi Under-15, learning the balance between individual performance and team leadership.",
    "triggerPhrases": [
      "virat kohli",
      "more than your own score",
      "virat kohli age 15",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Virat Kohli at age 15 faced a pivotal choice in More Than Your Own Score — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_15_michael_1",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "creativity",
    "resolutionArchetype": "pivot",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Michael Jackson at age 15 navigating when your voice changes: At 15, Michael Jackson experiences physical and vocal changes during adolescence while continuing his music career.",
    "triggerPhrases": [
      "michael jackson",
      "when your voice changes",
      "michael jackson age 15",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Michael Jackson at age 15 faced a pivotal choice in When Your Voice Changes — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_15_michael_2",
    "situationTags": [
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence",
      "understand_myself"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Michael Jackson at age 15 navigating when people expect the old you: At 15, Michael Jackson decides how to navigate audience expectations as he grows out of his childhood identity.",
    "triggerPhrases": [
      "michael jackson",
      "when people expect the old you",
      "michael jackson age 15",
      "identity_question"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Michael Jackson at age 15 faced a pivotal choice in When People Expect the Old You — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_15_rani_lakshmibai",
    "situationTags": [
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence",
      "understand_myself"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "empathy",
    "resolutionArchetype": "overcome",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Rani Lakshmibai at age 15 navigating the girl and the crown: At 15, Manikarnika becomes Lakshmibai, Rani of Jhansi, navigating the identity transition between her past and her new royal responsibilities.",
    "triggerPhrases": [
      "rani lakshmibai",
      "the girl and the crown",
      "rani lakshmibai age 15",
      "identity_question"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Rani Lakshmibai at age 15 faced a pivotal choice in The Girl and the Crown — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_15_bhagat_1",
    "situationTags": [
      "starting_something"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence",
      "understand_myself"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "empathy",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Bhagat Singh at age 15 navigating don\\: At 15, Bhagat Singh witnesses political tension in Lahore and learns how to channel anger into constructive learning and action.",
    "triggerPhrases": [
      "bhagat singh",
      "don\\",
      "bhagat singh age 15",
      "starting_something"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Bhagat Singh at age 15 faced a pivotal choice in Don\\ — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_15_bhagat_2",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "empathy",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Bhagat Singh at age 15 navigating what if i\\: At 15, Bhagat Singh learns intellectual humility and the importance of independent thinking when hearing opposing views.",
    "triggerPhrases": [
      "bhagat singh",
      "what if i\\",
      "bhagat singh age 15",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Bhagat Singh at age 15 faced a pivotal choice in What If I\\ — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_15_ronaldo",
    "situationTags": [
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "lonely"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "risk",
    "resolutionArchetype": "adapt",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Cristiano Ronaldo at age 15 navigating far from home: At 15, Cristiano Ronaldo experiences loneliness and homesickness in Lisbon after moving from Madeira, deciding whether to stay and persevere or return home.",
    "triggerPhrases": [
      "cristiano ronaldo",
      "far from home",
      "cristiano ronaldo age 15",
      "identity_question"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Cristiano Ronaldo at age 15 faced a pivotal choice in Far From Home — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_20_billie_2",
    "situationTags": [
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Billie Eilish at age 20 navigating the person who left you on seen: At 20, you must choose between chasing someone who ghosts you, or turning the pain into art.",
    "triggerPhrases": [
      "billie eilish",
      "the person who left you on seen",
      "billie eilish age 20",
      "big_decision"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Billie Eilish at age 20 faced a pivotal choice in The Person Who Left You On Seen — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_justin",
    "situationTags": [
      "starting_something",
      "feeling_stuck"
    ],
    "problemTags": [
      "isolation"
    ],
    "emotionalTags": [
      "lonely"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Justin Bieber at age 19 navigating the hotel room at 2am: At 19, you sit alone in a hotel room deciding whether to text an ex or face the emptiness underneath.",
    "triggerPhrases": [
      "justin bieber",
      "the hotel room at 2am",
      "justin bieber age 19",
      "starting_something"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Justin Bieber at age 19 faced a pivotal choice in The Hotel Room at 2AM — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_17_srk",
    "situationTags": [
      "exam_pressure",
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Shah Rukh Khan at age 17 navigating the stage or the books: At 17, SRK faces an impossible choice — grieve, study, or chase the stage.",
    "triggerPhrases": [
      "shah rukh khan",
      "the stage or the books",
      "shah rukh khan age 17",
      "exam_pressure"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Shah Rukh Khan at age 17 faced a pivotal choice in The Stage or The Books — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_17_sindhu",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "risk",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about P.V. Sindhu at age 17 navigating the olympic prelude: At 17, Sindhu faced the seemingly invincible Olympic gold medalist.",
    "triggerPhrases": [
      "p.v. sindhu",
      "the olympic prelude",
      "p.v. sindhu age 17",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. P.V. Sindhu at age 17 faced a pivotal choice in The Olympic Prelude — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_17_rahman",
    "situationTags": [
      "family_pressure"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about A.R. Rahman at age 17 navigating the silent melody: At 17, a grieving son drops out of school to support his family through music.",
    "triggerPhrases": [
      "a.r. rahman",
      "the silent melody",
      "a.r. rahman age 17",
      "family_pressure"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. A.R. Rahman at age 17 faced a pivotal choice in The Silent Melody — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_17_malala",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "empathy",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Malala Yousafzai at age 17 navigating the price of peace: At 17, Malala won the Nobel Prize. But was the global spotlight worth the trauma?",
    "triggerPhrases": [
      "malala yousafzai",
      "the price of peace",
      "malala yousafzai age 17",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Malala Yousafzai at age 17 faced a pivotal choice in The Price of Peace — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_17_jobs",
    "situationTags": [
      "career_uncertainty",
      "failure_setback"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Steve Jobs at age 17 navigating the dropout\\: At 17, Jobs dropped out of Harvard to audit calligraphy classes.",
    "triggerPhrases": [
      "steve jobs",
      "the dropout\\",
      "steve jobs age 17",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Steve Jobs at age 17 faced a pivotal choice in The Dropout\\ — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_17_nooyi",
    "situationTags": [
      "career_uncertainty"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "leadership",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Indra Nooyi at age 17 navigating the rulebreaker: At 17, a young Indian woman played in an all-girls rock band and broke every conventional rule.",
    "triggerPhrases": [
      "indra nooyi",
      "the rulebreaker",
      "indra nooyi age 17",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Indra Nooyi at age 17 faced a pivotal choice in The Rulebreaker — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_18",
    "situationTags": [
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "pivot",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Taylor Swift at age 18 navigating the beginning (country): At 18, Taylor faced a choice: Security or Authenticity.",
    "triggerPhrases": [
      "taylor swift",
      "the beginning (country)",
      "taylor swift age 18",
      "big_decision"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Taylor Swift at age 18 faced a pivotal choice in The Beginning (Country) — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_18_zendaya",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence",
      "understand_myself"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Zendaya at age 18 navigating the identity strike: At 18, Zendaya risked her Disney career for creative control.",
    "triggerPhrases": [
      "zendaya",
      "the identity strike",
      "zendaya age 18",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Zendaya at age 18 faced a pivotal choice in The Identity Strike — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_18_anand",
    "situationTags": [
      "starting_something"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "risk",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Viswanathan Anand at age 18 navigating the lightning kid: At 18, Anand became India\\",
    "triggerPhrases": [
      "viswanathan anand",
      "the lightning kid",
      "viswanathan anand age 18",
      "starting_something"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Viswanathan Anand at age 18 faced a pivotal choice in The Lightning Kid — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_18_kohli",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "risk",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Virat Kohli at age 18 navigating the hardest day: At 18, Virat faced the ultimate test of duty and grief.",
    "triggerPhrases": [
      "virat kohli",
      "the hardest day",
      "virat kohli age 18",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Virat Kohli at age 18 faced a pivotal choice in The Hardest Day — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_18_virat",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "risk",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Virat Kohli at age 18 navigating virat conversational: Experience Virat\\",
    "triggerPhrases": [
      "virat kohli",
      "virat conversational",
      "virat kohli age 18",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Virat Kohli at age 18 faced a pivotal choice in Virat Conversational — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_18_kalam",
    "situationTags": [
      "exam_pressure"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Dr. A.P.J. Abdul Kalam at age 18 navigating the big leap: At 18, Kalam left his humble town for a prestigious college.",
    "triggerPhrases": [
      "dr. a.p.j. abdul kalam",
      "the big leap",
      "dr. a.p.j. abdul kalam age 18",
      "exam_pressure"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Dr. A.P.J. Abdul Kalam at age 18 faced a pivotal choice in The Big Leap — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_18_tata",
    "situationTags": [
      "career_uncertainty",
      "family_pressure"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "leadership",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Ratan Tata at age 18 navigating the defiant blueprint: At 18, Ratan chose architecture over his father\\",
    "triggerPhrases": [
      "ratan tata",
      "the defiant blueprint",
      "ratan tata age 18",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Ratan Tata at age 18 faced a pivotal choice in The Defiant Blueprint — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_18_pratosh",
    "situationTags": [
      "starting_something",
      "career_uncertainty",
      "feeling_stuck",
      "discipline",
      "identity_question"
    ],
    "problemTags": [
      "lack_of_real_world_awareness",
      "navigating_newfound_freedom",
      "false_security_of_academics",
      "academic_comfort_trap"
    ],
    "emotionalTags": [
      "confused",
      "curious",
      "seeking"
    ],
    "intentTags": [
      "find_direction",
      "challenge_myself"
    ],
    "lifeStageTags": [
      "teen",
      "college"
    ],
    "ageMin": 18,
    "ageMax": 24,
    "dominantTrait": "initiative",
    "resolutionArchetype": "action_step",
    "lessonTags": [
      "initiative",
      "real_world_awareness",
      "industry_exposure",
      "action_step"
    ],
    "difficulty": 2,
    "relatability": 5,
    "era": "1990s",
    "culturalContext": "indian",
    "semanticDescription": "A story about Pratosh Bansal at age 18 navigating The Classroom Illusion: navigating the first year of an engineering degree with newfound freedom, facing the choice between standard classroom syllabus comfort versus stepping out to gain real-world industry exposure.",
    "triggerPhrases": [
      "pratosh bansal",
      "the classroom illusion",
      "pratosh bansal age 18",
      "starting_something",
      "college freedom",
      "engineering degree",
      "industry exposure"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Pratosh Bansal at age 18 faced a pivotal choice in The Classroom Illusion — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null,
    "sources": [
      {
        "claim": "first year ya second year mein mujhe lagta hai ki aur industry exposure lena chahiye tha.",
        "source": "Interview Transcript, 2026"
      },
      {
        "claim": "jab aap ek open environment mein aa jaate hain, toh bahut saari aapko freedom mil jaati hai.",
        "source": "Interview Transcript, 2026"
      },
      {
        "claim": "So main classroom teaching toh definitely achhe se karta tha...",
        "source": "Interview Transcript, 2026"
      },
      {
        "claim": "aap miss karte ho usko, toh aapko aage thodi struggle zyada ho jaati hai.",
        "source": "Interview Transcript, 2026"
      }
    ]
  },
  {
    "storyId": "lvl_age_21_pratosh",
    "situationTags": [
      "career_uncertainty",
      "confidence_low",
      "comparison_trap",
      "identity_question",
      "purpose"
    ],
    "problemTags": [
      "extreme_shyness",
      "fear_of_judgment",
      "career_satisfaction",
      "social_anxiety",
      "opinion_trap"
    ],
    "emotionalTags": [
      "anxious",
      "conflicted",
      "seeking"
    ],
    "intentTags": [
      "build_confidence",
      "courage_to_commit"
    ],
    "lifeStageTags": [
      "college",
      "early_20s"
    ],
    "ageMin": 20,
    "ageMax": 25,
    "dominantTrait": "courage",
    "resolutionArchetype": "reframe",
    "lessonTags": [
      "courage",
      "overcoming_judgment",
      "loving_the_work",
      "communication",
      "reframe"
    ],
    "difficulty": 2,
    "relatability": 5,
    "era": "1990s",
    "culturalContext": "indian",
    "semanticDescription": "A story about Pratosh Bansal at age 21 navigating The Opinion Trap: graduating as branch topper and qualifying GATE while confronting extreme shyness, the paralyzing fear of what others think, and learning to commit fully by choosing to love the work in front of him.",
    "triggerPhrases": [
      "pratosh bansal",
      "the opinion trap",
      "pratosh bansal age 21",
      "career_uncertainty",
      "sabse bada rog",
      "kya kahenge log",
      "gate qualified",
      "branch topper"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Pratosh Bansal at age 21 faced a pivotal choice in The Opinion Trap — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null,
    "sources": [
      {
        "claim": "I topped in my seventh semester, so I was branch topper... Baaki GATE qualify kiya ek yeh achievement tha.",
        "source": "Interview Transcript"
      },
      {
        "claim": "Agar aap shy rahenge, baat nahi karenge... Toh logon ki cheezein seekh nahi payenge, pakad nahi payenge.",
        "source": "Interview Transcript"
      },
      {
        "claim": "sabse bada rog kya kahenge log. Woh hota hai, aur woh nahi hona chahiye. Aur maine usko overcome kiya hai.",
        "source": "Interview Transcript"
      },
      {
        "claim": "ya toh woh kaam karo jo pasand karte ho... Ya phir jo kaam karte ho usko pasand karo. Toh tabhi 100% ho pata hai.",
        "source": "Interview Transcript"
      }
    ]
  },
  {
    "storyId": "lvl_age_19",
    "situationTags": [
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Mark Zuckerberg at age 19 navigating the visionary: At 19, Mark had to choose between Harvard and his side project.",
    "triggerPhrases": [
      "mark zuckerberg",
      "the visionary",
      "mark zuckerberg age 19",
      "big_decision"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Mark Zuckerberg at age 19 faced a pivotal choice in The Visionary — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_neeraj",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "isolation"
    ],
    "emotionalTags": [
      "lonely"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "risk",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Neeraj Chopra at age 19 navigating the lonely flight: At 19, Neeraj chose isolation over fame.",
    "triggerPhrases": [
      "neeraj chopra",
      "the lonely flight",
      "neeraj chopra age 19",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Neeraj Chopra at age 19 faced a pivotal choice in The Lonely Flight — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_shubman",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "high_stakes_pressure"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "risk",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Shubman Gill at age 19 navigating the prince: At 19, Shubman was named Player of the Tournament in the U-19 World Cup.",
    "triggerPhrases": [
      "shubman gill",
      "the prince",
      "shubman gill age 19",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Shubman Gill at age 19 faced a pivotal choice in The Prince — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_sachin",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "motivated"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "risk",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Sachin Tendulkar at age 19 navigating the trial of fire: At 19, you must face the most lethal fast bowlers on Earth.",
    "triggerPhrases": [
      "sachin tendulkar",
      "the trial of fire",
      "sachin tendulkar age 19",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Sachin Tendulkar at age 19 faced a pivotal choice in The Trial of Fire — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_sundar",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "high_stakes_pressure"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Sundar Pichai at age 19 navigating the divided mind: At 19, the pressure of IIT threatens to crush your curiosity.",
    "triggerPhrases": [
      "sundar pichai",
      "the divided mind",
      "sundar pichai age 19",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Sundar Pichai at age 19 faced a pivotal choice in The Divided Mind — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_srk",
    "situationTags": [
      "family_pressure"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Shah Rukh Khan at age 19 navigating a stage for grief: At 19, you lose your father and immerse yourself in the chaotic world of theatre.",
    "triggerPhrases": [
      "shah rukh khan",
      "a stage for grief",
      "shah rukh khan age 19",
      "family_pressure"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Shah Rukh Khan at age 19 faced a pivotal choice in A Stage For Grief — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_srk_2",
    "situationTags": [
      "family_pressure",
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Shah Rukh Khan at age 19 navigating leave delhi or stay: At 19, SRK must choose between family duty and the pull of Mumbai.",
    "triggerPhrases": [
      "shah rukh khan",
      "leave delhi or stay",
      "shah rukh khan age 19",
      "family_pressure"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Shah Rukh Khan at age 19 faced a pivotal choice in Leave Delhi or Stay — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_20_prajakta",
    "situationTags": [
      "career_uncertainty"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Prajakta Koli at age 20 navigating the 2 am panic: At 20, Prajakta quit her 10-year dream job for a risky YouTube career.",
    "triggerPhrases": [
      "prajakta koli",
      "the 2 am panic",
      "prajakta koli age 20",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Prajakta Koli at age 20 faced a pivotal choice in The 2 AM Panic — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_20_selena",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Selena Gomez at age 20 navigating the invisible war: At 20, Selena battled Lupus behind the perfect pop-star facade.",
    "triggerPhrases": [
      "selena gomez",
      "the invisible war",
      "selena gomez age 20",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Selena Gomez at age 20 faced a pivotal choice in The Invisible War — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_20_kobe",
    "situationTags": [
      "career_uncertainty"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "risk",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Kobe Bryant at age 20 navigating the mamba: At 20, Kobe chose the gym over the party.",
    "triggerPhrases": [
      "kobe bryant",
      "the mamba",
      "kobe bryant age 20",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Kobe Bryant at age 20 faced a pivotal choice in The Mamba — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_20_nv_sir",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "overcome",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Nitin Vijay (NV Sir) at age 20 navigating the educator\\: At 20, NV Sir chose teaching over immediate financial relief.",
    "triggerPhrases": [
      "nitin vijay (nv sir)",
      "the educator\\",
      "nitin vijay (nv sir) age 20",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Nitin Vijay (NV Sir) at age 20 faced a pivotal choice in The Educator\\ — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_20_music",
    "situationTags": [
      "career_uncertainty"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Taylor Swift at age 20 navigating the soloist: At 20, Taylor faced critics who said she had ghostwriters.",
    "triggerPhrases": [
      "taylor swift",
      "the soloist",
      "taylor swift age 20",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Taylor Swift at age 20 faced a pivotal choice in The Soloist — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_20_art",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Frida Kahlo at age 20 navigating the icon: At 20, Frida painted from her bed in pain.",
    "triggerPhrases": [
      "frida kahlo",
      "the icon",
      "frida kahlo age 20",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Frida Kahlo at age 20 faced a pivotal choice in The Icon — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "scenario_arnold_awol",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Arnold Schwarzenegger at age 20 navigating the awol gamble: At 20, Arnold escaped the army to chase a dream.",
    "triggerPhrases": [
      "arnold schwarzenegger",
      "the awol gamble",
      "arnold schwarzenegger age 20",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Arnold Schwarzenegger at age 20 faced a pivotal choice in The AWOL Gamble — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "scenario_hawking_diagnosis",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Stephen Hawking at age 20 navigating the death sentence: At 20, Stephen was given 2 years to live.",
    "triggerPhrases": [
      "stephen hawking",
      "the death sentence",
      "stephen hawking age 20",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Stephen Hawking at age 20 faced a pivotal choice in The Death Sentence — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_20_literature",
    "situationTags": [
      "starting_something"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Mary Shelley at age 20 navigating the monster\\: At 20, Mary wrote the first sci-fi novel during a storm.",
    "triggerPhrases": [
      "mary shelley",
      "the monster\\",
      "mary shelley age 20",
      "starting_something"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Mary Shelley at age 20 faced a pivotal choice in The Monster\\ — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_20_cinema",
    "situationTags": [
      "career_uncertainty"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Steven Spielberg at age 20 navigating the director: At 20, Steven sneaked into Universal Studios and pretended he worked there.",
    "triggerPhrases": [
      "steven spielberg",
      "the director",
      "steven spielberg age 20",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Steven Spielberg at age 20 faced a pivotal choice in The Director — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_20",
    "situationTags": [
      "confidence_low"
    ],
    "problemTags": [
      "lack_of_direction"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Bill Gates at age 20 navigating the architect: At 20, Bill saw the future and had to bluff his way into it.",
    "triggerPhrases": [
      "bill gates",
      "the architect",
      "bill gates age 20",
      "confidence_low"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Bill Gates at age 20 faced a pivotal choice in The Architect — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_21_sheeran_1",
    "situationTags": [
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Ed Sheeran at age 21 navigating the photo she might see: At 21, you must choose how to handle the painful intersection of a recent breakup and sudden public attention.",
    "triggerPhrases": [
      "ed sheeran",
      "the photo she might see",
      "ed sheeran age 21",
      "big_decision"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Ed Sheeran at age 21 faced a pivotal choice in The Photo She Might See — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_21_sheeran_2",
    "situationTags": [
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence",
      "understand_myself"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "pivot",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Ed Sheeran at age 21 navigating the people that still feel like home: At 21, you must decide what success is allowed to cost you in your personal life.",
    "triggerPhrases": [
      "ed sheeran",
      "the people that still feel like home",
      "ed sheeran age 21",
      "identity_question"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Ed Sheeran at age 21 faced a pivotal choice in The People That Still Feel Like Home — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_21_selena_1",
    "situationTags": [
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence",
      "understand_myself"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Selena Gomez at age 21 navigating when everyone has an opinion: At 21, you must choose how to handle the painful intersection of a recent relationship and sudden public attention.",
    "triggerPhrases": [
      "selena gomez",
      "when everyone has an opinion",
      "selena gomez age 21",
      "big_decision"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Selena Gomez at age 21 faced a pivotal choice in When Everyone Has an Opinion — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_21_selena_2",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Selena Gomez at age 21 navigating your own name: At 21, you must decide how much of the person people know is actually the person you want to become.",
    "triggerPhrases": [
      "selena gomez",
      "your own name",
      "selena gomez age 21",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Selena Gomez at age 21 faced a pivotal choice in Your Own Name — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_21_tanmay_1",
    "situationTags": [
      "career_uncertainty"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "overcome",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Tanmay Bhat at age 21 navigating should i really do this?: At 21, Tanmay Bhat enters the Mumbai stand-up comedy circuit, deciding how seriously to take his talent before having proof it will work.",
    "triggerPhrases": [
      "tanmay bhat",
      "should i really do this?",
      "tanmay bhat age 21",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Tanmay Bhat at age 21 faced a pivotal choice in Should I Really Do This? — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_21_tanmay_2",
    "situationTags": [
      "starting_something"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Tanmay Bhat at age 21 navigating the five minutes: At 21, Tanmay Bhat gets his first major breakthrough opportunity at the Weirdass Ham-ateur Night competition in Mumbai.",
    "triggerPhrases": [
      "tanmay bhat",
      "the five minutes",
      "tanmay bhat age 21",
      "starting_something"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Tanmay Bhat at age 21 faced a pivotal choice in The Five Minutes — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_21_michael_1",
    "situationTags": [
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence",
      "understand_myself"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "overcome",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Michael Jackson at age 21 navigating not just the jackson 5: At 21, Michael Jackson enters the Off the Wall era in Los Angeles, deciding how to shape his adult solo musical identity with Quincy Jones.",
    "triggerPhrases": [
      "michael jackson",
      "not just the jackson 5",
      "michael jackson age 21",
      "identity_question"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Michael Jackson at age 21 faced a pivotal choice in Not Just the Jackson 5 — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_21_michael_2",
    "situationTags": [
      "career_uncertainty"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "overcome",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Michael Jackson at age 21 navigating good enough or your best?: At 21, as the music takes shape, Michael Jackson faces the tension between continuous refinement and releasing his work.",
    "triggerPhrases": [
      "michael jackson",
      "good enough or your best?",
      "michael jackson age 21",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Michael Jackson at age 21 faced a pivotal choice in Good Enough or Your Best? — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_21_srk",
    "situationTags": [
      "career_uncertainty"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "leadership",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Shah Rukh Khan at age 21 navigating the role that could destroy you: At 21, SRK faces a villain role that could define or end his career.",
    "triggerPhrases": [
      "shah rukh khan",
      "the role that could destroy you",
      "shah rukh khan age 21",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Shah Rukh Khan at age 21 faced a pivotal choice in The Role That Could Destroy You — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_21",
    "situationTags": [
      "career_uncertainty",
      "starting_something"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "leadership",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Steve Jobs at age 21 navigating the rebel: At 21, Steve started a company in a garage with no money.",
    "triggerPhrases": [
      "steve jobs",
      "the rebel",
      "steve jobs age 21",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Steve Jobs at age 21 faced a pivotal choice in The Rebel — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Walt Disney at age 22 navigating the dreamer: At 22, Walt lost everything and drew a mouse on a train.",
    "triggerPhrases": [
      "walt disney",
      "the dreamer",
      "walt disney age 22",
      "career_uncertainty"
    ],
    "bestForMode": "continue",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Walt Disney at age 22 faced a pivotal choice in The Dreamer — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22_michael",
    "situationTags": [
      "career_uncertainty",
      "starting_something",
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Michael Jackson at age 22 navigating the life you built: At 22, Michael must balance the Triumph Tour with his brothers and his rising solo aspirations.",
    "triggerPhrases": [
      "michael jackson",
      "the life you built",
      "michael jackson age 22",
      "career_uncertainty"
    ],
    "bestForMode": "continue",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Michael Jackson at age 22 faced a pivotal choice in The Life You Built — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22_ashneer",
    "situationTags": [
      "career_uncertainty"
    ],
    "problemTags": [
      "lack_of_direction"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "leadership",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Ashneer Grover at age 22 navigating the next degree: At 22, Ashneer Grover stands between IIT Delhi and IIM Ahmedabad, deciding how to shape his career direction.",
    "triggerPhrases": [
      "ashneer grover",
      "the next degree",
      "ashneer grover age 22",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Ashneer Grover at age 22 faced a pivotal choice in The Next Degree — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22_bhuvan",
    "situationTags": [
      "career_uncertainty",
      "identity_question",
      "starting_something",
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "leadership",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Bhuvan Bam at age 22 navigating when the phone started working: At 22, Bhuvan Bam must choose between his original craft of music and the sudden explosive growth of BB Ki Vines.",
    "triggerPhrases": [
      "bhuvan bam",
      "when the phone started working",
      "bhuvan bam age 22",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Bhuvan Bam at age 22 faced a pivotal choice in When the Phone Started Working — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22_ronaldo",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "high_stakes_pressure"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "risk",
    "resolutionArchetype": "overcome",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Cristiano Ronaldo at age 22 navigating the price of becoming complete: At 22, Cristiano Ronaldo faces intense pressure to transform from a flamboyant young winger into a complete, decisive superstar.",
    "triggerPhrases": [
      "cristiano ronaldo",
      "the price of becoming complete",
      "cristiano ronaldo age 22",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Cristiano Ronaldo at age 22 faced a pivotal choice in The Price of Becoming Complete — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22_ranveer",
    "situationTags": [
      "exam_pressure"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "leadership",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Ranveer Singh at age 22 navigating the role you can\\: At 22, Ranveer Singh returns to Mumbai after studying in the US, figuring out how to build a runway toward acting.",
    "triggerPhrases": [
      "ranveer singh",
      "the role you can\\",
      "ranveer singh age 22",
      "exam_pressure"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Ranveer Singh at age 22 faced a pivotal choice in The Role You Can\\ — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22_alia",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Alia Bhatt at age 22 navigating more than a star: At 22, Alia Bhatt faces rising expectations after early success, deciding how to stretch her range beyond early acclaim.",
    "triggerPhrases": [
      "alia bhatt",
      "more than a star",
      "alia bhatt age 22",
      "career_uncertainty"
    ],
    "bestForMode": "continue",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Alia Bhatt at age 22 faced a pivotal choice in More Than a Star — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22_bhagat",
    "situationTags": [
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "empathy",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Bhagat Singh at age 22 navigating the price of a voice: At 22, Bhagat Singh fights for political prisoner rights from inside Lahore Central Jail and turns the court into a platform.",
    "triggerPhrases": [
      "bhagat singh",
      "the price of a voice",
      "bhagat singh age 22",
      "identity_question"
    ],
    "bestForMode": "continue",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Bhagat Singh at age 22 faced a pivotal choice in The Price of a Voice — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22_tanmay_1",
    "situationTags": [
      "starting_something",
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "overcome",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Tanmay Bhat at age 22 navigating just 200 people: At 22, Tanmay Bhat and Gursimran Khamba start the All India Bakchod podcast, aiming for 200 people in a room before knowing how big it would become.",
    "triggerPhrases": [
      "tanmay bhat",
      "just 200 people",
      "tanmay bhat age 22",
      "starting_something"
    ],
    "bestForMode": "continue",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Tanmay Bhat at age 22 faced a pivotal choice in Just 200 People — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22_tanmay_2",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Tanmay Bhat at age 22 navigating what if we go bigger?: At 22, the small podcast experiment begins exceeding original expectations as audiences grow.",
    "triggerPhrases": [
      "tanmay bhat",
      "what if we go bigger?",
      "tanmay bhat age 22",
      "career_uncertainty"
    ],
    "bestForMode": "continue",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Tanmay Bhat at age 22 faced a pivotal choice in What If We Go Bigger? — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_23_srk",
    "situationTags": [
      "career_uncertainty",
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s",
      "mid_20s"
    ],
    "ageMin": 18,
    "ageMax": 30,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Shah Rukh Khan at age 23 navigating gauri or career: At 23, SRK must choose between love and the career opportunity of a lifetime.",
    "triggerPhrases": [
      "shah rukh khan",
      "gauri or career",
      "shah rukh khan age 23",
      "career_uncertainty"
    ],
    "bestForMode": "continue",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Shah Rukh Khan at age 23 faced a pivotal choice in Gauri or Career — where {trait} guided their path.",
    "isPremium": true,
    "premiumTier": "aya_plus"
  },
  {
    "storyId": "lvl_age_23",
    "situationTags": [
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "motivated"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s",
      "mid_20s"
    ],
    "ageMin": 18,
    "ageMax": 30,
    "dominantTrait": "vision",
    "resolutionArchetype": "overcome",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Oprah Winfrey at age 23 navigating the voice: At 23, Oprah was fired for being too emotional. It was a gift.",
    "triggerPhrases": [
      "oprah winfrey",
      "the voice",
      "oprah winfrey age 23",
      "identity_question"
    ],
    "bestForMode": "continue",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Oprah Winfrey at age 23 faced a pivotal choice in The Voice — where {trait} guided their path.",
    "isPremium": true,
    "premiumTier": "aya_plus"
  },
  {
    "storyId": "scenario_upsc_tina_college",
    "situationTags": [
      "exam_pressure",
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s",
      "mid_20s"
    ],
    "ageMin": 18,
    "ageMax": 30,
    "dominantTrait": "empathy",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Tina Dabi at age 24 navigating the college sacrifice: At 21, Tina had to choose between social life and The Hindu.",
    "triggerPhrases": [
      "tina dabi",
      "the college sacrifice",
      "tina dabi age 24",
      "exam_pressure"
    ],
    "bestForMode": "continue",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Tina Dabi at age 24 faced a pivotal choice in The College Sacrifice — where {trait} guided their path.",
    "isPremium": true,
    "premiumTier": "aya_plus"
  },
  {
    "storyId": "lvl_age_25_srk",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s",
      "mid_20s"
    ],
    "ageMin": 18,
    "ageMax": 30,
    "dominantTrait": "creativity",
    "resolutionArchetype": "pivot",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Shah Rukh Khan at age 25 navigating mumbai is eating me alive: At 25, SRK is running out of money in Mumbai. One bet could change everything.",
    "triggerPhrases": [
      "shah rukh khan",
      "mumbai is eating me alive",
      "shah rukh khan age 25",
      "career_uncertainty"
    ],
    "bestForMode": "continue",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Shah Rukh Khan at age 25 faced a pivotal choice in Mumbai Is Eating Me Alive — where {trait} guided their path.",
    "isPremium": true,
    "premiumTier": "aya_plus"
  },
  {
    "storyId": "lvl_age_19_billie",
    "situationTags": [
      "feeling_stuck"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "creativity",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Billie Eilish at age 19 navigating fame is eating me alive: At 19, Billie won 5 Grammys and was falling apart inside.",
    "triggerPhrases": [
      "billie eilish",
      "fame is eating me alive",
      "billie eilish age 19",
      "feeling_stuck"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Billie Eilish at age 19 faced a pivotal choice in Fame Is Eating Me Alive — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_mrbeast",
    "situationTags": [
      "exam_pressure",
      "confidence_low"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "pivot",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about MrBeast at age 19 navigating drop out or keep uploading: At 19, Jimmy had 30K subscribers and a ridiculous idea. College apps were due tomorrow.",
    "triggerPhrases": [
      "mrbeast",
      "drop out or keep uploading",
      "mrbeast age 19",
      "exam_pressure"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. MrBeast at age 19 faced a pivotal choice in Drop Out or Keep Uploading — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_ritesh",
    "situationTags": [
      "career_uncertainty"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "leadership",
    "resolutionArchetype": "overcome",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Ritesh Agarwal at age 19 navigating the dropout founder: At 19, Ritesh had ₹2,000, a dropout status, and a world-changing idea.",
    "triggerPhrases": [
      "ritesh agarwal",
      "the dropout founder",
      "ritesh agarwal age 19",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Ritesh Agarwal at age 19 faced a pivotal choice in The Dropout Founder — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_ali",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Muhammad Ali at age 19 navigating throw the medal away: At 19, Ali won Olympic gold — then was refused service at a restaurant because of his race.",
    "triggerPhrases": [
      "muhammad ali",
      "throw the medal away",
      "muhammad ali age 19",
      "career_uncertainty"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Muhammad Ali at age 19 faced a pivotal choice in Throw The Medal Away — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_20_dhruv",
    "situationTags": [
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "leadership",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Dhruv Rathee at age 20 navigating germany or india: At 20, an engineering scholar in Germany felt India needed his voice more than his degree.",
    "triggerPhrases": [
      "dhruv rathee",
      "germany or india",
      "dhruv rathee age 20",
      "identity_question"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Dhruv Rathee at age 20 faced a pivotal choice in Germany or India — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_falguni",
    "situationTags": [
      "career_uncertainty"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "motivated"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "leadership",
    "resolutionArchetype": "overcome",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Falguni Nayar at age 19 navigating science or business: At 19 at IIM Ahmedabad, Falguni had a fire inside her — but the world said wait.",
    "triggerPhrases": [
      "falguni nayar",
      "science or business",
      "falguni nayar age 19",
      "career_uncertainty"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Falguni Nayar at age 19 faced a pivotal choice in Science or Business — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_tesla",
    "situationTags": [
      "identity_question"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Nikola Tesla at age 19 navigating trust your visions: At 19, Tesla\\",
    "triggerPhrases": [
      "nikola tesla",
      "trust your visions",
      "nikola tesla age 19",
      "identity_question"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Nikola Tesla at age 19 faced a pivotal choice in Trust Your Visions — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22_rani_lakshmibai",
    "situationTags": [
      "feeling_stuck"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Rani Lakshmibai at age 22 navigating the silent palace: At 22, the Queen of Jhansi faces the death of her infant son and an empire waiting to take her kingdom.",
    "triggerPhrases": [
      "rani lakshmibai",
      "the silent palace",
      "rani lakshmibai age 22",
      "feeling_stuck"
    ],
    "bestForMode": "continue",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Rani Lakshmibai at age 22 faced a pivotal choice in The Silent Palace — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_11_virat_kohli",
    "situationTags": [
      "big_decision"
    ],
    "problemTags": [
      "uncertainty",
      "proving_oneself"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "teen"
    ],
    "ageMin": 13,
    "ageMax": 18,
    "dominantTrait": "risk",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Virat Kohli at age 11 navigating the extra hour: At 11, young Virat Kohli trains at West Delhi Cricket Academy, facing decisions between raw instinct and disciplined technical correction.",
    "triggerPhrases": [
      "virat kohli",
      "the extra hour",
      "virat kohli age 11",
      "big_decision"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Virat Kohli at age 11 faced a pivotal choice in The Extra Hour — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_25",
    "situationTags": [
      "career_uncertainty",
      "identity_question"
    ],
    "problemTags": [
      "isolation"
    ],
    "emotionalTags": [
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s",
      "mid_20s"
    ],
    "ageMin": 18,
    "ageMax": 30,
    "dominantTrait": "vision",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "courage",
      "resilience",
      "identity"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about J.K. Rowling at age 25 navigating the storyteller: At 25, J.K. Rowling got the idea for Harry Potter on a delayed train.",
    "triggerPhrases": [
      "j.k. rowling",
      "the storyteller",
      "j.k. rowling age 25",
      "career_uncertainty"
    ],
    "bestForMode": "continue",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. J.K. Rowling at age 25 faced a pivotal choice in The Storyteller — where {trait} guided their path.",
    "isPremium": true,
    "premiumTier": "aya_plus"
  },
  {
    "storyId": "lvl_age_20_modi",
    "situationTags": [
      "purpose",
      "starting_with_little",
      "discipline",
      "career_uncertainty"
    ],
    "problemTags": [
      "unfulfilled_by_work",
      "spiritual_vs_practical",
      "security_vs_service",
      "uncertainty"
    ],
    "emotionalTags": [
      "restless",
      "seeking",
      "determined",
      "conflicted"
    ],
    "intentTags": [
      "find_direction",
      "build_discipline",
      "courage_to_commit"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 16,
    "ageMax": 25,
    "dominantTrait": "purpose",
    "resolutionArchetype": "action_step",
    "lessonTags": [
      "purpose",
      "discipline",
      "service",
      "courage",
      "resilience"
    ],
    "difficulty": 3,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Narendra Modi at age 20 navigating the canteen and the calling: At 20, working in a bus depot canteen after two years in the Himalayas, torn between monastic life, business security, and full-time national service.",
    "triggerPhrases": [
      "narendra modi",
      "the canteen and the calling",
      "narendra modi age 20",
      "purpose",
      "starting_with_little",
      "discipline",
      "pracharak",
      "canteen"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Narendra Modi at age 20 faced a pivotal choice in The Canteen and the Calling — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_16_srk",
    "situationTags": [
      "feeling_alone",
      "family_pressure",
      "financial_stress",
      "discipline"
    ],
    "problemTags": [
      "sudden_death_parent",
      "unexpected_financial_emotional_burden",
      "dealing_with_profound_grief"
    ],
    "emotionalTags": [
      "sad",
      "lonely",
      "determined"
    ],
    "intentTags": [
      "process_how_i_feel",
      "courage_to_commit"
    ],
    "lifeStageTags": [
      "late_teens"
    ],
    "ageMin": 15,
    "ageMax": 18,
    "dominantTrait": "resilience",
    "resolutionArchetype": "persistence",
    "lessonTags": [
      "resilience",
      "persistence",
      "courage"
    ],
    "difficulty": 5,
    "relatability": 3,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Shahrukh Khan at age 16 dealing with the sudden death of his father, feeling alone, and channeling profound grief into extreme drive to win the Sword of Honour.",
    "triggerPhrases": [
      "shahrukh khan",
      "the sword of honour",
      "father died",
      "feeling alone",
      "grief",
      "srk"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Shahrukh Khan at age 16 faced a pivotal choice in The Sword of Honour — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_16_jordan",
    "situationTags": [
      "failure_setback",
      "comparing_to_others",
      "discipline",
      "starting_with_little"
    ],
    "problemTags": [
      "cut_from_varsity",
      "rejected_for_peer",
      "public_humiliation"
    ],
    "emotionalTags": [
      "sad",
      "frustrated",
      "determined"
    ],
    "intentTags": [
      "challenge_myself",
      "build_confidence"
    ],
    "lifeStageTags": [
      "late_teens"
    ],
    "ageMin": 15,
    "ageMax": 18,
    "dominantTrait": "discipline",
    "resolutionArchetype": "persistence",
    "lessonTags": [
      "discipline",
      "persistence",
      "resilience"
    ],
    "difficulty": 3,
    "relatability": 5,
    "era": "historical",
    "culturalContext": "global",
    "semanticDescription": "A story about Michael Jordan at age 16 getting cut from the varsity basketball roster and channeling the pain and public humiliation into relentless daily practice on the junior varsity team.",
    "triggerPhrases": [
      "michael jordan",
      "the roster",
      "cut from team",
      "varsity basketball",
      "junior varsity",
      "failure_setback"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Michael Jordan at age 16 faced a pivotal choice in The Roster — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_16_taylor",
    "situationTags": [
      "big_decision",
      "career_uncertainty",
      "starting_something_new",
      "feeling_stuck",
      "finding_purpose"
    ],
    "problemTags": [
      "undervalued_by_institution",
      "security_vs_creative_control",
      "risking_family_investment"
    ],
    "emotionalTags": [
      "frustrated",
      "hopeful",
      "determined",
      "conflicted"
    ],
    "intentTags": [
      "challenge_myself",
      "courage_to_commit"
    ],
    "lifeStageTags": [
      "late_teens"
    ],
    "ageMin": 15,
    "ageMax": 18,
    "dominantTrait": "risk",
    "resolutionArchetype": "courage",
    "lessonTags": [
      "risk",
      "courage",
      "authenticity",
      "vision"
    ],
    "difficulty": 3,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Taylor Swift at age 16 turning down a major label development deal that would keep her shelved until 18, choosing instead the immense risk of releasing authentic songs with an unproven indie startup.",
    "triggerPhrases": [
      "taylor swift",
      "the development deal",
      "big decision",
      "record label",
      "big machine records",
      "nashville songwriting"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Taylor Swift at age 16 faced a pivotal choice in The Development Deal — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_16_billie",
    "situationTags": [
      "identity_question",
      "career_uncertainty",
      "starting_something",
      "big_decision",
      "creative_block"
    ],
    "problemTags": [
      "industry_pressure_to_conform",
      "protecting_creative_intimacy",
      "balancing_hit_vs_authenticity"
    ],
    "emotionalTags": [
      "anxious",
      "conflicted",
      "restless",
      "determined"
    ],
    "intentTags": [
      "courage_to_commit",
      "find_direction"
    ],
    "lifeStageTags": [
      "late_teens"
    ],
    "ageMin": 15,
    "ageMax": 18,
    "dominantTrait": "risk",
    "resolutionArchetype": "courage",
    "lessonTags": [
      "risk",
      "courage",
      "authenticity",
      "creativity"
    ],
    "difficulty": 3,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "global",
    "semanticDescription": "A story about Billie Eilish at age 16 rejecting massive LA recording studios and hit-making producers, choosing the risk of recording in her brother's tiny childhood bedroom to protect her authentic sound.",
    "triggerPhrases": [
      "billie eilish",
      "the bedroom studio",
      "figuring out who i am",
      "bedroom recording",
      "finneas",
      "debut album"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Billie Eilish at age 16 faced a pivotal choice in The Bedroom Studio — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_16_bhagat",
    "situationTags": [
      "family_pressure",
      "purpose",
      "big_decision",
      "identity_question",
      "starting_something"
    ],
    "problemTags": [
      "family_marriage_pressure",
      "domestic_safety_vs_revolution",
      "sacrificing_comfort_for_cause"
    ],
    "emotionalTags": [
      "conflicted",
      "determined",
      "seeking"
    ],
    "intentTags": [
      "courage_to_commit",
      "find_direction"
    ],
    "lifeStageTags": [
      "late_teens"
    ],
    "ageMin": 15,
    "ageMax": 18,
    "dominantTrait": "vision",
    "resolutionArchetype": "courage",
    "lessonTags": [
      "vision",
      "courage",
      "purpose",
      "discipline"
    ],
    "difficulty": 4,
    "relatability": 4,
    "era": "historical",
    "culturalContext": "indian",
    "semanticDescription": "A story about Bhagat Singh at age 16 facing immense family pressure to marry, choosing instead to leave a letter on his desk and flee to Kanpur to dedicate his life entirely to India's freedom struggle.",
    "triggerPhrases": [
      "bhagat singh",
      "the letter on the desk",
      "family pressure",
      "marriage pressure",
      "kanpur",
      "lahore"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Bhagat Singh at age 16 faced a pivotal choice in The Letter on the Desk — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_16_aujla",
    "situationTags": [
      "starting_with_little",
      "financial_stress",
      "loneliness",
      "big_decision",
      "starting_something"
    ],
    "problemTags": [
      "orphan_no_safety_net",
      "family_support_vs_immigrant_risk",
      "funding_music_with_manual_labor"
    ],
    "emotionalTags": [
      "lonely",
      "determined",
      "hopeful"
    ],
    "intentTags": [
      "courage_to_commit",
      "find_direction"
    ],
    "lifeStageTags": [
      "late_teens"
    ],
    "ageMin": 15,
    "ageMax": 18,
    "dominantTrait": "resilience",
    "resolutionArchetype": "persistence",
    "lessonTags": [
      "resilience",
      "persistence",
      "discipline",
      "creativity"
    ],
    "difficulty": 4,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Karan Aujla at age 16 surviving as an orphan and choosing the brutal immigrant longshoreman grind in Canada to independently fund his breakthrough music career.",
    "triggerPhrases": [
      "karan aujla",
      "the cargo grind",
      "starting from the bottom",
      "surrey canada",
      "punjabi music",
      "dock worker"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Karan Aujla at age 16 faced a pivotal choice in The Cargo Grind — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_17_aujla",
    "situationTags": [
      "failure_setback",
      "career_uncertainty",
      "starting_something",
      "feeling_stuck",
      "identity_question",
      "starting_with_little"
    ],
    "problemTags": [
      "debut_project_flops",
      "facing_public_indifference",
      "ghostwriting_vs_lead_singing"
    ],
    "emotionalTags": [
      "frustrated",
      "confused",
      "determined",
      "motivated"
    ],
    "intentTags": [
      "challenge_myself",
      "courage_to_commit",
      "find_direction"
    ],
    "lifeStageTags": [
      "late_teens"
    ],
    "ageMin": 16,
    "ageMax": 19,
    "dominantTrait": "resilience",
    "resolutionArchetype": "persistence",
    "lessonTags": [
      "resilience",
      "persistence",
      "humility",
      "discipline"
    ],
    "difficulty": 3,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Karan Aujla at age 17 experiencing the humiliating flop of his debut single 'Cell Phone' and choosing to aggressively improve his vocals instead of retreating to safe ghostwriting.",
    "triggerPhrases": [
      "karan aujla",
      "the failed debut",
      "cell phone song",
      "recent failure",
      "flop project",
      "ghostwriting"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Karan Aujla at age 17 faced a pivotal choice in The Failed Debut — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_18_aujla",
    "situationTags": [
      "career_uncertainty",
      "financial_stress",
      "discipline",
      "loneliness",
      "failure_setback",
      "feeling_stuck"
    ],
    "problemTags": [
      "labor_vs_creative_schedule",
      "recovering_from_flop",
      "extreme_burnout_physical_exhaustion"
    ],
    "emotionalTags": [
      "burnout",
      "conflicted",
      "determined",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "courage_to_commit"
    ],
    "lifeStageTags": [
      "late_teens"
    ],
    "ageMin": 17,
    "ageMax": 20,
    "dominantTrait": "discipline",
    "resolutionArchetype": "persistence",
    "lessonTags": [
      "discipline",
      "persistence",
      "resilience",
      "creativity"
    ],
    "difficulty": 4,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Karan Aujla at age 18 enduring extreme burnout and physical exhaustion, working dock shifts by day and recording in the basement studio with Deep Jandu by night to make his breakthrough comeback.",
    "triggerPhrases": [
      "karan aujla",
      "the double shift",
      "deep jandu",
      "career uncertainty",
      "dock worker burnout",
      "basement studio grind"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Karan Aujla at age 18 faced a pivotal choice in The Double Shift — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_19_aujla",
    "situationTags": [
      "career_transition",
      "career_uncertainty",
      "feeling_stuck",
      "starting_something",
      "financial_stress",
      "big_decision"
    ],
    "problemTags": [
      "boxed_into_support_role",
      "immediate_cash_vs_artistic_branding",
      "writer_to_performer_transition"
    ],
    "emotionalTags": [
      "conflicted",
      "frustrated",
      "determined",
      "motivated"
    ],
    "intentTags": [
      "find_direction",
      "challenge_myself"
    ],
    "lifeStageTags": [
      "late_teens"
    ],
    "ageMin": 17,
    "ageMax": 21,
    "dominantTrait": "vision",
    "resolutionArchetype": "action_step",
    "lessonTags": [
      "vision",
      "patience",
      "strategy",
      "compromise",
      "creativity"
    ],
    "difficulty": 3,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Karan Aujla at age 19 choosing between selling a guaranteed hit song for quick cash or strategically negotiating a featured vocal verse to launch his solo singing career.",
    "triggerPhrases": [
      "karan aujla",
      "the ghostwriter's dilemma",
      "career transition",
      "ghostwriting",
      "featured verse",
      "punjabi music lyricist"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Karan Aujla at age 19 faced a pivotal choice in The Ghostwriter's Dilemma — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_21_aujla",
    "situationTags": [
      "big_decision",
      "career_transition",
      "starting_something",
      "identity_question",
      "career_uncertainty"
    ],
    "problemTags": [
      "risking_underground_credibility",
      "niche_vs_mainstream_appeal",
      "blending_clashing_genres"
    ],
    "emotionalTags": [
      "conflicted",
      "motivated",
      "hopeful"
    ],
    "intentTags": [
      "challenge_myself",
      "courage_to_commit"
    ],
    "lifeStageTags": [
      "early_twenties"
    ],
    "ageMin": 19,
    "ageMax": 23,
    "dominantTrait": "risk",
    "resolutionArchetype": "courage",
    "lessonTags": [
      "risk",
      "courage",
      "vision",
      "creativity",
      "authenticity"
    ],
    "difficulty": 2,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Karan Aujla at age 21 risking his underground street credibility to blend gritty hip-hop with traditional Punjabi folk vocals on 'Don't Worry', achieving a massive global breakthrough.",
    "triggerPhrases": [
      "karan aujla",
      "the crossover gamble",
      "dont worry song",
      "gurlez akhtar",
      "genre fusion",
      "mainstream breakthrough"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Karan Aujla at age 21 faced a pivotal choice in The Crossover Gamble — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22_aujla",
    "situationTags": [
      "career_transition",
      "financial_stress",
      "big_decision",
      "career_uncertainty",
      "comparing_myself",
      "discipline"
    ],
    "problemTags": [
      "proving_first_hit_not_fluke",
      "staying_afloat_without_label",
      "boxed_as_songwriter_only"
    ],
    "emotionalTags": [
      "determined",
      "restless",
      "hopeful",
      "anxious"
    ],
    "intentTags": [
      "courage_to_commit",
      "find_direction"
    ],
    "lifeStageTags": [
      "early_twenties"
    ],
    "ageMin": 20,
    "ageMax": 24,
    "dominantTrait": "risk",
    "resolutionArchetype": "persistence",
    "lessonTags": [
      "risk",
      "persistence",
      "discipline",
      "authenticity",
      "courage"
    ],
    "difficulty": 3,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Karan Aujla at age 22 navigating the post-breakout quiet stretch in Surrey, BC, declining safe ghostwriting deals to stake his own name on 'Chitta Kurta'.",
    "triggerPhrases": [
      "karan aujla",
      "the name nobody knew yet",
      "chitta kurta",
      "post-breakout grind",
      "one-hit wonder",
      "surrey bc studio"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Karan Aujla at age 22 faced a pivotal choice in The Name Nobody Knew Yet — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_18_moosewala",
    "situationTags": [
      "family_pressure",
      "career_uncertainty",
      "academic_pressure",
      "identity_question",
      "starting_something",
      "purpose",
      "discipline"
    ],
    "problemTags": [
      "family_expectations_safe_career",
      "engineering_workload_vs_secret_music",
      "village_to_city_culture_shock"
    ],
    "emotionalTags": [
      "conflicted",
      "restless",
      "determined"
    ],
    "intentTags": [
      "find_direction",
      "courage_to_commit"
    ],
    "lifeStageTags": [
      "late_teens"
    ],
    "ageMin": 17,
    "ageMax": 20,
    "dominantTrait": "discipline",
    "resolutionArchetype": "persistence",
    "lessonTags": [
      "discipline",
      "persistence",
      "duty",
      "authenticity",
      "creativity"
    ],
    "difficulty": 3,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Siddhu Moosewala at age 18 moving from Moosa village to study Electrical Engineering in Ludhiana, balancing his parents' degree expectations while secretly writing a legendary vault of lyrics.",
    "triggerPhrases": [
      "siddhu moosewala",
      "sidhu moose wala",
      "the engineering vault",
      "electrical engineering",
      "moosa village",
      "ludhiana college"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Siddhu Moosewala at age 18 faced a pivotal choice in The Engineering Vault — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_23_moosewala",
    "situationTags": [
      "starting_with_little",
      "career_uncertainty",
      "financial_stress",
      "loneliness",
      "starting_something",
      "big_decision",
      "identity_question"
    ],
    "problemTags": [
      "immigrant_student_survival",
      "manual_labor_to_pay_bills",
      "tuition_vs_music_gamble"
    ],
    "emotionalTags": [
      "lonely",
      "burnout",
      "determined",
      "hopeful"
    ],
    "intentTags": [
      "courage_to_commit",
      "find_direction"
    ],
    "lifeStageTags": [
      "early_twenties"
    ],
    "ageMin": 21,
    "ageMax": 25,
    "dominantTrait": "risk",
    "resolutionArchetype": "action_step",
    "lessonTags": [
      "risk",
      "courage",
      "persistence",
      "independence",
      "creativity"
    ],
    "difficulty": 4,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Siddhu Moosewala at age 23 in Brampton, Canada working grueling manual labor and gambling his tuition savings to fund his solo debut track 'G-Wagon'.",
    "triggerPhrases": [
      "siddhu moosewala",
      "sidhu moose wala",
      "the brampton hustle",
      "g wagon",
      "brampton canada",
      "international student"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Siddhu Moosewala at age 23 faced a pivotal choice in The Brampton Hustle — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_22_moosewala",
    "situationTags": [
      "career_transition",
      "career_uncertainty",
      "starting_something",
      "family_pressure",
      "big_decision",
      "identity_question"
    ],
    "problemTags": [
      "abandoning_engineering_degree",
      "local_comfort_vs_international_struggle",
      "taking_massive_student_debt"
    ],
    "emotionalTags": [
      "conflicted",
      "determined",
      "anxious",
      "hopeful"
    ],
    "intentTags": [
      "find_direction",
      "courage_to_commit"
    ],
    "lifeStageTags": [
      "early_twenties"
    ],
    "ageMin": 20,
    "ageMax": 24,
    "dominantTrait": "risk",
    "resolutionArchetype": "action_step",
    "lessonTags": [
      "risk",
      "courage",
      "independence",
      "vision",
      "authenticity"
    ],
    "difficulty": 3,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Siddhu Moosewala at age 22 graduating with an Electrical Engineering degree and choosing to take on heavy student loans to move to Canada on a one-way ticket to chase music.",
    "triggerPhrases": [
      "siddhu moosewala",
      "sidhu moose wala",
      "the one-way ticket",
      "engineering graduate",
      "move to canada",
      "humber college"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Siddhu Moosewala at age 22 faced a pivotal choice in The One-Way Ticket — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_16_bhuvan",
    "situationTags": [
      "parents_vs_own_path",
      "career_uncertainty",
      "starting_with_little",
      "discipline"
    ],
    "problemTags": [
      "average_academic_scores",
      "parental_pressure_education",
      "financial_insecurity_arts"
    ],
    "emotionalTags": [
      "anxious",
      "frustrated",
      "determined"
    ],
    "intentTags": [
      "find_courage_non_traditional_path",
      "find_direction",
      "courage_to_commit"
    ],
    "lifeStageTags": [
      "late_teens"
    ],
    "ageMin": 15,
    "ageMax": 20,
    "dominantTrait": "discipline",
    "resolutionArchetype": "action_step",
    "lessonTags": [
      "discipline",
      "courage",
      "persistence",
      "compromise",
      "passion"
    ],
    "difficulty": 3,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Bhuvan Bam at age 16 navigating the night shift stage: At 16, scoring 74% in Class 12, balancing parental pressure for commerce with late-night restaurant music gigs.",
    "triggerPhrases": [
      "bhuvan bam",
      "the night shift stage",
      "bhuvan bam age 16",
      "parents_vs_own_path",
      "class 12",
      "board exams",
      "guitar",
      "delhi restaurant"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Bhuvan Bam at age 16 faced a pivotal choice in The Night Shift Stage — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_16_virat_kohli",
    "situationTags": [
      "big_decision",
      "loneliness",
      "purpose",
      "discipline"
    ],
    "problemTags": [
      "sudden_death_of_parent",
      "profound_personal_grief_team_dependency",
      "family_tragedy",
      "team_dependency"
    ],
    "emotionalTags": [
      "numb",
      "sad",
      "conflicted",
      "determined"
    ],
    "intentTags": [
      "get_inspired",
      "courage_to_commit"
    ],
    "lifeStageTags": [
      "late_teens"
    ],
    "ageMin": 15,
    "ageMax": 20,
    "dominantTrait": "resilience",
    "resolutionArchetype": "courage",
    "lessonTags": [
      "discipline",
      "courage",
      "resilience",
      "duty",
      "grief"
    ],
    "difficulty": 5,
    "relatability": 4,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Virat Kohli at age 16 facing the sudden death of his father at 2:30 AM before walking out to score a vital 90 for Delhi.",
    "triggerPhrases": [
      "virat kohli",
      "the morning at kotla",
      "virat kohli age 16",
      "big_decision",
      "feroz shah kotla",
      "father death",
      "ranji trophy",
      "delhi vs karnataka"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Virat Kohli at age 16 faced a pivotal choice in The Morning at Kotla — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_21_virat_kohli",
    "situationTags": [
      "failure_setback",
      "career_uncertainty",
      "discipline",
      "feeling_stuck",
      "starting_with_little"
    ],
    "problemTags": [
      "dropped_from_national_team",
      "media_criticism",
      "sophomore_slump",
      "proving_oneself"
    ],
    "emotionalTags": [
      "frustrated",
      "angry",
      "determined",
      "motivated"
    ],
    "intentTags": [
      "challenge_myself",
      "build_confidence"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 18,
    "ageMax": 25,
    "dominantTrait": "discipline",
    "resolutionArchetype": "persist",
    "lessonTags": [
      "humility",
      "discipline",
      "resilience",
      "ownership",
      "persistence"
    ],
    "difficulty": 3,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Virat Kohli at age 21 navigating being dropped from the national team, battling critics, and earning his recall through a match-winning century in Australia.",
    "triggerPhrases": [
      "virat kohli",
      "the ego check",
      "virat kohli age 21",
      "failure_setback",
      "dropped",
      "emerging players",
      "australia 2009",
      "century"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Virat Kohli at age 21 faced a pivotal choice in The Ego Check — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  },
  {
    "storyId": "lvl_age_18_pratosh",
    "situationTags": [
      "starting_something",
      "career_uncertainty",
      "feeling_stuck",
      "discipline",
      "identity_question"
    ],
    "problemTags": [
      "lack_of_real_world_awareness",
      "navigating_newfound_freedom",
      "false_security_of_academics",
      "academic_comfort_trap"
    ],
    "emotionalTags": [
      "confused",
      "curious",
      "seeking"
    ],
    "intentTags": [
      "find_direction",
      "challenge_myself"
    ],
    "lifeStageTags": [
      "teen",
      "college"
    ],
    "ageMin": 18,
    "ageMax": 24,
    "dominantTrait": "initiative",
    "resolutionArchetype": "action_step",
    "lessonTags": [
      "initiative",
      "real_world_awareness",
      "industry_exposure",
      "action_step"
    ],
    "difficulty": 2,
    "relatability": 5,
    "era": "1990s",
    "culturalContext": "indian",
    "semanticDescription": "A story about Pratosh Bansal at age 18 navigating The Classroom Illusion: navigating the first year of an engineering degree with newfound freedom, facing the choice between standard classroom syllabus comfort versus stepping out to gain real-world industry exposure.",
    "triggerPhrases": [
      "pratosh bansal",
      "the classroom illusion",
      "pratosh bansal age 18",
      "starting_something",
      "college freedom",
      "engineering degree",
      "industry exposure"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Pratosh Bansal at age 18 faced a pivotal choice in The Classroom Illusion — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null,
    "sources": [
      {
        "claim": "first year ya second year mein mujhe lagta hai ki aur industry exposure lena chahiye tha.",
        "source": "Interview Transcript, 2026"
      },
      {
        "claim": "jab aap ek open environment mein aa jaate hain, toh bahut saari aapko freedom mil jaati hai.",
        "source": "Interview Transcript, 2026"
      },
      {
        "claim": "So main classroom teaching toh definitely achhe se karta tha...",
        "source": "Interview Transcript, 2026"
      },
      {
        "claim": "aap miss karte ho usko, toh aapko aage thodi struggle zyada ho jaati hai.",
        "source": "Interview Transcript, 2026"
      }
    ]
  },
  {
    "storyId": "lvl_age_21_pratosh",
    "situationTags": [
      "career_uncertainty",
      "confidence_low",
      "comparison_trap",
      "identity_question",
      "purpose"
    ],
    "problemTags": [
      "fear_of_judgment",
      "extreme_shyness",
      "social_anxiety",
      "career_direction"
    ],
    "emotionalTags": [
      "anxious",
      "conflicted",
      "seeking"
    ],
    "intentTags": [
      "build_confidence",
      "courage_to_commit"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 20,
    "ageMax": 24,
    "dominantTrait": "courage",
    "resolutionArchetype": "reframe",
    "lessonTags": [
      "courage",
      "confidence",
      "communication",
      "passion",
      "dedication"
    ],
    "difficulty": 2,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Pratosh Bansal at age 21 confronting extreme shyness, fear of judgment, and learning to either do what you love or choose to love what you do.",
    "triggerPhrases": [
      "pratosh bansal",
      "the opinion trap",
      "pratosh bansal age 21",
      "branch topper",
      "gate",
      "shyness",
      "kya kahenge log"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Pratosh Bansal at age 21 faced a pivotal choice in The Opinion Trap — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null,
    "sources": [
      {
        "claim": "I topped in my seventh semester, so I was branch topper... Baaki GATE qualify kiya ek yeh achievement tha.",
        "source": "Interview Transcript"
      },
      {
        "claim": "Agar aap shy rahenge, baat nahi karenge... Toh logon ki cheezein seekh nahi payenge, pakad nahi payenge.",
        "source": "Interview Transcript"
      },
      {
        "claim": "sabse bada rog kya kahenge log. Woh hota hai, aur woh nahi hona chahiye. Aur maine usko overcome kiya hai.",
        "source": "Interview Transcript"
      },
      {
        "claim": "ya toh woh kaam karo jo pasand karte ho... Ya phir jo kaam karte ho usko pasand karo. Toh tabhi 100% ho pata hai.",
        "source": "Interview Transcript"
      }
    ]
  },
  {
    "storyId": "lvl_age_22_pratosh",
    "situationTags": [
      "identity_question",
      "confidence_low",
      "comparison_trap",
      "feeling_stuck",
      "career_uncertainty",
      "purpose"
    ],
    "problemTags": [
      "fear_of_social_judgment",
      "lack_of_internal_acceptance",
      "worrying_about_opinions",
      "social_paralysis"
    ],
    "emotionalTags": [
      "anxious",
      "restless",
      "seeking",
      "conflicted"
    ],
    "intentTags": [
      "understand_myself",
      "build_confidence",
      "process_emotion"
    ],
    "lifeStageTags": [
      "early_20s"
    ],
    "ageMin": 21,
    "ageMax": 26,
    "dominantTrait": "courage",
    "resolutionArchetype": "reframe",
    "lessonTags": [
      "courage",
      "acceptance",
      "authenticity",
      "internal_conviction",
      "freedom"
    ],
    "difficulty": 2,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Pratosh Bansal at age 22 navigating the paralyzing fear of what people will say, attending an Art of Living course, and discovering true acceptance through right intentions.",
    "triggerPhrases": [
      "pratosh bansal",
      "the biggest disease",
      "pratosh bansal age 22",
      "kya kahenge log",
      "what people will say",
      "art of living",
      "acceptance",
      "right intentions"
    ],
    "bestForMode": "support",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Pratosh Bansal at age 22 faced a pivotal choice in The Biggest Disease — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null,
    "sources": [
      {
        "claim": "yeh acceptance wali baat hai... that I learned very late.",
        "source": "Interview Transcript"
      },
      {
        "claim": "mere intention theek hain, toh mujhe lagta hai main usse kabhi galat sabit hota bhi nahi hoon.",
        "source": "Interview Transcript"
      },
      {
        "claim": "koi dusra agar kuch bolta bhi hai... main usse sehmat nahi hota, lekin main aage badh jata hoon.",
        "source": "Interview Transcript"
      },
      {
        "claim": "Yeh 25-26 saal pehle jab maine Art of Living course join kiya tha... Us samay yeh baat mere ko thodi understanding aayi.",
        "source": "Interview Transcript"
      },
      {
        "claim": "samasya hoti hai logon ke saath ki jo log bolte hain na ki sabse bada rog kya kahenge log... maine usko overcome kiya hai.",
        "source": "Interview Transcript"
      }
    ]
  },
  {
    "storyId": "lvl_age_20_pratosh",
    "situationTags": [
      "starting_something",
      "career_uncertainty",
      "feeling_stuck",
      "discipline",
      "identity_question"
    ],
    "problemTags": [
      "lack_of_real_world_awareness",
      "navigating_newfound_freedom",
      "false_security_of_academics",
      "academic_comfort_trap"
    ],
    "emotionalTags": [
      "confused",
      "curious",
      "seeking"
    ],
    "intentTags": [
      "find_direction",
      "challenge_myself",
      "build_confidence"
    ],
    "lifeStageTags": [
      "college",
      "early_20s"
    ],
    "ageMin": 19,
    "ageMax": 24,
    "dominantTrait": "initiative",
    "resolutionArchetype": "action_step",
    "lessonTags": [
      "initiative",
      "awareness",
      "real_world_skills",
      "stepping_out",
      "discipline"
    ],
    "difficulty": 2,
    "relatability": 5,
    "era": "modern",
    "culturalContext": "indian",
    "semanticDescription": "A story about Pratosh Bansal at age 20, an engineering student navigating newfound freedom and the trap of classroom comfort, learning that true awareness requires actively stepping out.",
    "triggerPhrases": [
      "pratosh bansal",
      "classroom comfort",
      "college freedom",
      "syllabus trap",
      "industry exposure",
      "pratosh bansal age 20",
      "engineering student"
    ],
    "bestForMode": "challenge",
    "whyThisStoryTemplate": "You are dealing with {user_problem}. Pratosh Bansal at age 20 faced the classroom illusion — where {trait} guided their path.",
    "isPremium": false,
    "premiumTier": null
  }
];

/** Quick lookup: storyId → StoryMetadata */
export const STORY_METADATA_MAP: Record<string, StoryMetadata> = Object.fromEntries(
  STORY_METADATA.map(m => [m.storyId, m])
);

/**
 * Returns stories matching the given situation tag.
 * Primary: situationTags. Secondary: problemTags, intentTags.
 */
export function getStoriesForSituation(situationTag: string): StoryMetadata[] {
  const tag = situationTag.toLowerCase();
  return STORY_METADATA.filter(m =>
    m.situationTags.some(t => t.toLowerCase() === tag) ||
    m.problemTags.some(t => t.toLowerCase() === tag) ||
    m.intentTags.some(t => t.toLowerCase() === tag)
  );
}

/**
 * Returns a Set of storyIds matching a situation tag.
 * Use in LevelMap to filter levels without any network request.
 */
export function getStoryIdsForSituation(situationTag: string): Set<string> {
  return new Set(getStoriesForSituation(situationTag).map(m => m.storyId));
}

/**
 * Returns metadata for a single story by its storyId (= scenarioId).
 * Returns undefined if no metadata exists for that storyId.
 */
export function getStoryMetadata(storyId: string | undefined | null): StoryMetadata | undefined {
  if (!storyId) return undefined;
  return STORY_METADATA_MAP[storyId];
}
