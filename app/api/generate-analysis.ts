// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';

function translateTag(tag: string): string {
    const map: Record<string, string> = {
        'exam_pressure': "the high pressure and stress around exams",
        'career_uncertainty': "uncertainty and doubt about your career direction",
        'heartbreak': "healing after an emotional breakup or loss",
        'loneliness': "feeling isolated or alone right now",
        'anxiety': "overthinking and persistent anxiety",
        'relationship_issues': "tensions or conflicts in your relationships",
        'confusion': "feeling stuck and unsure which path to choose",
        'frustration': "frustration when things are not going according to plan",
        'career_transition': "the intimidating shift into a new field or career",
        'high_pressure_burnout': "exhaustion from relentless pressure and burnout",
        'risk_vs_safety': "the tension between taking a bold leap or playing it safe",
        'creative_block': "feeling creatively drained or blocked",
        'imposter_syndrome': "feeling like you do not belong or are not good enough",
        'social_anxiety': "feeling self-conscious and anxious around others",
        'loss_of_motivation': "struggling to find the drive to keep pushing",
        'anxious': "anxiety and worry",
        'frustrated': "deep frustration",
        'lost': "feeling adrift without clear direction",
        'unmotivated': "a dip in energy and motivation",
        'overwhelmed': "feeling completely overwhelmed by demands"
    };
    if (map[tag]) return map[tag];
    return tag.replace(/_/g, ' ');
}

// Multi-variant dynamic generator ensuring non-repetitive, high-quality responses
function buildDynamicInsight(params: {
    character: string;
    storyTitle: string;
    storyLesson?: string;
    storyChallenge?: string;
    userChoice: string;
    consequence?: string;
    translatedTags: string;
}): string[] {
    const { character, storyTitle, storyLesson, userChoice, consequence, translatedTags } = params;
    const cleanCharacter = character && character !== 'Default' ? character : 'this trailblazer';
    const tagText = translatedTags || 'a difficult crossroads';

    const part1Variations = [
        `When ${cleanCharacter} faced moments of heavy uncertainty, they did not rely on luck. In ${storyTitle || 'this story'}, they cut through doubt by committing entirely to their craft and refusing to let external panic dictate their decisions.`,
        `Faced with ${tagText}, ${cleanCharacter} proved that breakthrough moments come from decisive action. During ${storyTitle || 'this journey'}, they leaned into discipline and took ownership of what they could control.`,
        `Navigating ${tagText} requires the exact courage ${cleanCharacter} demonstrated. When their back was against the wall in ${storyTitle || 'this scenario'}, they chose long-term conviction over temporary comfort.`
    ];

    const part2Variations = [
        `When you chose "${userChoice}", it revealed your instinct to step up rather than retreat.${consequence ? ` ${consequence}` : ''} That aligns directly with the mindset ${cleanCharacter} used to push through obstacles.`,
        `Your decision to go with "${userChoice}" shows how you naturally weigh risks when the stakes are real.${consequence ? ` ${consequence}` : ''} Recognizing this instinct is key to mastering your reactions.`,
        `Opting for "${userChoice}" reflects a proactive approach.${consequence ? ` ${consequence}` : ''} Like ${cleanCharacter}, you chose to shape the outcome rather than passively watch it unfold.`
    ];

    const part3Variations = [
        `To handle ${tagText} right now, break your problem into the one decision you can make today. Focus purely on execution, block out the noise, and trust your momentum.`,
        `Your playbook for ${tagText} is simple: take the hardest necessary step first, protect your focus, and remember that clarity follows action, not overthinking.`,
        `Apply ${cleanCharacter}'s principle to your life today: don't wait for ideal conditions. Make your move with conviction, learn from the feedback, and keep pushing forward.`
    ];

    const rand1 = part1Variations[Math.floor(Math.random() * part1Variations.length)];
    const rand2 = part2Variations[Math.floor(Math.random() * part2Variations.length)];
    const rand3 = part3Variations[Math.floor(Math.random() * part3Variations.length)];

    return [rand1, rand2, rand3];
}

