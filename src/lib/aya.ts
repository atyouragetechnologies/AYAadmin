/**
 * AYA landing page configuration + content.
 *
 * GAME_ROUTE points at the EXISTING AYA game. Change this one constant to
 * re-point every "START YOUR JOURNEY" CTA on the landing page.
 */
export const GAME_ROUTE = "/game/index.html";

export const INCUBATION_LINE = "Incubated at ACE FOUNDATION IIT INDORE";

/** Relatable situations â†’ how AYA reframes them through real journeys. */
export const REFRAMES: { you: string; aya: string }[] = [
  {
    you: "I don't know what I'm good at.",
    aya: "Let's see how someone who once felt uncertain discovered their strengths.",
  },
  {
    you: "I feel behind.",
    aya: "At your age, they hadn't started either. Here's what changed.",
  },
  {
    you: "I failed.",
    aya: "Someone remarkable failed too. What did they do next?",
  },
  {
    you: "I don't know what to choose.",
    aya: "Watch how one person narrowed six options down to one.",
  },
  {
    you: "I've lost motivation.",
    aya: "Their motivation broke too. Here's what carried them through it.",
  },
  {
    you: "I don't know where I'm going.",
    aya: "Nobody had a map. Let's look at how theirs got drawn.",
  },
];

export const FLOW_NODES = [
  { label: "YOUR ANSWERS", note: "What you pick, skip and linger on." },
  { label: "YOUR PATTERNS", note: "How you decide, again and again." },
  { label: "YOUR STRENGTHS", note: "What you keep doing well." },
  { label: "YOUR MATCHES", note: "Journeys that feel like yours." },
  { label: "YOUR DISCOVERIES", note: "Things you didn't know you knew." },
];

export const JOURNEY_STEPS = [
  { n: "01", title: "DISCOVER YOURSELF", copy: "A few questions. No right answers." },
  { n: "02", title: "MEET THEIR JOURNEYS", copy: "People at exactly the age you are." },
  { n: "03", title: "UNDERSTAND YOUR PATTERNS", copy: "AYA notices how you choose." },
  { n: "04", title: "DISCOVER YOUR POSSIBILITIES", copy: "Strengths you show, not claim." },
  { n: "05", title: "FIND YOUR DIRECTION", copy: "Where those strengths could lead." },
];

export const OUTCOMES = [
  { n: "01", title: "PERSPECTIVE", copy: "See your age differently." },
  { n: "02", title: "INSPIRATION", copy: "Learn from people who faced real challenges." },
  { n: "03", title: "SELF-DISCOVERY", copy: "Understand your strengths and patterns." },
  { n: "04", title: "DIRECTION", copy: "Explore possibilities that may fit who you are." },
];

export const DISCOVERY_FACETS = [
  "personality",
  "strengths",
  "interests",
  "decision-making",
  "mindset",
  "preferences",
];

export const CAREER_FIELDS = [
  "Technology",
  "Design",
  "Business",
  "Research",
  "Media",
  "Leadership",
  "Science",
  "Creative Fields",
];

/**
 * Idol carousel data. These are placeholder-shaped records â€” swap this array
 * for real personality data from the game backend without touching the UI.
 */
export type Idol = {
  name: string;
  age: string;
  doing: string;
  challenge: string;
  lesson: string;
  avatarUrl?: string;
};

export const IDOLS: Idol[] = [
  {
    name: "Virat Kohli",
    age: "18",
    doing: "Playing domestic cricket, trying to break into the national side.",
    challenge: "Facing the sudden loss of his father during a crucial Ranji Trophy match.",
    lesson: "Turning personal grief into an unstoppable, aggressive focus on the pitch.",
    avatarUrl: "/assets/avatar_virat_kohli.webp"
  },
  {
    name: "Steve Jobs",
    age: "20",
    doing: "Dropping in on calligraphy classes after officially dropping out of college.",
    challenge: "Having no clear career path, sleeping on friends' floors, returning bottles for food.",
    lesson: "Trusting your curiosity; the dots will connect in your future.",
    avatarUrl: "/assets/avatar_steve_jobs.webp"
  },
  {
    name: "Taylor Swift",
    age: "16",
    doing: "Releasing her debut album and pitching herself to radio stations.",
    challenge: "Being told a teenage girl writing her own country songs had no market.",
    lesson: "Authentic, raw storytelling is your greatest leverage.",
    avatarUrl: "/assets/avatar_taylor_swift.webp"
  },
  {
    name: "Dr. A.P.J. Abdul Kalam",
    age: "22",
    doing: "Studying engineering with dreams of flying fighter jets.",
    challenge: "Failing the Air Force exam by securing 9th place when only 8 slots existed.",
    lesson: "A closed door often forces a better, more impactful destiny.",
    avatarUrl: "/assets/avatar_apj_kalam.webp"
  },
  {
    name: "J.K. Rowling",
    age: "25",
    doing: "Sitting on a delayed train from Manchester to London.",
    challenge: "Stuck in a dead-end job, dealing with loss, writing ideas on scraps of paper.",
    lesson: "Your imagination is the only foundation you need to start building.",
    avatarUrl: "/assets/avatar_jk_rowling.webp"
  },
  {
    name: "Sundar Pichai",
    age: "21",
    doing: "Moving to Stanford with a ticket costing more than his father's annual salary.",
    challenge: "Navigating a completely foreign environment with severely limited resources.",
    lesson: "Quiet, analytical curiosity can bridge any geographical or social gap.",
    avatarUrl: "/assets/avatar_sundar.webp"
  },
  {
    name: "Kobe Bryant",
    age: "18",
    doing: "Drafted into the NBA straight out of high school.",
    challenge: "Shooting four consecutive airballs in the crucial moments of a playoff game.",
    lesson: "Letting failure fuel an absolute obsession with practice and preparation.",
    avatarUrl: "/assets/avatar_kobe.webp"
  },
  {
    name: "Ratan Tata",
    age: "24",
    doing: "Working on the shop floor of Tata Steel in Jamshedpur.",
    challenge: "Being the heir to an empire but shoveling limestone with blue-collar workers.",
    lesson: "True leadership begins by understanding the ground reality of your people.",
    avatarUrl: "/assets/avatar_ratan_tata.webp"
  }
];
export interface Milestone {
  title: string;
  context: string;
  tag: string;
  image: string;
}

