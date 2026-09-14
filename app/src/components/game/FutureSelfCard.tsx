import { useMemo } from 'react';
import type { FutureMatch, LifeTraits } from '../../utils/futureSelfMatch';
import { getWeakestTrait } from '../../utils/futureSelfMatch';
import { useDevicePerformance } from '../../hooks/useDevicePerformance';

// ── Props ────────────────────────────────────────────────────────────────────
interface FutureSelfCardProps {
    futureMatch: FutureMatch;
    storiesCompleted: number;
    decisionsCount: number;
    onShare: () => void;
}

// ── Life Trait Bar Config ────────────────────────────────────────────────────
const TRAIT_BARS: { key: keyof LifeTraits; label: string; color: string; glow: string }[] = [
    { key: 'resilience',        label: 'Resilience',        color: '#f97316', glow: 'rgba(249,115,22,0.6)' },
    { key: 'discipline',        label: 'Discipline',        color: '#00f2ff', glow: 'rgba(0,242,255,0.6)' },
    { key: 'courage',           label: 'Courage',           color: '#ef4444', glow: 'rgba(239,68,68,0.6)' },
    { key: 'creativity',        label: 'Creativity',        color: '#d575ff', glow: 'rgba(213,117,255,0.6)' },
    { key: 'emotional_control', label: 'Emotional Control', color: '#00ff9d', glow: 'rgba(0,255,157,0.6)' },
    { key: 'leadership',        label: 'Leadership',        color: '#f59e0b', glow: 'rgba(245,158,11,0.6)' },
    { key: 'risk_intelligence', label: 'Risk Intelligence', color: '#ff51fa', glow: 'rgba(255,81,250,0.6)' },
    { key: 'consistency',       label: 'Consistency',       color: '#60a5fa', glow: 'rgba(96,165,250,0.6)' },
];

// ── Floating Particle ─────────────────────────────────────────────────────────
const Particle = ({ style }: { style: React.CSSProperties }) => (
    <div
        className="absolute rounded-full mix-blend-screen pointer-events-none"
        style={{
            ...style,
            animation: `float-particle ${style.animationDuration || '4s'} ease-in-out infinite alternate`,
            boxShadow: `0 0 8px currentColor, 0 0 16px currentColor`,
        }}
    />
);

// ── Evolution Message ─────────────────────────────────────────────────────────
function getEvolutionMessage(stories: number): string {
    if (stories < 3) return 'Play more stories to unlock your full trajectory.';
    if (stories < 10) return 'Your pattern is emerging. Keep playing to refine your future self.';
    return 'Your trajectory is clear. Here is who you are becoming…';
}