export const config = {
    maxDuration: 30
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const origin = (req.headers.origin as string) || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            body = {};
        }
    }

    const {
        tags,
        storyTitle,
        storyLesson,
        storyChallenge,
        character,
        userChoice,
        userChoiceConsequence,
        userAge,
        userTraits
    } = body || {};

    const translatedTags = (tags || []).map((t: string) => translateTag(t)).join(' and ') || 'a challenging situation';
    const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || process.env.GROQ_KEY;

    if (!groqKey) {
        console.warn('[AYA] GROQ_API_KEY not found in environment, returning dynamic heuristic analysis');
        const parts = buildDynamicInsight({
            character,
            storyTitle,
            storyLesson,
            storyChallenge,
            userChoice,
            consequence: userChoiceConsequence,
            translatedTags
        });
        return res.status(200).json({ parts });
    }

    try {
        const prompt = `You are a sharp, empathetic life mentor speaking directly to a young person after they finished an interactive historical scenario.
Your goal is to provide a fresh, original, deeply insightful 3-part reflection. DO NOT use generic platitudes. Speak specifically about how the historical figure resolved this dilemma, connect it to the user's choice, and provide an actionable strategy.

CONTEXT:
• User's real-life challenge: ${translatedTags}
• Character: ${character}
• Story: ${storyTitle}
• Scenario Challenge: ${storyChallenge || 'A pivotal career or life crossroads'}
• Historical Resolution/Lesson: ${storyLesson || 'Took decisive action with grit and unwavering commitment'}
• User's exact choice in the scenario: "${userChoice}"
• Choice Consequence: "${userChoiceConsequence || 'Navigated the moment'}"
• User age: ${userAge || 'young adult'}

INSTRUCTIONS FOR THE 3 PARTS:
PART 1 (The Historical Breakthrough): Explain specifically how ${character} fixed or navigated this type of challenge (${translatedTags}) through their real decisions, mindset, or tactics in ${storyTitle}.
PART 2 (The User's Decision Analysis): Connect their choice ("${userChoice}") to ${character}'s mindset. Highlight what this choice reveals about their instincts under pressure and whether it is an effective reaction.
PART 3 (Actionable Strategy for User): Give a concrete, direct, practical method on how the user can apply ${character}'s decision-making framework in their own life today to overcome ${translatedTags}.

STRICT FORMAT & STYLE RULES:
1. Output MUST be valid JSON with a single key "parts" containing an array of EXACTLY 3 strings.
2. Each part must be 2-3 punchy, conversational sentences (30-50 words each).
3. NO markdown, NO asterisks, NO dashes, NO emojis, NO quotes around words, NO bullet points, NO labels (e.g. do not write "Part 1:").
4. Never repeat stock clichés like "Remember, every decision...". Speak like a real perceptive friend giving genuine advice.`;

        const groqController = new AbortController();
        const groqTimeoutId = setTimeout(() => groqController.abort(), 2000);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            signal: groqController.signal,
            headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: 'You are an authentic, perceptive mentor. You never use clichés. You output ONLY valid JSON without markdown formatting.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.85,
                presence_penalty: 0.25,
                frequency_penalty: 0.15,
                max_tokens: 300,
            })
        });

        clearTimeout(groqTimeoutId);

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            console.warn('[AYA] Groq API non-200 response:', response.status, errText);
            const parts = buildDynamicInsight({
                character,
                storyTitle,
                storyLesson,
                storyChallenge,
                userChoice,
                consequence: userChoiceConsequence,
                translatedTags
            });
            return res.status(200).json({ parts });
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        
        let cleanContent = rawContent.trim();
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        }
        const firstBrace = cleanContent.indexOf('{');
        const lastBrace = cleanContent.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(cleanContent);

        if (!parsed.parts || !Array.isArray(parsed.parts) || parsed.parts.length !== 3) {
            const parts = buildDynamicInsight({
                character,
                storyTitle,
                storyLesson,
                storyChallenge,
                userChoice,
                consequence: userChoiceConsequence,
                translatedTags
            });
            return res.status(200).json({ parts });
        }

        // Clean any leftover markdown or unwanted formatting
        parsed.parts = parsed.parts.map((p: string) => p.replace(/[*_#\-~]/g, '').trim());

        return res.status(200).json(parsed);
    } catch (error) {
        console.warn('[AYA] Analysis generation error, returning dynamic fallback:', error);
        const parts = buildDynamicInsight({
            character,
            storyTitle,
            storyLesson,
            storyChallenge,
            userChoice,
            consequence: userChoiceConsequence,
            translatedTags
        });
        return res.status(200).json({ parts });
    }
}
