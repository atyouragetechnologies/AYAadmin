import { useState, useMemo } from 'react';
import { Heart, Sparkles, ShieldCheck, Copy, Check, User, Compass, Lightbulb, Award, BookOpen } from 'lucide-react';
import { audioManager as audioSynth } from '../../utils/audioManager';

export interface ChildTraitMarker {
    category: string;
    marker: string;
    rsid: string;
    genotype: string;
    tendency: string;
    confidence: 'Strong' | 'Moderate' | 'Preliminary';
    explanation: string;
}

export interface ChildAptitudeProfile {
    id: string;
    defaultName: string;
    ageGroup: string;
    archetypeTitle: string;
    lovesText: string;
    excelText: string;
    matrix: ChildTraitMarker[];
    naturalStrengths: {
        title: string;
        description: string;
        nurturingDirection: string;
    }[];
    inspirationBenchmark: {
        achieverName: string;
        achieverRole: string;
        comparisonText: string;
    };
    parentNote: string;
}

export const CHILD_PROFILES: ChildAptitudeProfile[] = [
    {
        id: 'aarav_pioneer',
        defaultName: 'Aarav',
        ageGroup: '10–14 years',
        archetypeTitle: 'Curious Pioneer & Focused Thinker',
        lovesText: 'Aarav is naturally drawn to hands-on exploration, creative problem-solving, and trying out new activities. He thrives in energetic environments where he can build things, ask curious questions, and experiment with how the world works.',
        excelText: 'Aarav shows an early natural spark for fast skill learning, creative design, and staying focused when engrossed in a favorite project. When given the freedom to explore at his own pace, he brings a wonderful blend of enthusiasm, focus, and warmth to everything he undertakes!',
        matrix: [
            {
                category: 'Learning & Adaptability',
                marker: 'BDNF',
                rsid: 'rs6265',
                genotype: 'Val/Val',
                tendency: 'High Neural Plasticity & Fast Skill Mastery',
                confidence: 'Strong',
                explanation: 'Associated with efficient brain protein production that helps neural connections form quickly when learning new concepts or physical skills.'
            },
            {
                category: 'Focus & Composure',
                marker: 'COMT',
                rsid: 'rs4680',
                genotype: 'Val/Met',
                tendency: 'Balanced Cognitive Focus & Emotional Resilience',
                confidence: 'Strong',
                explanation: 'Supports a balanced dopamine clearance rate, helping maintain deep concentration during learning without becoming easily flustered under mild pressure.'
            },
            {
                category: 'Curiosity & Engagement',
                marker: 'DRD4',
                rsid: 'rs1800955',
                genotype: 'C/C',
                tendency: 'Active Curiosity & Novelty-Seeking',
                confidence: 'Moderate',
                explanation: 'Linked with an enthusiastic appetite for exploring new ideas, hands-on hobbies, and creative challenges.'
            },
            {
                category: 'Social Warmth & Empathy',
                marker: 'OXTR',
                rsid: 'rs53576',
                genotype: 'GG',
                tendency: 'High Emotional Sensitivity & Team Cohesion',
                confidence: 'Moderate',
                explanation: 'Associated with natural empathy, social intuition, and an innate ability to build trusting bonds with peers and mentors.'
            },
            {
                category: 'Energy Cycle & Focus Window',
                marker: 'CLOCK',
                rsid: 'rs1801260',
                genotype: 'T/C',
                tendency: 'Flexible Evening Peak Energy',
                confidence: 'Moderate',
                explanation: 'Indicates a slightly later natural energy cycle, where creative focus and deep interest often peak during late afternoon or evening hours.'
            }
        ],
        naturalStrengths: [
            {
                title: '1. Rapid Skill Acquisition & Conceptual Learning',
                description: 'His genetic profile reflects strong neuroplasticity (BDNF), meaning his brain forms new mental pathways readily when exposed to novel subjects. He is likely to absorb concepts quickly when taught through visual, hands-on, or experiential methods.',
                nurturingDirection: 'Encourage interactive hobbies such as coding puzzles, musical instruments, robotics, or tactical board games where he can practice mastering structured skills in a fun setting.'
            },
            {
                title: '2. Calm, Strategic Problem-Solving',
                description: 'With a balanced COMT marker, he is naturally equipped to combine focused analytical thinking with steady composure. When faced with a tricky puzzle or a challenging task, he tends to pause, reflect, and work through solutions rather than reacting impulsively.',
                nurturingDirection: 'Engage him in open-ended creative projects—like designing science experiments, building models, or strategy games—where trial-and-error is celebrated and thoughtful persistence pays off.'
            },
            {
                title: '3. Warm Social Intuition & Team Collaboration',
                description: 'His OXTR profile indicates a natural capacity for empathy and social harmony. He naturally senses the feelings of those around him, making him a supportive classmate and a constructive teammate in group settings.',
                nurturingDirection: 'Involve him in team sports, drama workshops, or collaborative group projects where he can build leadership through encouraging others and listening thoughtfully.'
            }
        ],
        inspirationBenchmark: {
            achieverName: 'Virat Kohli',
            achieverRole: 'Cricketer & Leader',
            comparisonText: 'Aarav’s combination of calm focus under pressure and rapid learning is reminiscent of the mental qualities seen in world-class achievers like Virat Kohli. While every child’s journey is entirely unique, Kohli\'s success stems from a blend of deep concentration, emotional composure during critical moments, and relentless dedication to honing his skills over time. Aarav demonstrates a similar natural potential for steady composure and focused learning—qualities that, when nurtured with encouragement, will help him shine in whichever field he chooses.'
        },
        parentNote: 'This report provides a window into Aarav’s innate biological predispositions—think of it as discovering the unique natural terrain of his mind. However, genetics is only one part of the story. Environment, family support, quality education, personal interests, and daily encouragement play an equally vital role in shaping who he becomes. This information is intended purely for positive guidance and parental self-discovery, not as a diagnostic tool or rigid limit. Every child holds limitless potential to grow, adapt, and chart their own path!'
    },
    {
        id: 'ananya_explorer',
        defaultName: 'Ananya',
        ageGroup: '8–12 years',
        archetypeTitle: 'Creative Innovator & Inquisitive Explorer',
        lovesText: 'Ananya loves painting, storytelling, observing nature, and asking imaginative questions about how space and science work. She loves expressing her feelings through art and building creative stories.',
        excelText: 'Ananya shows an early natural talent for spatial thinking, creative design, and intuitive empathy. She responds wonderfully to visual learning and loves turning ideas into tangible projects.',
        matrix: [
            {
                category: 'Creative Expression',
                marker: 'DRD4',
                rsid: 'rs1800955',
                genotype: '7R+',
                tendency: 'High Artistic & Exploratory Drive',
                confidence: 'Strong',
                explanation: 'Linked to active imagination, novel idea generation, and high engagement with creative pursuits.'
            },
            {
                category: 'Empathy & Intuition',
                marker: 'OXTR',
                rsid: 'rs53576',
                genotype: 'GG',
                tendency: 'Deep Empathy & Social Awareness',
                confidence: 'Strong',
                explanation: 'Associated with elevated emotional intelligence, warm communication, and strong peer relationships.'
            },
            {
                category: 'Learning Agility',
                marker: 'BDNF',
                rsid: 'rs6265',
                genotype: 'Val/Met',
                tendency: 'Adaptive & Flexible Skill Learning',
                confidence: 'Moderate',
                explanation: 'Supports smooth transitions between different learning tasks and creative problem solving.'
            }
        ],
        naturalStrengths: [
            {
                title: '1. Visual-Spatial Imagination',
                description: 'Shows a natural tendency to visualize complex patterns and express thoughts through creative mediums like sketching, writing, or building.',
                nurturingDirection: 'Provide art kits, creative writing notebooks, space exploration books, and 3D modeling tools.'
            },
            {
                title: '2. Empathetic Teamwork',
                description: 'Understands group dynamics effortlessly and brings people together through encouraging communication and active listening.',
                nurturingDirection: 'Support participation in community projects, storytelling circles, or team activities.'
            }
        ],
        inspirationBenchmark: {
            achieverName: 'Kalpana Chawla',
            achieverRole: 'Astronaut & Aerospace Engineer',
            comparisonText: 'Ananya’s blend of curious imagination and persistent learning aligns with the inspiring qualities demonstrated by pioneer Kalpana Chawla. Kalpana combined relentless curiosity about the universe with methodical dedication. Ananya shares that same natural wonder and visual adaptability.'
        },
        parentNote: 'Remember that genetic predispositions represent potential, not a fixed outcome. Nurturing curiosity with love, patience, and rich experiences allows every child to blossom at their own rhythm.'
    }
];

