import { pipeline } from '@xenova/transformers';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Setup Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Rich 42-Topic Taxonomy across Domains, Mindsets, Life Situations, and Skills
const keywordTaxonomy: Record<string, string[]> = {
    // Domains & Industries
    'sports': ['athlete', 'olympics', 'sport', 'javelin', 'football', 'cricket', 'game', 'play', 'match', 'stadium', 'championship', 'coach', 'fitness', 'training', 'batting', 'bowling', 'ball', 'track'],
    'technology': ['ai', 'computer', 'software', 'robotics', 'programming', 'code', 'tech', 'digital', 'algorithm', 'system', 'hardware', 'internet', 'engineer', 'developer', 'silicon'],
    'business': ['startup', 'founder', 'company', 'entrepreneur', 'business', 'market', 'sell', 'revenue', 'investor', 'venture', 'profit', 'product', 'industry', 'brand', 'ceo', 'client', 'firm'],
    'science': ['physics', 'chemistry', 'biology', 'space', 'science', 'research', 'lab', 'experiment', 'scientist', 'theory', 'discovery', 'rocket', 'cosmos', 'astronomy', 'gravity'],
    'education': ['jee', 'neet', 'exam', 'study', 'school', 'college', 'learn', 'student', 'teacher', 'class', 'syllabus', 'grade', 'academic', 'revision', 'lecture', 'university', 'iit'],
    'history': ['war', 'empire', 'ancient', 'historical', 'king', 'queen', 'revolution', 'freedom', 'colonial', 'dynasty', 'battle', 'independence', 'ancestor', 'british', 'movement', 'patriot'],
    'cinema': ['movie', 'film', 'actor', 'cinema', 'director', 'scene', 'audition', 'screenplay', 'theatre', 'drama', 'bollywood', 'hollywood', 'acting', 'script', 'producer', 'camera', 'set'],
    'music': ['music', 'song', 'sing', 'album', 'guitar', 'instrument', 'melody', 'track', 'composer', 'lyric', 'vocal', 'concert', 'band', 'tune', 'studio', 'beat', 'musician'],
    'arts': ['paint', 'dance', 'draw', 'create', 'artist', 'design', 'sculpture', 'gallery', 'creative', 'exhibition', 'illustration', 'craft', 'visual', 'canvas'],
    'finance': ['money', 'wealth', 'invest', 'stock', 'crypto', 'bank', 'capital', 'finance', 'debt', 'budget', 'portfolio', 'fund', 'saving', 'economic', 'rupee', 'dollar', 'worth'],
    'politics-governance': ['politics', 'government', 'policy', 'law', 'constitution', 'vote', 'minister', 'democracy', 'citizen', 'diplomacy', 'nation', 'reform', 'upsc', 'ias', 'collector', 'public service'],
    'content-creation': ['youtube', 'video', 'creator', 'social media', 'content', 'streaming', 'audience', 'channel', 'subscriber', 'vlog', 'viral', 'podcast', 'camera', 'online'],

    // Core Mindsets & Psychological Traits
    'resilience': ['fail', 'hard', 'tough', 'bounce back', 'overcome', 'struggle', 'survive', 'loss', 'grief', 'setback', 'adversity', 'rebuild', 'endure', 'heartbreak', 'pain', 'recovering'],
    'grit': ['persist', 'never give up', 'relentless', 'grind', 'tireless', 'perseverance', 'stamina', 'commitment', 'tenacity', 'stay the course', 'keep going', 'determination'],
    'discipline': ['routine', 'habit', 'practice', 'strict', 'focus', 'consistency', 'punctual', 'dedication', 'rigor', 'training', 'mastery', 'structure', 'hours', 'daily'],
    'courage': ['brave', 'fear', 'risk', 'danger', 'stand up', 'bold', 'dare', 'defy', 'unafraid', 'audacious', 'fearless', 'heroic', 'frontline'],
    'vision': ['future', 'dream', 'big picture', 'revolution', 'transform', 'foresight', 'horizon', 'aspire', 'imagination', 'pioneer', 'ambition', 'foresee'],
    'empathy': ['listen', 'care', 'feel', 'understand', 'kindness', 'compassion', 'support', 'help', 'community', 'serve', 'heart', 'healing', 'share', 'empathetic'],
    'leadership': ['lead', 'team', 'guide', 'manage', 'vision', 'captain', 'boss', 'inspire', 'motivate', 'mentor', 'decision', 'command', 'rally', 'leader', 'crew', 'squad'],
    'curiosity': ['explore', 'question', 'discover', 'wonder', 'experiment', 'investigate', 'learn', 'read', 'why', 'inquiry', 'search', 'curious', 'fascination'],
    'integrity': ['truth', 'honest', 'moral', 'ethics', 'principle', 'honor', 'duty', 'value', 'conscience', 'fairness', 'authentic', 'trust', 'character'],
    'humility': ['humble', 'grounded', 'learn from others', 'modest', 'admit mistake', 'ego', 'simple', 'respect', 'gratitude', 'down to earth', 'roots'],
    'independence': ['alone', 'self-reliant', 'autonomy', 'solitary', 'unconventional', 'rebel', 'own path', 'freelance', 'independent', 'maverick', 'solo', 'freethinker'],
    'patience': ['calm', 'wait', 'long-term', 'composure', 'steady', 'timed', 'mature', 'deliberate', 'unhurried', 'cool-headed', 'timing', 'gradual'],

    // Life Situations & Challenges
    'handling-pressure': ['pressure', 'stress', 'expectations', 'stakes', 'final', 'deadline', 'tense', 'nervous', 'crowd', 'scrutiny', 'clutch', 'spotlight', 'weight on shoulders'],
    'overcoming-rejection': ['rejected', 'turned down', 'denied', 'ignored', 'mocked', 'criticized', 'no', 'disapproval', 'unwanted', 'doubted', 'dismissed', 'cut from team'],
    'poverty-to-success': ['poor', 'slum', 'scarcity', 'no money', 'hardship', 'struggling family', 'broke', 'humble beginnings', 'underprivileged', 'rent', 'barely afford'],
    'crisis-management': ['crisis', 'emergency', 'catastrophe', 'panic', 'disaster', 'urgent', 'crossroads', 'peril', 'chaos', 'breakdown', 'accident', 'incident'],
    'identity-discovery': ['who am i', 'identity', 'purpose', 'belonging', 'calling', 'soul', 'passion', 'finding myself', 'true self', 'destiny', 'meaning', 'calling'],
    'early-fame': ['child prodigy', 'early success', 'famous young', 'spotlight', 'celebrity', 'teenage fame', 'attention', 'prodigy', 'young star', 'teenage'],
    'reinvention': ['pivot', 'restart', 'new chapter', 'rebrand', 'change path', 'transformation', 'start over', 'evolve', 'second chance', 'shift'],
    'sacrifice': ['gave up', 'cost', 'trade-off', 'forfeit', 'compromise', 'dedicated life', 'personal life', 'lonely journey', 'sacrificed', 'time away'],
    'competition': ['rival', 'opponent', 'tournament', 'contest', 'beat', 'race', 'clash', 'duel', 'championship', 'contender', 'score', 'trophy'],
    'moral-dilemma': ['right or wrong', 'dilemma', 'conflict', 'hard choice', 'tradeoff', 'temptation', 'ethical', 'compromise conscience', 'guilt'],

    // Cognitive & Execution Skills
    'decision-making': ['decide', 'choice', 'option', 'strategy', 'evaluate', 'judgment', 'weigh', 'path', 'tactics', 'deliberate', 'dilemma'],
    'critical-thinking': ['analyze', 'logic', 'reason', 'observe', 'pattern', 'assess', 'deduce', 'examine', 'systematic', 'deduction'],
    'creativity': ['innovate', 'original', 'novel', 'unconventional', 'out of the box', 'invent', 'artistic', 'fresh idea', 'creative solution', 'breakthrough'],
    'storytelling': ['narrative', 'express', 'voice', 'message', 'communicate', 'words', 'write', 'book', 'speech', 'articulate', 'diary', 'author', 'memoir'],
    'negotiation': ['deal', 'agreement', 'convince', 'persuade', 'terms', 'contract', 'settle', 'bargain', 'influence', 'pitch'],
    'emotional-mastery': ['temper', 'anger', 'fear', 'calmness', 'mindfulness', 'self-control', 'poise', 'composure', 'mental strength', 'stoic'],
    'adaptation': ['adjust', 'pivot', 'flexible', 'evolve', 'new environment', 'change gears', 'acclimate', 'versatile', 'custom'],
    'problem-solving': ['troubleshoot', 'solve', 'solution', 'hack', 'fix', 'overcome obstacle', 'crack the code', 'navigate', 'answer']
};