export const MILESTONES: Milestone[] = [
  {
    title: 'Official Incorporation',
    context: 'Most see a poster on a wall; I see years of belief. ATYOURAGE TECHNOLOGIES PRIVATE LIMITED is officially incorporated. This is Day One.',
    tag: 'Incorporation',
    image: '/images/incorporation.webp',
  },
  {
    title: 'Incubated at ACE FOUNDATION IIT INDORE',
    context: "I didn't enter IIT as a student—I entered as a Founder. My startup, NayiDisha Technologies, is officially INCUBATED at ACE FOUNDATION IIT INDORE.",
    tag: 'Milestone',
    image: '/images/iit-indore-incubation.webp',
  },
  {
    title: 'Thinking Like a Founder',
    context: 'Wrapped an intense 5-day Entrepreneurship Workshop by the ACE Foundation at IIT Indore. Honored to receive my certificate from Prof. Mobin Shaikh.',
    tag: 'Growth',
    image: '/images/ace-foundation.webp',
  },
  {
    title: 'The E-Summit at IIT Bombay',
    context: "Showcasing AtYourAge at IIT Bombay and interacting with Vamsi Krishnan (Co-founder, Vedantu), who told me: 'Rakshit, you are lucky that you love doing your work. Many are not.'",
    tag: 'Networking',
    image: '/images/iit-bombay-esummit.webp',
  },
  {
    title: 'Practical Clarity',
    context: 'An inspiring meeting with Gautam Yadav, Founder & CEO of Innogent Technologies. Grateful for the sharp, practical mentorship that brought stronger direction to my journey.',
    tag: 'Mentorship',
    image: '/images/gautam-yadav.webp',
  },
  {
    title: 'Global Conversations',
    context: 'Taking a dream from India to a power-packed discussion with Harvard Prof. Ellen Langer and NYU Stern Prof. Philip Maymin. They asked to stay updated with our progress.',
    tag: 'Scaling',
    image: '/images/harvard-nyu.webp',
  },
  {
    title: 'The MANIT Offer Letter',
    context: 'A dream taking shape. Received the official offer letter from the Incubation Cell of MANIT Bhopal. A moment of pride, gratitude, and responsibility.',
    tag: 'Incubation',
    image: '/images/manit-offer.webp',
  },
  {
    title: 'Pitching at MANIT Bhopal',
    context: 'Excited to pitch my EdTech startup At Your Age under NayiDisha Technologies at the Rolta Innovation & Incubation Foundation, MANIT Bhopal.',
    tag: 'Pitching',
    image: '/images/manit-pitch.webp',
  },
  {
    title: 'Visionary Inspiration',
    context: 'Interacting with Padma Shri Prof. Anil Kumar Gupta. His visionary thoughts on grassroots entrepreneurship and nurturing young ideas left me deeply inspired.',
    tag: 'Inspiration',
    image: '/images/prof-anil.webp',
  },
  {
    title: 'Mentorship from IIT Bombay',
    context: 'An engaging discussion with Prof. Ravi Poovaiah from IIT Bombay, who shared valuable insights to refine and grow the idea further.',
    tag: 'Refinement',
    image: '/images/prof-ravi.webp',
  },
  {
    title: 'Words from a Pioneer',
    context: 'Represented Dr. Kiran Mazumdar-Shaw at Youth Parliament. Received a personal note from her reminding me that entrepreneurship is about purpose, grit, and ignoring the naysayers.',
    tag: 'Validation',
    image: '/images/kiran-mazumdar-shaw.webp',
  },
  {
    title: 'The First Hackathon',
    context: 'Stepping into Smart India Hackathon (SIH 2025). We walked in with just an idea and walked out stronger, motivated, and ready for much bigger challenges.',
    tag: 'Taking the Step',
    image: '/images/hackathon.webp',
  },
  {
    title: 'The IIT Pivot',
    context: 'Failing to clear JEE Advanced felt like the doors were closed. Less than 2 months later, I was standing inside IIT Indore—not as a student, but invited to share the vision for At Your Age.',
    tag: 'Resilience',
    image: '/images/iit-indore.webp',
  }
];