interface ChildAptitudeReportCardProps {
    initialChildName?: string;
}

export function ChildAptitudeReportCard({ initialChildName }: ChildAptitudeReportCardProps) {
    const [selectedProfileId, setSelectedProfileId] = useState<string>('aarav_pioneer');
    const [customName, setCustomName] = useState<string>(initialChildName || 'Aarav');
    const [copied, setCopied] = useState<boolean>(false);

    const baseProfile = useMemo(() => {
        return CHILD_PROFILES.find(p => p.id === selectedProfileId) || CHILD_PROFILES[0];
    }, [selectedProfileId]);

    const activeChildName = useMemo(() => {
        return customName.trim() || baseProfile.defaultName;
    }, [customName, baseProfile]);

    // Format text with dynamic child name
    const formattedLoves = useMemo(() => {
        return baseProfile.lovesText.replaceAll(baseProfile.defaultName, activeChildName);
    }, [baseProfile, activeChildName]);

    const formattedExcel = useMemo(() => {
        return baseProfile.excelText.replaceAll(baseProfile.defaultName, activeChildName);
    }, [baseProfile, activeChildName]);

    const formattedStrengths = useMemo(() => {
        return baseProfile.naturalStrengths.map(s => ({
            ...s,
            description: s.description.replaceAll(baseProfile.defaultName, activeChildName),
            nurturingDirection: s.nurturingDirection.replaceAll(baseProfile.defaultName, activeChildName)
        }));
    }, [baseProfile, activeChildName]);

    const formattedBenchmark = useMemo(() => {
        return baseProfile.inspirationBenchmark.comparisonText.replaceAll(baseProfile.defaultName, activeChildName);
    }, [baseProfile, activeChildName]);

    const formattedParentNote = useMemo(() => {
        return baseProfile.parentNote.replaceAll(baseProfile.defaultName, activeChildName);
    }, [baseProfile, activeChildName]);

    const handleCopyFullReport = () => {
        audioSynth.playClick();
        const text = `## What ${activeChildName} Loves\n${formattedLoves}\n\n## What ${activeChildName} Might Naturally Excel At\n${formattedExcel}\n\n---\n\n## Detailed Insights Report\n\n### Trait & Personality Matrix\n` +
            baseProfile.matrix.map(m => `| ${m.category} | ${m.marker} (${m.rsid} ${m.genotype}) | ${m.tendency} | ${m.confidence} | ${m.explanation} |`).join('\n') +
            `\n\n### Natural Strengths\n` +
            formattedStrengths.map(s => `#### ${s.title}\n${s.description}\n*Nurturing Direction:* ${s.nurturingDirection}`).join('\n\n') +
            `\n\n### Inspiration Benchmark\n${formattedBenchmark}\n\n### A Note for Parents\n${formattedParentNote}`;

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const getConfidenceBadge = (confidence: string) => {
        switch (confidence) {
            case 'Strong':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Strong</span>;
            case 'Moderate':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">Moderate</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">Preliminary</span>;
        }
    };

    return (
        <div className="w-full bg-[#11111a] border border-[#00f2ff]/30 rounded-[2rem] p-5 sm:p-8 shadow-[0_0_30px_rgba(0,0,0,0.7)] backdrop-blur-xl text-slate-100 font-sans">
            
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 via-pink-500/20 to-cyan-500/20 border border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                        <Sparkles size={28} className="animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">Parent Guidance System</span>
                            <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-pink-500/30 text-pink-300 border border-pink-500/40">Aptitude & Strengths</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-100 to-cyan-200">
                            Child Insights Report
                        </h2>
                    </div>
                </div>

                {/* Profile Selector & Custom Name Input */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/10">
                        <User size={16} className="text-cyan-400" />
                        <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Child's Name"
                            className="bg-transparent text-xs font-bold text-white focus:outline-none w-28 placeholder-slate-500"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        {CHILD_PROFILES.map(profile => (
                            <button
                                key={profile.id}
                                onClick={() => {
                                    audioSynth.playClick();
                                    setSelectedProfileId(profile.id);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                                    selectedProfileId === profile.id
                                        ? 'bg-gradient-to-r from-amber-500/30 to-pink-500/30 text-amber-200 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                                        : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/30 hover:text-white'
                                }`}
                            >
                                {profile.defaultName} ({profile.ageGroup})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* PART 1 — FIRST THING PARENTS SEE (Warm, simple, immediate) */}
            <div className="mb-10 p-6 rounded-3xl bg-gradient-to-br from-amber-950/30 via-pink-950/20 to-purple-950/30 border-2 border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-amber-300">
                    <Heart size={140} />
                </div>

                <div className="inline-block px-3 py-1 mb-4 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-black text-[10px] uppercase tracking-widest">
                    ✨ Quick Reveal Snapshot
                </div>

                {/* Section 1.1: What Child Loves */}
                <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-black text-amber-200 mb-2 flex items-center gap-2">
                        <Heart size={22} className="text-pink-400" />
                        What {activeChildName} Loves
                    </h2>
                    <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-sans font-medium">
                        {formattedLoves}
                    </p>
                </div>

                {/* Section 1.2: What Child Might Excel At */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-cyan-200 mb-2 flex items-center gap-2">
                        <Lightbulb size={22} className="text-cyan-400" />
                        What {activeChildName} Might Naturally Excel At
                    </h2>
                    <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-sans font-medium">
                        {formattedExcel}
                    </p>
                </div>
            </div>

            <hr className="border-t-2 border-dashed border-white/15 my-10" />

            {/* PART 2 — THE FULL REPORT (Serious, firm, authoritative) */}
            <div className="space-y-10">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-cyan-400 to-purple-500" />
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
                            Detailed Insights Report
                        </h2>
                        <p className="text-xs text-slate-400">Scientific foundation and guidance framework for parents</p>
                    </div>
                </div>

                {/* Trait & Personality Matrix */}
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 mb-4 flex items-center gap-2">
                        <Compass size={16} /> Trait & Personality Matrix
                    </h3>

                    {/* Table View Desktop */}
                    <div className="hidden md:block overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-900/90 text-cyan-400 uppercase tracking-widest font-black text-[10px] border-b border-white/10">
                                    <th className="py-3.5 px-4">Trait Category</th>
                                    <th className="py-3.5 px-4">Genetic Marker</th>
                                    <th className="py-3.5 px-4">Tendency Indicated</th>
                                    <th className="py-3.5 px-4">Confidence Level</th>
                                    <th className="py-3.5 px-4">Plain-English Explanation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-slate-200">
                                {baseProfile.matrix.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                                        <td className="py-4 px-4 font-bold text-white">{item.category}</td>
                                        <td className="py-4 px-4 font-mono text-cyan-300">
                                            <span className="font-bold">{item.marker}</span>{' '}
                                            <span className="text-slate-400 text-[11px]">({item.rsid})</span>{' '}
                                            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">{item.genotype}</span>
                                        </td>
                                        <td className="py-4 px-4 font-bold text-purple-200">{item.tendency}</td>
                                        <td className="py-4 px-4">{getConfidenceBadge(item.confidence)}</td>
                                        <td className="py-4 px-4 text-slate-300 leading-relaxed max-w-xs">{item.explanation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden flex flex-col gap-3">
                        {baseProfile.matrix.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col gap-2">
                                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                                    <span className="font-bold text-xs text-cyan-300">{item.category}</span>
                                    {getConfidenceBadge(item.confidence)}
                                </div>
                                <div className="flex items-center justify-between font-mono text-xs text-purple-300">
                                    <span className="font-bold">{item.marker} <span className="text-slate-400 text-[10px]">({item.rsid})</span></span>
                                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 text-[10px] font-black">{item.genotype}</span>
                                </div>
                                <div className="text-xs font-bold text-white">{item.tendency}</div>
                                <p className="text-xs text-slate-300 leading-relaxed mt-1">{item.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Natural Strengths */}
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-300 mb-4 flex items-center gap-2">
                        <BookOpen size={16} /> Natural Strengths & Nurturing Directions
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {formattedStrengths.map((strength, idx) => (
                            <div key={idx} className="p-5 rounded-2xl bg-slate-900/70 border border-pink-500/20 space-y-2">
                                <h4 className="text-base font-black text-pink-200">{strength.title}</h4>
                                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{strength.description}</p>
                                <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/30 text-xs text-pink-100">
                                    <strong className="text-amber-300 uppercase tracking-wider text-[10px] block mb-1">Nurturing Direction:</strong>
                                    {strength.nurturingDirection}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inspiration Benchmark */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-cyan-950/40 border border-purple-500/30">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-300 mb-3 flex items-center gap-2">
                        <Award size={16} /> Inspiration Benchmark
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-2">
                        <span>Qualitative Focus Comparison:</span>
                        <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/30">{baseProfile.inspirationBenchmark.achieverName} ({baseProfile.inspirationBenchmark.achieverRole})</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                        {formattedBenchmark}
                    </p>
                </div>

                {/* A Note for Parents */}
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-3 flex items-center gap-2">
                        <ShieldCheck size={16} /> A Note for Parents
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {formattedParentNote}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
                    <span className="text-xs text-slate-400">Parent-Facing Aptitude & Personality Report</span>
                    <button
                        onClick={handleCopyFullReport}
                        className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-95 transition-all"
                    >
                        {copied ? <Check size={16} className="text-slate-950" /> : <Copy size={16} />}
                        {copied ? 'REPORT COPIED TO CLIPBOARD!' : 'COPY FULL PARENT REPORT'}
                    </button>
                </div>
            </div>

        </div>
    );
}