// ── Neon Trait Bar ────────────────────────────────────────────────────────────
function NeonLifeBar({ label, value, color, glow }: { label: string; value: number; color: string; glow: string }) {
    return (
        <div className="mb-3 group">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#aca9b6]">{label}</span>
                <span className="text-[10px] font-bold" style={{ color }}>{value}%</span>
            </div>
            <div
                className="w-full h-[6px] rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)' }}
            >
                <div
                    className="h-full rounded-full relative transition-all duration-1000 ease-out"
                    style={{
                        width: `${value}%`,
                        background: `linear-gradient(90deg, transparent 0%, ${color} 100%)`,
                        boxShadow: `0 0 10px ${glow}, inset 0 0 3px ${color}`,
                    }}
                >
                    {/* Laser head */}
                    <div className="absolute right-0 top-0 h-full w-1.5 bg-white blur-[1px] rounded-full" />
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function FutureSelfCard({ futureMatch, storiesCompleted, decisionsCount, onShare }: FutureSelfCardProps) {
    const { archetype, lifeTraits } = futureMatch;
    const weakest = useMemo(() => getWeakestTrait(lifeTraits), [lifeTraits]);
    const evolutionMsg = getEvolutionMessage(storiesCompleted);
    const { isLowEnd } = useDevicePerformance();

    return (
        <div
            className="w-full rounded-[2rem] relative overflow-hidden mb-10"
            style={{
                background: 'rgba(25,25,36,0.95)',
                border: '1.5px solid transparent',
                backgroundClip: 'padding-box',
                boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(131,0,180,0.15)`,
            }}
        >
            {/* Gradient border overlay */}
            <div
                className="absolute inset-0 rounded-[2rem] pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, #8300b4 0%, transparent 40%, transparent 60%, #00e2ee 100%)',
                    padding: '1.5px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                }}
            />

            {/* Floating Particles */}
            {!isLowEnd && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
                    <Particle style={{ top: '8%',  left: '12%', width: 5, height: 5, color: '#00f2ff', backgroundColor: '#00f2ff', animationDuration: '3.5s' }} />
                    <Particle style={{ top: '20%', right: '10%', width: 3, height: 3, color: '#d575ff', backgroundColor: '#d575ff', animationDuration: '5s' }} />
                    <Particle style={{ top: '55%', left: '5%',  width: 4, height: 4, color: '#f59e0b', backgroundColor: '#f59e0b', animationDuration: '4.2s' }} />
                    <Particle style={{ top: '70%', right: '8%', width: 6, height: 6, color: '#ff51fa', backgroundColor: '#ff51fa', animationDuration: '3s' }} />
                    <Particle style={{ bottom: '10%', left: '40%', width: 3, height: 3, color: '#00ff9d', backgroundColor: '#00ff9d', animationDuration: '6s' }} />
                    {/* Amber top-right ambient glow (Stitch "Dossier Card" signature) */}
                    <div
                        className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }}
                    />
                    {/* Purple bottom-left ambient */}
                    <div
                        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(131,0,180,0.2) 0%, transparent 70%)' }}
                    />
                </div>
            )}

            <div className="relative z-10 p-6 sm:p-8">

                {/* ── Header ── */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p
                            className="text-xs font-black uppercase tracking-[0.25em] mb-1"
                            style={{
                                color: '#00f2ff',
                                textShadow: '0 0 12px rgba(0,242,255,0.8), 0 0 30px rgba(0,242,255,0.4)',
                                fontFamily: "'Space Grotesk', sans-serif",
                            }}
                        >
                            🔮 Your Future Self
                        </p>
                        <p className="text-[10px] text-[#757480] uppercase tracking-widest">
                            Based on {decisionsCount} decisions you've made…
                        </p>
                    </div>
                    <div
                        className="px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex-shrink-0 ml-3"
                        style={{
                            borderColor: 'rgba(131,0,180,0.4)',
                            color: '#d575ff',
                            background: 'rgba(131,0,180,0.1)',
                        }}
                    >
                        LIVE
                    </div>
                </div>

                {/* ── Emoji + Archetype Name ── */}
                <div className="flex flex-col items-center mb-6">
                    {/* Radial glow behind emoji */}
                    <div className="relative flex items-center justify-center mb-4">
                        <div
                            className="absolute w-28 h-28 rounded-full"
                            style={{ background: `radial-gradient(circle, ${archetype.color}40 0%, transparent 70%)`, filter: 'blur(8px)' }}
                        />
                        <span
                            className="text-7xl relative z-10"
                            style={{ filter: `drop-shadow(0 0 20px ${archetype.color}) drop-shadow(0 0 40px ${archetype.colorSecondary})` }}
                        >
                            {archetype.emoji}
                        </span>
                    </div>

                    {/* Archetype Name */}
                    <h2
                        className="text-4xl sm:text-5xl font-black uppercase tracking-[0.08em] text-center leading-none mb-3"
                        style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            background: `linear-gradient(135deg, ${archetype.color} 0%, ${archetype.colorSecondary} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: 'none',
                            filter: `drop-shadow(0 0 20px ${archetype.color}80)`,
                        }}
                    >
                        {archetype.name}
                    </h2>

                    {/* Percentile Badge */}
                    <div
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border mb-4"
                        style={{
                            borderColor: 'rgba(245,158,11,0.5)',
                            background: 'rgba(245,158,11,0.1)',
                            boxShadow: '0 0 15px rgba(245,158,11,0.2)',
                        }}
                    >
                        <span className="text-xs">⭐</span>
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-[#f59e0b]">
                            {archetype.percentile} Decision Maker
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-center text-sm text-[#aca9b6] leading-relaxed max-w-xs">
                        {archetype.description}
                    </p>
                </div>

                {/* ── Real Match ── */}
                <div
                    className="flex items-center gap-4 p-4 rounded-2xl mb-6"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#757480] mb-1 font-bold">Closest Real Match</p>
                        <p className="text-sm font-black text-[#e9e6f4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {archetype.realMatch}
                        </p>
                    </div>
                    <div
                        className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ml-auto border-2"
                        style={{
                            borderColor: archetype.color,
                            boxShadow: `0 0 12px ${archetype.color}80`,
                        }}
                    >
                        <img
                            src={archetype.realMatchAvatar}
                            alt={archetype.realMatch}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_virat_kohli.webp'; }}
                        />
                    </div>
                </div>

                {/* ── Life Traits ── */}
                <div
                    className="p-5 rounded-2xl mb-6"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#757480] mb-4">
                        Life Trait Analysis
                    </p>
                    {TRAIT_BARS.map((t) => (
                        <NeonLifeBar
                            key={t.key}
                            label={t.label}
                            value={lifeTraits[t.key]}
                            color={t.color}
                            glow={t.glow}
                        />
                    ))}
                </div>

                {/* ── Evolution Message ── */}
                <div
                    className="p-4 rounded-xl mb-6 relative overflow-hidden"
                    style={{
                        background: 'rgba(131,0,180,0.08)',
                        border: '1px solid rgba(131,0,180,0.2)',
                    }}
                >
                    <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ background: '#8300b4', boxShadow: '0 0 8px #8300b4' }} />
                    <p className="text-[11px] font-bold italic text-[#d575ff] leading-relaxed pl-3">
                        {storiesCompleted < 10
                            ? `Your ${weakest} is holding you back. ${evolutionMsg}`
                            : evolutionMsg}
                    </p>
                </div>

                {/* ── Evolution progress note ── */}
                <p className="text-center text-[9px] text-[#484752] uppercase tracking-[0.2em] mb-5">
                    {evolutionMsg}
                </p>

                {/* ── Share Button ── */}
                <button
                    onClick={onShare}
                    className="group w-full h-14 rounded-full relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        background: `linear-gradient(135deg, ${archetype.color} 0%, #ff51fa 100%)`,
                        boxShadow: `0 0 25px ${archetype.color}60, 0 0 50px rgba(255,81,250,0.2)`,
                    }}
                >
                    {/* Shimmer */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ transform: 'skewX(-20deg) translateX(-100%)', transition: 'transform 0.6s' }}
                    />
                    <span
                        className="relative z-10 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-[#0d0d16]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        Share Your Future Self →
                    </span>
                </button>
            </div>

            {/* CSS for float-particle */}
            <style>{`
                @keyframes float-particle {
                    0%   { transform: translateY(0)   scale(1);   opacity: 0.6; }
                    100% { transform: translateY(-18px) scale(1.3); opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}