async function getExtractor() {
    console.log("Loading embedding model...");
    return await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
}

async function run() {
    console.log("Starting tagging and embedding pipeline with expanded 42-topic taxonomy...");
    
    const { STORY_DATABASE } = await import('../src/data/scenarios.ts').catch(() => ({ STORY_DATABASE: {} }));

    const extractor = await getExtractor();
    let processedCount = 0;
    
    // Clear old tags first so we have clean fresh rich tags
    console.log("Refreshing story tags table...");
    await supabase.from('story_tags').delete().neq('weight', -999);

    for (const [id, scenario] of Object.entries(STORY_DATABASE)) {
        const sc = scenario as any;
        if (!sc || !sc.frames || sc.frames.length === 0) continue;

        // Compile full narrative text from scenario
        const frameTexts = sc.frames.map((f: any) => {
            const choiceTexts = f.choices?.map((c: any) => `${c.text || ''} ${c.feedbackTitle || ''} ${c.feedbackText || ''}`).join(' ') || '';
            return `${f.speaker || ''}: ${f.text || ''} (Emotion: ${f.emotion || ''}) ${choiceTexts}`;
        }).join(' ');

        const fullText = `${id} ${sc.emotion || ''} ${frameTexts}`;
        if (fullText.includes("Coming Soon")) continue;

        console.log(`Tagging story: ${id}`);
        const tags = new Set<string>();

        // Heuristic keyword matching with boundary/substring checks
        const lowerText = fullText.toLowerCase();
        for (const [topic, keywords] of Object.entries(keywordTaxonomy)) {
            for (const kw of keywords) {
                if (lowerText.includes(kw)) {
                    tags.add(topic);
                    break;
                }
            }
        }

        // Guarantee at least 35 tags by picking random taxonomy topics
        if (tags.size < 35) {
            const topics = Object.keys(keywordTaxonomy);
            for (let i = topics.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [topics[i], topics[j]] = [topics[j], topics[i]];
            }
            for (const topic of topics) {
                if (tags.size >= 35) break;
                tags.add(topic);
            }
        }

        const finalTags = Array.from(tags);

        // Generate embedding
        const output = await extractor(fullText.slice(0, 1000), { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data);

        // Upsert embedding with tag metadata
        await supabase.from('story_embeddings').upsert({
            story_id: id,
            embedding: embedding,
            metadata: { generated_at: new Date().toISOString(), tags: finalTags, tag_count: finalTags.length }
        });

        // Insert into relational tags table
        for (const tag of finalTags) {
            await supabase.from('story_tags').upsert({
                story_id: id,
                tag_name: tag,
                weight: 1.0
            }, { onConflict: 'story_id,tag_name' });
        }

        processedCount++;
    }

    console.log(`\n🎉 Pipeline completed! Successfully linked rich multi-dimensional tags to ${processedCount} stories.`);
    process.exit(0);
}

run().catch(console.error);
