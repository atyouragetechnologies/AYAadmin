import { useMemo, useState } from 'react';
import {
    Dna, Award, ShieldCheck, Heart, Copy, Check, TrendingUp,
    UserCheck, Briefcase, BookOpen, Flame, Star, Lightbulb,
    Zap, Eye, Users, Trophy, Rocket
} from 'lucide-react';
import { audioManager as audioSynth } from '../../utils/audioManager';
import { useUserStore } from '../../store/userStore';
import { calculateCognitiveDissonance } from '../../utils/gapAnalysis';
import { generateLevels } from '../../utils/levelGenerator';
import { isAyaPlusUser } from '../../services/accessControl';
import { Lock } from 'lucide-react';

// ─── Pentagon Radar Chart (pure SVG, no external libs) ────────────────────────
function RadarChart({ traits }: { traits: { label: string; value: number; color: string }[] }) {
    // Shifted centre slightly upward so the top label (Risk) and bottom labels
    // (Empathy / Vision) all sit comfortably inside the taller viewBox.
    const cx = 150, cy = 142, r = 86;
    const n = traits.length;
    const LABEL_DIST = r + 30; // distance from centre to label anchor

    const point = (i: number, frac: number) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return { x: cx + r * frac * Math.cos(angle), y: cy + r * frac * Math.sin(angle) };
    };
    const labelPoint = (i: number) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return { x: cx + LABEL_DIST * Math.cos(angle), y: cy + LABEL_DIST * Math.sin(angle) };
    };

    const rings = [0.25, 0.5, 0.75, 1.0];
    const ringPaths = rings.map(frac =>
        traits.map((_, i) => point(i, frac))
              .map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1))
              .join(' ') + ' Z'
    );
    const dataPts  = traits.map((t, i) => point(i, t.value / 100));
    const dataPath = dataPts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ') + ' Z';

    return (
        // viewBox is 300 × 300 with a 12px padding guard on every side
        <svg viewBox="-12 -10 324 306" className="w-full max-w-[280px] mx-auto select-none" style={{ aspectRatio: '324/306' }}>
            <defs>
                <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="#00f2ff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#d575ff" stopOpacity={0.25} />
                </linearGradient>
            </defs>

            {/* Grid rings */}
            {ringPaths.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={i === rings.length - 1 ? 1.5 : 1} />
            ))}

            {/* Axis spokes */}
            {traits.map((_, i) => {
                const o = point(i, 1);
                return <line key={i} x1={cx} y1={cy} x2={o.x.toFixed(1)} y2={o.y.toFixed(1)} stroke="rgba(255,255,255,0.10)" strokeWidth={1} />;
            })}

            {/* Filled polygon */}
            <path d={dataPath} fill="url(#radarFill)" stroke="#00f2ff" strokeWidth={2} strokeLinejoin="round" />

            {/* Dots */}
            {dataPts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4.5} fill={traits[i].color} stroke="#0d0d16" strokeWidth={2} />
            ))}

            {/* Labels — trait name above, score below */}
            {traits.map((t, i) => {
                const lp = labelPoint(i);
                return (
                    <g key={i}>
                        <text x={lp.x} y={lp.y - 6} textAnchor="middle" dominantBaseline="middle"
                              fill="rgba(255,255,255,0.85)" fontSize={8.5} fontWeight="700" fontFamily="ui-sans-serif,sans-serif"
                              style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {t.label}
                        </text>
                        <text x={lp.x} y={lp.y + 8} textAnchor="middle" dominantBaseline="middle"
                              fill={t.color} fontSize={11} fontWeight="900" fontFamily="ui-monospace,monospace">
                            {t.value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
interface GenomicReportCardProps { username?: string; }

export function GenomicReportCard({ username: propUsername }: GenomicReportCardProps) {
    const profile = useUserStore((state) => state.profile);
    const [copied, setCopied] = useState(false);

    const activeUsername = propUsername || profile?.username || profile?.name || 'Aarav';

    // Core traits blend
    const finalTraits = useMemo(() => {
        const t = profile?.traits || { risk: 50, creativity: 50, vision: 50, empathy: 50, leadership: 50 };
        return {
            risk:       Math.round(t.risk       ?? 50),
            creativity: Math.round(t.creativity ?? 50),
            vision:     Math.round(t.vision     ?? 50),
            empathy:    Math.round(t.empathy    ?? 50),
            leadership: Math.round(t.leadership ?? 50),
        };
    }, [profile?.traits]);

    const storyCount    = profile?.stories_completed ?? 0;
    const totalXp       = profile?.total_xp          ?? 0;
    const currentStreak = profile?.current_streak    ?? 0;

    // Cognitive Dissonance
    const dissonanceResult = useMemo(() => {
        const onboarding = profile?.onboarding_scores || { risk: 50, creativity: 80, vision: 70, empathy: 60, leadership: 68 };
        const gameplay   = profile?.gameplay_scores   || profile?.traits || finalTraits;
        return calculateCognitiveDissonance(onboarding, gameplay);
    }, [profile?.onboarding_scores, profile?.gameplay_scores, profile?.traits, finalTraits]);

    const getStrengthLevel = (score: number) =>
        score >= 75 ? 'Strong' : score >= 50 ? 'Developing' : 'Emerging';

    // Idol Matches dynamically from level data
    const idolMatches = useMemo(() => {
        const levels = generateLevels(18);
        const uniqueIdols = new Map<string, { traits: any; avatarUrl: string }>();
        
        levels.forEach((lvl: any) => {
            if (lvl.personality && lvl.idolTraits) {
                if (!uniqueIdols.has(lvl.personality)) {
                    uniqueIdols.set(lvl.personality, { 
                        traits: lvl.idolTraits, 
                        avatarUrl: lvl.avatarUrl || '' 
                    });
                }
            }
        });

        const matches: { name: string; matchPct: number; sharedTrait: string; avatarUrl: string }[] = [];
        
        for (const [name, data] of uniqueIdols.entries()) {
            if (name === 'Default') continue;
            const p = data.traits;
            
            // finalTraits: risk, creativity, vision, empathy, leadership
            // p (idolTraits): risk, creativity, vision, empathy, leadership, discipline, resilience
            const diff =
                Math.abs(finalTraits.risk       - (p.risk || 50))       +
                Math.abs(finalTraits.creativity - (p.creativity || 50))  +
                Math.abs(finalTraits.vision     - (p.vision || 50))  +
                Math.abs(finalTraits.empathy    - (p.empathy || 50))      +
                Math.abs(finalTraits.leadership - (p.leadership || 50));
                
            const matchPct = Math.max(50, Math.min(98, Math.round(100 - diff / 5)));
            
            let sharedTrait = 'relentless drive and passion';
            if      ((p.creativity || 0) > 75 && finalTraits.creativity > 70) sharedTrait = 'imaginative vision and creative courage';
            else if ((p.risk || 0)       > 75 && finalTraits.risk       > 70) sharedTrait = 'bold decision-making under uncertainty';
            else if ((p.vision || 0)     > 75 && finalTraits.vision     > 70) sharedTrait = 'strategic focus and analytical clarity';
            else if ((p.empathy || 0)    > 75 && finalTraits.empathy    > 70) sharedTrait = 'deep empathy and social awareness';
            else if ((p.leadership || 0) > 75 && finalTraits.leadership > 70) sharedTrait = 'confident leadership and conviction';
            
            matches.push({ name, matchPct, sharedTrait, avatarUrl: data.avatarUrl });
        }
        return matches.sort((a, b) => b.matchPct - a.matchPct).slice(0, 3);
    }, [finalTraits]);

    // Sorted top traits
    const topTraits = useMemo(() => [
        { key: 'Creativity',             score: finalTraits.creativity, desc: 'exploring fresh ideas, storytelling, and imaginative problem-solving' },
        { key: 'Risk',                   score: finalTraits.risk,       desc: 'acting boldly in uncertainty and challenging the status quo' },
        { key: 'Vision (Analytical)',    score: finalTraits.vision,     desc: 'strategic planning, recognizing patterns, and long-term thinking' },
        { key: 'Leadership (Ambitious)', score: finalTraits.leadership, desc: 'taking ownership, guiding groups, and setting high standards' },
        { key: 'Empathy (Social)',       score: finalTraits.empathy,     desc: 'understanding others, building strong bonds, and fostering collaboration' },
    ].sort((a, b) => b.score - a.score), [finalTraits]);

    const [showAllCareers, setShowAllCareers] = useState(false);

    // Career directions (dynamic & expanded)
    const careerDirections = useMemo(() => {
        type TK = keyof typeof finalTraits;
        const MAP: { name: string; color: string; grad: string; icon: string; w: Partial<Record<TK, number>> }[] = [
            { name: 'Product Designer',    color: 'text-cyan-300',    grad: 'from-cyan-500 to-blue-500',     icon: '🎨', w: { creativity: 0.4, vision: 0.3, empathy: 0.3 } },
            { name: 'Entrepreneur',        color: 'text-amber-300',   grad: 'from-amber-500 to-orange-500',  icon: '🚀', w: { risk: 0.4, leadership: 0.4, creativity: 0.2 } },
            { name: 'Software Engineer',   color: 'text-purple-300',  grad: 'from-violet-500 to-purple-500', icon: '💻', w: { vision: 0.5, creativity: 0.3, leadership: 0.2 } },
            { name: 'Product Manager',     color: 'text-emerald-300', grad: 'from-emerald-500 to-teal-500',  icon: '📊', w: { vision: 0.4, leadership: 0.4, empathy: 0.2 } },
            { name: 'Creative Director',   color: 'text-pink-300',    grad: 'from-pink-500 to-rose-500',     icon: '🎬', w: { creativity: 0.6, empathy: 0.2, risk: 0.2 } },
            { name: 'UX / UI Designer',    color: 'text-indigo-300',  grad: 'from-indigo-500 to-violet-500', icon: '✨', w: { empathy: 0.4, creativity: 0.4, vision: 0.2 } },
            { name: 'Social Entrepreneur', color: 'text-teal-300',    grad: 'from-teal-500 to-cyan-500',     icon: '🌍', w: { empathy: 0.5, leadership: 0.3, risk: 0.2 } },
            { name: 'Content Creator',     color: 'text-rose-300',    grad: 'from-rose-500 to-pink-500',     icon: '🎥', w: { creativity: 0.7, risk: 0.2, empathy: 0.1 } },
            { name: 'Data Scientist',      color: 'text-blue-300',    grad: 'from-blue-500 to-indigo-500',   icon: '📈', w: { vision: 0.6, creativity: 0.2, risk: 0.2 } },
            { name: 'Growth Hacker',       color: 'text-green-300',   grad: 'from-green-500 to-emerald-500', icon: '🚀', w: { risk: 0.4, vision: 0.4, creativity: 0.2 } },
            { name: 'Game Developer',      color: 'text-fuchsia-300', grad: 'from-fuchsia-500 to-purple-500',icon: '🎮', w: { creativity: 0.5, vision: 0.4, risk: 0.1 } },
            { name: 'Strategy Consultant', color: 'text-slate-300',   grad: 'from-slate-400 to-slate-600',   icon: '♟️', w: { vision: 0.5, leadership: 0.3, empathy: 0.2 } },
            { name: 'Venture Capitalist',  color: 'text-yellow-300',  grad: 'from-yellow-400 to-amber-600',  icon: '💰', w: { risk: 0.5, vision: 0.3, leadership: 0.2 } },
            { name: 'Community Manager',   color: 'text-orange-300',  grad: 'from-orange-400 to-red-500',    icon: '🤝', w: { empathy: 0.6, leadership: 0.2, creativity: 0.2 } },
            { name: 'Marketing Director',  color: 'text-red-300',     grad: 'from-red-500 to-rose-600',      icon: '📢', w: { creativity: 0.4, leadership: 0.3, empathy: 0.3 } },
            { name: 'Filmmaker',           color: 'text-violet-300',  grad: 'from-violet-500 to-fuchsia-500',icon: '🍿', w: { creativity: 0.5, leadership: 0.3, risk: 0.2 } },
            { name: 'Architect',           color: 'text-sky-300',     grad: 'from-sky-400 to-blue-600',      icon: '🏛️', w: { vision: 0.5, creativity: 0.4, empathy: 0.1 } },
        ];
        const isPremium = isAyaPlusUser(profile);
        
        let scored = MAP.map(c => ({
            ...c,
            score: Math.round(Object.entries(c.w).reduce((acc, [k, wt]) => acc + (finalTraits[k as TK] ?? 50) * (wt ?? 0), 0))
        })).sort((a, b) => b.score - a.score);
        
        if (!isPremium) {
            scored = scored.slice(0, 1); // Free users get 1 career
        } else if (!showAllCareers) {
            scored = scored.slice(0, 4); // Show top 4 initially
        }
        
        const max = scored[0].score;
        return scored.map((c, i) => ({ ...c, pct: Math.round(96 - i * 5 + (c.score / max - 1) * 6) }));
    }, [finalTraits, showAllCareers, profile]);

    // Interest areas
    const interestAreas = useMemo(() => [
        { label: 'Technology', icon: '💻', s: Math.round(finalTraits.vision * 0.5 + finalTraits.creativity * 0.3 + finalTraits.risk * 0.2) },
        { label: 'Business',   icon: '💼', s: Math.round(finalTraits.leadership * 0.5 + finalTraits.risk * 0.3 + finalTraits.vision * 0.2) },
        { label: 'Design',     icon: '🎨', s: Math.round(finalTraits.creativity * 0.6 + finalTraits.empathy * 0.2 + finalTraits.vision * 0.2) },
        { label: 'Science',    icon: '🔬', s: Math.round(finalTraits.vision * 0.6 + finalTraits.creativity * 0.25 + finalTraits.empathy * 0.15) },
        { label: 'People',     icon: '🤝', s: Math.round(finalTraits.empathy * 0.6 + finalTraits.leadership * 0.3 + finalTraits.creativity * 0.1) },
        { label: 'Arts',       icon: '🎭', s: Math.round(finalTraits.creativity * 0.7 + finalTraits.empathy * 0.2 + finalTraits.risk * 0.1) },
    ].sort((a, b) => b.s - a.s).slice(0, 4).map(a => ({ ...a, pct: Math.min(98, Math.round(a.s * 0.98)) })),
    [finalTraits]);

    // Key Insight (Today)
    const keyInsight = useMemo(() => {
        const t = topTraits[0];
        const t2 = topTraits[1];
        const MAP: Record<string, string> = {
            Creativity:             `${activeUsername} shows strong creative resilience and enjoys exploring new ideas. They often choose imaginative paths over conventional ones.`,
            Risk:                   `${activeUsername} shows strong resilience and enjoys taking on challenges. They often choose tough paths over safe ones.`,
            'Vision (Analytical)':  `${activeUsername} shows remarkable strategic clarity. They think ahead and often identify the smartest path before others do.`,
            'Leadership (Ambitious)':`${activeUsername} shows natural leadership instincts. They take ownership readily and inspire those around them.`,
            'Empathy (Social)':     `${activeUsername} shows deep social awareness. They read situations with care and often bring groups together effortlessly.`,
        };
        return MAP[t.key] ?? `${activeUsername} shows strong ${t.key.toLowerCase()} and ${t2.key.toLowerCase()} traits, choosing growth-oriented paths consistently.`;
    }, [topTraits, activeUsername]);

    // Observation text
    const observationText = useMemo(() => {
        const t = topTraits[0];
        const MAP: Record<string, string> = {
            Creativity:             `${activeUsername} consistently reaches for original solutions and expresses ideas in distinctive ways. They thrive in open-ended challenges where imagination drives the outcome.`,
            Risk:                   `${activeUsername} repeatedly leans into bold choices — even under pressure. They show real comfort with uncertainty and tend to act decisively when others hesitate.`,
            'Vision (Analytical)':  `${activeUsername} approaches problems with clarity and structure. They plan ahead, spot patterns quickly, and consider consequences before acting.`,
            'Leadership (Ambitious)':`${activeUsername} naturally gravitates toward ownership of decisions and drives group momentum forward. They set high standards and hold themselves accountable.`,
            'Empathy (Social)':     `${activeUsername} is perceptive of how others feel and responds with care and thoughtfulness. The kind of person others gravitate toward in moments of tension.`,
        };
        return MAP[t.key] ?? `${activeUsername} frequently chooses challenging options and shows strong problem-solving and creative thinking skills.`;
    }, [topTraits, activeUsername]);

    // Clipboard text
    const reportText = useMemo(() => {
        const t1 = topTraits[0], t2 = topTraits[1];
        const opening = `${activeUsername} naturally thrives when engaging with ${t1.desc} and ${t2.desc}. Right from their initial choices, they display a genuine enthusiasm for tackling challenges head-on and bringing creative, thoughtful energy into whatever project or decision they take on.`;
        const dissonanceText = dissonanceResult.maxDissonanceTrait && dissonanceResult.maxDelta > 8
            ? `A growth insight emerges: ${activeUsername} tends to view their approach to ${dissonanceResult.maxDissonanceTrait.toUpperCase()} one way, but their actions show even greater willingness to take initiative. This gap is a natural doorway to deeper self-discovery.`
            : `${activeUsername}'s choices show strong internal alignment. How they see themselves matches how they act when decisions matter most.`;
        const closing = `This profile captures dynamic patterns in how ${activeUsername} thinks and chooses right now. It will keep evolving — not a fixed label or clinical assessment.`;
        return { opening, dissonanceText, closing };
    }, [activeUsername, topTraits, dissonanceResult]);

    const handleCopyReport = () => {
        audioSynth.playClick();
        navigator.clipboard.writeText(`# ${activeUsername}'s Career Report\n\n${reportText.opening}\n\n### Growth Insight\n${reportText.dissonanceText}\n\n### Grounded Perspective\n${reportText.closing}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const radarData = [
        { label: 'Risk',       value: finalTraits.risk,       color: '#ff51fa' },
        { label: 'Creativity', value: finalTraits.creativity, color: '#bc13fe' },
        { label: 'Vision',     value: finalTraits.vision,     color: '#00f2ff' },
        { label: 'Empathy',    value: finalTraits.empathy,    color: '#00ff9d' },
        { label: 'Leadership', value: finalTraits.leadership, color: '#ffb800' },
    ];

    const traitBars = [
        { name: 'Risk',                  kw: 'Adventurous • Bold • Uncertain',      score: finalTraits.risk,       grad: 'from-pink-500 to-rose-500',         bg: 'bg-pink-500/20 border-pink-500/40',      ic: <Zap    size={18} className="text-pink-400" /> },
        { name: 'Creativity',            kw: 'Imaginative • Original • Expressive', score: finalTraits.creativity, grad: 'from-purple-500 to-indigo-500',      bg: 'bg-purple-500/20 border-purple-500/40',  ic: <Star   size={18} className="text-purple-400" /> },
        { name: 'Vision (Analytical)',   kw: 'Strategic • Logical • Planner',        score: finalTraits.vision,     grad: 'from-cyan-500 to-blue-500',          bg: 'bg-cyan-500/20 border-cyan-500/40',      ic: <Eye    size={18} className="text-cyan-400" /> },
        { name: 'Empathy (Social)',      kw: 'Caring • Supportive • Aware',          score: finalTraits.empathy,    grad: 'from-emerald-500 to-teal-500',       bg: 'bg-emerald-500/20 border-emerald-500/40',ic: <Users  size={18} className="text-emerald-400" /> },
        { name: 'Leadership (Ambitious)',kw: 'Confident • Driven • Influential',     score: finalTraits.leadership, grad: 'from-amber-500 to-yellow-500',       bg: 'bg-amber-500/20 border-amber-500/40',    ic: <Trophy size={18} className="text-amber-400" /> },
    ];

    // Suppress unused warning — getStrengthLevel used in copy text
    void getStrengthLevel;

    return (
        <div className="w-full bg-[#11111a] border border-[#00f2ff]/30 rounded-[2rem] p-6 sm:p-9 shadow-[0_0_30px_rgba(0,0,0,0.7)] backdrop-blur-xl text-slate-100 font-sans">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(0,242,255,0.3)]">
                        <Dna size={32} className="animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[12px] font-black uppercase tracking-[0.25em] text-[#00f2ff]">AYA Psychometric Engine</span>
                            <span className="px-2 py-0.5 text-[11px] font-extrabold uppercase rounded bg-purple-500/30 text-purple-300 border border-purple-500/40">Career Report</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200">
                            {activeUsername}&apos;s Career Report
                        </h2>
                    </div>
                </div>
                <button
                    onClick={handleCopyReport}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00f2ff]/20 to-[#d575ff]/20 border border-[#00f2ff]/40 text-cyan-300 hover:text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
                >
                    {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy Report'}
                </button>
            </div>

            <article className="space-y-7 text-slate-200 leading-relaxed font-sans">

                {/* Opening */}
                <div className="p-7 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-purple-950/40 border border-cyan-500/30">
                    <p className="text-lg sm:text-xl text-slate-100 leading-relaxed font-medium">{reportText.opening}</p>
                </div>

                {/* ── Overall Progress ── */}
                <div className="rounded-2xl bg-[#16161f] border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Overall Progress</h3>
                        <span className="text-[12px] text-slate-500 font-mono">This Month</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="rounded-xl p-4 border bg-amber-500/10 border-amber-500/20 flex flex-col gap-2">
                            <div className="flex items-center gap-2"><BookOpen size={18} className="text-amber-400" /><span className="text-[12px] uppercase tracking-wider text-slate-400 font-bold">Stories Played</span></div>
                            <span className="text-2xl font-black text-amber-300">{storyCount}</span>
                        </div>
                        <div className="rounded-xl p-4 border bg-cyan-500/10 border-cyan-500/20 flex flex-col gap-2">
                            <div className="flex items-center gap-2"><Zap size={18} className="text-cyan-400" /><span className="text-[12px] uppercase tracking-wider text-slate-400 font-bold">XP Earned</span></div>
                            <span className="text-2xl font-black text-cyan-300">{totalXp.toLocaleString()}</span>
                        </div>
                        <div className="rounded-xl p-4 border bg-pink-500/10 border-pink-500/20 flex flex-col gap-2">
                            <div className="flex items-center gap-2"><Flame size={18} className="text-pink-400" /><span className="text-[12px] uppercase tracking-wider text-slate-400 font-bold">Current Streak</span></div>
                            <span className="text-2xl font-black text-pink-300">{currentStreak} Days</span>
                        </div>
                    </div>
                </div>

                {/* ── DNA Score Overview (Radar) ── */}
                <div className="rounded-2xl bg-[#16161f] border border-white/10 p-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-1">DNA Score Overview</h3>
                    <p className="text-[12px] text-slate-500 mb-4">Who {activeUsername} is becoming</p>
                    <RadarChart traits={radarData} />
                </div>

                {/* ── Key Insight (Today) ── */}
                <div className="rounded-2xl bg-[#16161f] border border-amber-500/30 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-amber-300">
                        <Lightbulb size={96} />
                    </div>
                    <div className="flex items-center gap-2.5 mb-3">
                        <Lightbulb size={18} className="text-amber-400" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-300">Key Insight (Today)</h3>
                    </div>
                    <p className="text-base text-slate-200 leading-relaxed relative z-10">{keyInsight}</p>
                </div>

                {/* ── Core DNA Traits ── */}
                <div className="rounded-2xl bg-[#16161f] border border-white/10 p-6 space-y-6">
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#00f2ff]">Core DNA Traits</h3>
                        <span className="text-[12px] font-mono text-slate-400">AYA Profile</span>
                    </div>
                    {traitBars.map(t => (
                        <div key={t.name} className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${t.bg}`}>
                                {t.ic}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-end mb-1.5">
                                    <div>
                                        <span className="text-sm font-bold text-white">{t.name}</span>
                                        <span className="block text-[12px] text-slate-500">{t.kw}</span>
                                    </div>
                                    <span className="font-mono text-base font-black text-white ml-2 flex-shrink-0">{t.score}/100</span>
                                </div>
                                <div className="w-full h-3.5 rounded-full bg-slate-900/80 overflow-hidden">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${t.grad} transition-all duration-1000`} style={{ width: `${t.score}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── What We're Observing ── */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-purple-500/20">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-purple-300 mb-3 flex items-center gap-2">
                        <TrendingUp size={18} /> What We&apos;re Observing
                    </h3>
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{observationText}</p>
                </div>

                {/* ── What Attracts Them ── */}
                <div className="rounded-2xl bg-[#16161f] border border-white/10 p-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-5">What Attracts {activeUsername}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {interestAreas.map(a => (
                            <div key={a.label} className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-slate-900/70 border border-white/5 hover:border-white/20 transition-all cursor-default">
                                <span className="text-3xl">{a.icon}</span>
                                <span className="text-sm font-bold text-white">{a.label}</span>
                                <span className="text-sm font-mono font-black text-cyan-300">{a.pct}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Behavior vs Self-View ── */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900/80 to-cyan-950/30 border border-purple-500/30 space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-pink-300 flex items-center gap-2">
                        <UserCheck size={18} /> Behavior vs. Self-View Insight
                    </h3>
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{reportText.dissonanceText}</p>
                </div>

                {/* ── Role Models ── */}
                <div className="p-6 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300 flex items-center gap-2">
                            <Award size={18} /> Role Models {activeUsername} Resembles
                        </h3>
                        <span className="text-[12px] text-slate-400">People with similar DNA</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {idolMatches.map(idol => (
                            <div key={idol.name} className="p-4 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-4">
                                {idol.avatarUrl
                                    ? <img src={idol.avatarUrl} alt={idol.name} className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400/50 flex-shrink-0" />
                                    : <div className="w-14 h-14 rounded-full bg-cyan-950 border border-cyan-400/40 flex items-center justify-center font-bold text-lg text-cyan-300 flex-shrink-0">{idol.name[0]}</div>
                                }
                                <div className="min-w-0">
                                    <div className="text-sm font-black text-white truncate">{idol.name}</div>
                                    <div className="text-[13px] font-bold text-amber-300">{idol.matchPct}% Match</div>
                                    <div className="text-[12px] text-slate-400 capitalize leading-tight">{idol.sharedTrait}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Top Career Directions ── */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 border border-indigo-500/30 space-y-5">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-300 flex items-center gap-2">
                            <Briefcase size={18} /> Top Career Directions
                        </h3>
                        <span className="text-[12px] text-slate-400 font-mono">Based on {activeUsername}&apos;s DNA &amp; Interests</span>
                    </div>
                    <div className="space-y-4">
                        {careerDirections.map(c => (
                            <div key={c.name} className="flex items-center gap-4">
                                <span className="text-2xl w-8 flex-shrink-0 text-center">{c.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-white truncate">{c.name}</span>
                                        <span className={`text-sm font-mono font-black ml-2 flex-shrink-0 ${c.color}`}>{c.pct}%</span>
                                    </div>
                                    <div className="w-full h-3 rounded-full bg-slate-900/80 overflow-hidden">
                                        <div className={`h-full rounded-full bg-gradient-to-r ${c.grad} transition-all duration-1000`} style={{ width: `${c.pct}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {isAyaPlusUser(profile) ? (
                        <button 
                            onClick={() => {
                                audioSynth.playClick();
                                setShowAllCareers(!showAllCareers);
                            }}
                            className="w-full text-center text-[13px] text-slate-400 hover:text-white pt-2 border-t border-white/5 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Rocket size={13} /> {showAllCareers ? "Show fewer career suggestions" : "View all career suggestions"}
                        </button>
                    ) : (
                        <button 
                            onClick={() => {
                                audioSynth.playClick();
                                useUserStore.getState().setShowSubscriptionModal(true);
                            }}
                            className="w-full text-center text-[13px] font-bold text-indigo-400 hover:text-indigo-300 pt-2 border-t border-white/5 flex items-center justify-center gap-2 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 py-2 rounded-b-xl"
                        >
                            <Lock size={13} /> Unlock Deeper Career Matches
                        </button>
                    )}
                </div>

                {/* ── Grounded Note ── */}
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400 mb-3 flex items-center gap-2">
                        <ShieldCheck size={18} /> Grounded Perspective
                    </h3>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{reportText.closing}</p>
                </div>

                {/* ── Footer ── */}
                <div className="pt-5 border-t border-white/10 flex justify-between items-center text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <Heart size={16} className="text-pink-400" />
                        <span>AYA Self-Discovery Engine</span>
                    </div>
                    <span>Data backing profile: {storyCount} stories</span>
                </div>

            </article>
        </div>
    );
}
