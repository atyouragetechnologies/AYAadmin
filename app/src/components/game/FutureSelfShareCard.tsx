import { forwardRef } from 'react';
import type { FutureMatch } from '../../utils/futureSelfMatch';

interface FutureSelfShareCardProps {
    futureMatch: FutureMatch;
    userName?: string;
}

/**
 * Premium 1080×1080 Future Self Social Share Card.
 * Designed for flawless, crisp capture via dom-to-image without text clipping or overlapping.
 */
export const FutureSelfShareCard = forwardRef<HTMLDivElement, FutureSelfShareCardProps>(
    ({ futureMatch, userName }, ref) => {
        const { archetype, lifeTraits } = futureMatch || {
            archetype: {
                name: 'The Resilient',
                emoji: '⚡',
                description: 'You turn extreme uncertainty and setbacks into unstoppable momentum.',
                realMatch: 'Justin Bieber',
                realMatchAvatar: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/portrait-justin-19.webp',
                percentile: 'Top 10%',
                color: '#d575ff',
                colorSecondary: '#00f2ff',
                traits: {}
            },
            score: 92,
            lifeTraits: {
                resilience: 88,
                creativity: 85,
                courage: 82,
                discipline: 78,
                emotional_control: 75,
                leadership: 80,
                risk_intelligence: 84,
                consistency: 79
            }
        };

        // Extract top 3 life traits for the mini-HUD stats
        const topTraits = lifeTraits
            ? Object.entries(lifeTraits)
                  .map(([key, val]) => ({
                      label: key.replace(/_/g, ' ').toUpperCase(),
                      val: Math.round(val || 50)
                  }))
                  .sort((a, b) => b.val - a.val)
                  .slice(0, 3)
            : [
                  { label: 'RESILIENCE', val: 90 },
                  { label: 'CREATIVITY', val: 86 },
                  { label: 'RISK INTELLIGENCE', val: 82 }
              ];

        const primaryColor = archetype.color || '#00f2ff';
        const secondaryColor = archetype.colorSecondary || '#d575ff';

        return (
            <div
                ref={ref}
                style={{
                    width: 1080,
                    height: 1080,
                    backgroundColor: '#07050f',
                    fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif",
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px',
                    boxSizing: 'border-box',
                }}
            >
                {/* ── Background Cyber Universe Gradients ── */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 50% 20%, #1a1033 0%, #0c081d 55%, #05030a 100%)',
                        zIndex: 0,
                    }}
                />

                {/* Ambient Top Glow in Archetype Primary Color */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 700,
                        height: 700,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${primaryColor}22 0%, transparent 70%)`,
                        filter: 'blur(70px)',
                        zIndex: 1,
                        pointerEvents: 'none',
                    }}
                />

                {/* Ambient Bottom Glow in Secondary Color */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-100px',
                        right: '-50px',
                        width: 600,
                        height: 600,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${secondaryColor}18 0%, transparent 70%)`,
                        filter: 'blur(80px)',
                        zIndex: 1,
                        pointerEvents: 'none',
                    }}
                />

                {/* Subtle Decorative Star Sparks */}
                {[
                    { top: 60, left: 70, size: 8, color: '#00f2ff' },
                    { top: 120, right: 80, size: 6, color: '#d575ff' },
                    { bottom: 90, left: 90, size: 7, color: primaryColor },
                    { bottom: 70, right: 80, size: 5, color: '#ff51fa' },
                ].map((p, idx) => (
                    <div
                        key={idx}
                        style={{
                            position: 'absolute',
                            width: p.size,
                            height: p.size,
                            borderRadius: '50%',
                            backgroundColor: p.color,
                            top: p.top,
                            left: p.left,
                            right: p.right,
                            bottom: p.bottom,
                            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                            zIndex: 2,
                        }}
                    />
                ))}

                {/* ── Main Glassmorphic Holo Frame ── */}
                <div
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(16, 12, 28, 0.82)',
                        borderRadius: 32,
                        border: '1.5px solid rgba(0, 242, 255, 0.25)',
                        boxShadow: `0 0 0 1px rgba(168, 85, 247, 0.35), 0 25px 60px rgba(0, 0, 0, 0.8), inset 0 0 80px rgba(0, 0, 0, 0.6)`,
                        padding: '44px 50px 36px 50px',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* ══ 1. HEADER SECTION ══ */}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Brand Pill */}
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 16px',
                                borderRadius: 9999,
                                background: 'rgba(0, 242, 255, 0.08)',
                                border: '1px solid rgba(0, 242, 255, 0.3)',
                                boxShadow: '0 0 15px rgba(0, 242, 255, 0.15)',
                            }}
                        >
                            <span style={{ fontSize: 16 }}>🔮</span>
                            <span
                                style={{
                                    fontSize: 13,
                                    fontWeight: 900,
                                    letterSpacing: '0.24em',
                                    textTransform: 'uppercase',
                                    color: '#00f2ff',
                                    textShadow: '0 0 12px rgba(0, 242, 255, 0.8)',
                                }}
                            >
                                AT YOUR AGE
                            </span>
                        </div>

                        {/* Telemetry Tag */}
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 800,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: '#a855f7',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            <span
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    backgroundColor: '#00ff9d',
                                    boxShadow: '0 0 8px #00ff9d',
                                }}
                            />
                            <span>FUTURE SELF ARCHETYPE</span>
                        </div>
                    </div>

                    {/* ══ 2. CENTER HERO ARCHETYPE ══ */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            width: '100%',
                            margin: '10px 0',
                        }}
                    >
                        {/* Glowing Holographic Halo + Icon */}
                        <div
                            style={{
                                position: 'relative',
                                width: 110,
                                height: 110,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 14,
                            }}
                        >
                            {/* Radial Glow */}
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '50%',
                                    background: `radial-gradient(circle, ${primaryColor}40 0%, ${secondaryColor}20 50%, transparent 75%)`,
                                    filter: 'blur(15px)',
                                }}
                            />
                            {/* Outer Hexagon / Circle Ring */}
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 4,
                                    borderRadius: '50%',
                                    border: `2px solid ${primaryColor}`,
                                    boxShadow: `0 0 25px ${primaryColor}90, inset 0 0 15px ${secondaryColor}60`,
                                    background: 'rgba(10, 8, 24, 0.7)',
                                }}
                            />
                            {/* Emblem Glyph */}
                            <span
                                style={{
                                    position: 'relative',
                                    zIndex: 2,
                                    fontSize: 52,
                                    lineHeight: 1,
                                    filter: `drop-shadow(0 0 16px ${primaryColor})`,
                                }}
                            >
                                {archetype.emoji || '⭐'}
                            </span>
                        </div>

                        {/* Sub-label */}
                        <p
                            style={{
                                margin: '0 0 6px 0',
                                fontSize: 13,
                                color: '#94a3b8',
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                lineHeight: '1.2',
                            }}
                        >
                            MY TRAJECTORY DECODER
                        </p>

                        {/* Archetype Name (Sized so it NEVER cuts off!) */}
                        <h1
                            style={{
                                margin: '0 0 14px 0',
                                fontSize: 54,
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                lineHeight: '1.1',
                                color: '#ffffff',
                                textShadow: `0 0 25px ${primaryColor}cc, 0 0 50px ${secondaryColor}88, 0 2px 4px rgba(0,0,0,0.9)`,
                                maxWidth: '900px',
                            }}
                        >
                            {archetype.name}
                        </h1>

                        {/* Percentile Pill Badge */}
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 24px',
                                borderRadius: 9999,
                                border: '1.5px solid rgba(245, 158, 11, 0.6)',
                                background: 'rgba(245, 158, 11, 0.12)',
                                boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
                                marginBottom: 14,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <span style={{ fontSize: 16 }}>⭐</span>
                            <span
                                style={{
                                    fontSize: 16,
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.14em',
                                    color: '#fbbf24',
                                }}
                            >
                                {archetype.percentile} DECISION MAKER
                            </span>
                        </div>

                        {/* Description Quote */}
                        <p
                            style={{
                                margin: '0',
                                fontSize: 17,
                                color: '#cbd5e1',
                                letterSpacing: '0.03em',
                                lineHeight: '1.45',
                                maxWidth: '780px',
                                fontStyle: 'italic',
                            }}
                        >
                            "{archetype.description}"
                        </p>
                    </div>

                    {/* ══ 3. MINI TRAIT METRICS (Top 3 Stats) ══ */}
                    <div
                        style={{
                            width: '100%',
                            maxWidth: 820,
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 16,
                            margin: '4px 0',
                        }}
                    >
                        {topTraits.map((t, i) => (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    borderRadius: 16,
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 4,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        letterSpacing: '0.15em',
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {t.label}
                                </span>
                                <span
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 900,
                                        color: i === 0 ? '#00f2ff' : i === 1 ? '#d575ff' : '#00ff9d',
                                        fontFamily: 'ui-monospace, monospace',
                                    }}
                                >
                                    {t.val}%
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* ══ 4. CLOSEST REAL MATCH SHOWCASE ══ */}
                    <div
                        style={{
                            width: '100%',
                            maxWidth: 820,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 22,
                            padding: '16px 26px',
                            borderRadius: 22,
                            background: 'rgba(0, 0, 0, 0.45)',
                            border: `1.5px solid ${primaryColor}40`,
                            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 20px ${primaryColor}10`,
                        }}
                    >
                        {/* Portrait */}
                        <img
                            src={archetype.realMatchAvatar}
                            alt={archetype.realMatch}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_virat_kohli.webp';
                            }}
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: `2.5px solid ${primaryColor}`,
                                boxShadow: `0 0 20px ${primaryColor}80`,
                                flexShrink: 0,
                            }}
                        />

                        {/* Mirror Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 12,
                                    color: '#00f2ff',
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    fontWeight: 900,
                                }}
                            >
                                NEURAL MIRROR MATCH
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 28,
                                    fontWeight: 900,
                                    color: '#ffffff',
                                    letterSpacing: '0.03em',
                                    lineHeight: '1.2',
                                }}
                            >
                                {archetype.realMatch}
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 12,
                                    color: '#94a3b8',
                                    letterSpacing: '0.06em',
                                }}
                            >
                                Calibrated against pivotal turning points & decisions
                            </p>
                        </div>
                    </div>

                    {/* ══ 5. FOOTER SECTION ══ */}
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            paddingTop: 16,
                            marginTop: 6,
                        }}
                    >
                        {/* Play Link */}
                        <p
                            style={{
                                margin: 0,
                                fontSize: 14,
                                color: '#64748b',
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                            }}
                        >
                            DISCOVER YOURS AT{' '}
                            <span style={{ color: '#00f2ff', fontWeight: 900 }}>
                                AYALAND.LOVABLE.APP
                            </span>
                        </p>

                        {/* Player Watermark */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    backgroundColor: '#00f2ff',
                                    boxShadow: '0 0 6px #00f2ff',
                                }}
                            />
                            <span
                                style={{
                                    fontSize: 14,
                                    fontWeight: 800,
                                    color: '#cbd5e1',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {userName ? `AGENT: @${userName}` : 'AYA // PLAYER'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

FutureSelfShareCard.displayName = 'FutureSelfShareCard';

