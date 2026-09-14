import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSpinCountdown } from '../../hooks/useSpinCountdown';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { unlockAudio, playTick, playWin, playClick } from '../../utils/audioManager';
import { fetchSpinsUsed, recordSpinUsage, MAX_DAILY_SPINS } from '../../utils/spinLimit';
import clsx from 'clsx';
import './MoodWheel.css';

// ─── Exported type (re-exported so LevelMap can import from here) ─────────────
export type MoodArchetype =
  | 'Heartbreak' | 'Motivation' | 'Confidence'
  | 'Money'      | 'Purpose'    | 'Loneliness';

// ─── Segment definitions ──────────────────────────────────────────────────────
const SEGMENTS = [
  { label: 'HEARTBREAK', emoji: '💔', base: '#8B0030', glow: '#FF2D78', mood: 'Heartbreak'  as MoodArchetype },
  { label: 'AMBITION',   emoji: '⚡', base: '#7A3800', glow: '#FF8C00', mood: 'Motivation'  as MoodArchetype },
  { label: 'MONEY',      emoji: '💸', base: '#7A6000', glow: '#FFD700', mood: 'Money'        as MoodArchetype },
  { label: 'VISION',     emoji: '👁',  base: '#003D47', glow: '#00E5FF', mood: 'Purpose'     as MoodArchetype },
  { label: 'FRIENDSHIP', emoji: '🤝', base: '#004D2A', glow: '#00FF88', mood: 'Loneliness'  as MoodArchetype },
  { label: 'WILD CARD',  emoji: '🎲', base: '#3D0080', glow: '#A855F7', mood: null },
] as const;

const N = SEGMENTS.length;         // 6
const SEG_DEG = 360 / N;           // 60°



// ─── SVG polar math ───────────────────────────────────────────────────────────
const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const segPath = (cx: number, cy: number, r: number, start: number, end: number) => {
  const s = polar(cx, cy, r, start);
  const e = polar(cx, cy, r, end);
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y} Z`;
};

// ─── Stars (generated once) ───────────────────────────────────────────────────
const STARS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: 1 + Math.random() * 2,
  dur: 6 + Math.random() * 7,
  delay: Math.random() * 6,
  op: 0.3 + Math.random() * 0.6,
  dx: (Math.random() - 0.5) * 14,
  dy: -6 - Math.random() * 16,
}));

// ─── Confetti builder ─────────────────────────────────────────────────────────
const buildConfetti = (color: string) =>
  Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * 360 + Math.random() * 14;
    const dist = 70 + Math.random() * 180;
    const rad = (angle * Math.PI) / 180;
    return {
      id: i,
      color,
      tx: Math.cos(rad) * dist,
      ty: Math.sin(rad) * dist - 50,
      rot: Math.random() * 800 - 400,
      dur: 0.9 + Math.random() * 0.55,
    };
  });

// ─── Props ────────────────────────────────────────────────────────────────────
interface MoodWheelProps {
  userId: string;
  userAge: number;
  onMoodSelected: (mood: string) => void;
  onClose: () => void;
}

// ─── State machine ────────────────────────────────────────────────────────────
type WheelPhase = 'loading' | 'idle' | 'spinning' | 'landing' | 'result' | 'no-spins';

// ─── Component ────────────────────────────────────────────────────────────────
export function MoodWheel({ userId, onMoodSelected, onClose }: MoodWheelProps) {
  // Spin limit
  const [spinsUsed, setSpinsUsed]   = useState(0);
  const [phase, setPhase]           = useState<WheelPhase>('loading');
  const [winIdx, setWinIdx]         = useState<number | null>(null);
  const [confetti, setConfetti]     = useState<ReturnType<typeof buildConfetti>>([]);
  const [showVignette, setVignette] = useState(false);
  const [isShudder, setShudder]     = useState(false);
  const [pointerLand, setPointerLand] = useState(false);
  const countdownStr = useSpinCountdown();

  // Framer Motion value for wheel rotation (no re-renders per frame)
  const rotation = useMotionValue(0);

  // Tick tracking
  const lastSegmentRef = useRef(-1);
  const totalRotRef = useRef(0); // kept in sync after each spin

  // Wheel sizing
  const [dia, setDia] = useState(300);
  useEffect(() => {
    const calc = () => {
      const small = window.innerHeight < 680;
      const vwF = small ? 0.70 : 0.78;
      const dvhAdj = window.innerHeight - 220;
      setDia(Math.max(180, Math.min(window.innerWidth * vwF, dvhAdj, 430)));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // Load spin data on mount & listen to real-time spin updates
  useEffect(() => {
    let isMounted = true;

    fetchSpinsUsed(userId).then((used) => {
      if (!isMounted) return;
      setSpinsUsed(used);
      setPhase(used >= MAX_DAILY_SPINS ? 'no-spins' : 'idle');
    });

    const handleSpinsUpdated = (e: any) => {
      if (!isMounted) return;
      const count = typeof e.detail?.count === 'number' ? e.detail.count : 0;
      setSpinsUsed(count);
      if (count >= MAX_DAILY_SPINS) {
        setPhase('no-spins');
      }
    };

    const handleSpinsReset = () => {
      if (!isMounted) return;
      setSpinsUsed(0);
      setPhase('idle');
    };

    window.addEventListener('aya-spins-updated', handleSpinsUpdated);
    window.addEventListener('aya-spins-reset', handleSpinsReset);

    return () => {
      isMounted = false;
      window.removeEventListener('aya-spins-updated', handleSpinsUpdated);
      window.removeEventListener('aya-spins-reset', handleSpinsReset);
    };
  }, [userId]);

  // Countdown timer is now driven by the useSpinCountdown hook above

  const onWheelUpdate = (latest: { rotate?: number }) => {
    if (phase !== 'spinning' || latest.rotate === undefined) return;
    const currentAngle = latest.rotate % 360;
    const currentSegment = Math.floor(((currentAngle % 360) + 360) % 360 / 60);
    
    if (currentSegment !== lastSegmentRef.current) {
      lastSegmentRef.current = currentSegment;
      playTick();
    }
  };

  // ── Spin handler ────────────────────────────────────────────────────────────
  const handleSpin = useCallback(async () => {
    if (phase !== 'idle' || spinsUsed >= 2) return;

    // FIRST LINE — must be synchronous inside gesture handler for Safari
    await unlockAudio();

    setPhase('spinning');

    // Step 1: pick a truly random winning segment fresh every spin
    let winningIndex = Math.floor(Math.random() * 6); // 0–5, new every time
    if (winningIndex === 5) winningIndex = Math.floor(Math.random() * 5); // Remap wild card

    // Step 2: calculate the angle of the center of winning segment
    const segmentCenter = winningIndex * 60 + 30; // center of that segment in degrees
    const randomOffsetWithinSegment = (Math.random() - 0.5) * 30; // ±15° wobble
    const targetSegmentAngle = segmentCenter + randomOffsetWithinSegment;

    // Step 3: calculate total rotation
    const fullRotations = (4 + Math.floor(Math.random() * 3)) * 360; // 4–6 full spins
    const totalRotation = totalRotRef.current + fullRotations + targetSegmentAngle;

    // Step 4: update the ref for next spin
    totalRotRef.current = totalRotation;

    // Step 5: animate to totalRotation
    await animate(rotation, totalRotation, {
      duration: 4,
      ease: [0.2, 0.8, 0.2, 1], // simple 4s deceleration
    });

    // Step 6: after animation completes, derive which segment is under pointer
    const normalizedAngle = totalRotation % 360;
    const actualWinningIndex = Math.floor(normalizedAngle / 60) % 6;
    const wonSegment = SEGMENTS[actualWinningIndex];
    
    // ── Landing effects ──
    setWinIdx(actualWinningIndex);
    setPhase('landing');

    // Shudder
    setShudder(true);
    setTimeout(() => setShudder(false), 500);

    // Pointer bounce
    setPointerLand(true);
    setTimeout(() => setPointerLand(false), 500);

    // Confetti + vignette
    const winGlow = wonSegment.glow;
    setConfetti(buildConfetti(winGlow));
    setTimeout(() => setConfetti([]), 2200);
    setVignette(true);
    setTimeout(() => setVignette(false), 400);

    // Win sound
    playWin();

    // Record spin usage across storage, store, and backend
    const newUsed = await recordSpinUsage(userId, spinsUsed);
    setSpinsUsed(newUsed);

    // Show result after shudder settles
    setTimeout(() => {
      setPhase('result');
      // After 1.5s in result → trigger callback
      setTimeout(() => {
        const resolved: MoodArchetype = wonSegment.mood ?? 'Heartbreak';
        onMoodSelected(resolved);
      }, 1500);
    }, 600);
  }, [phase, spinsUsed, userId, rotation, onMoodSelected]);

  // ── SVG geometry ────────────────────────────────────────────────────────────
  const cx = dia / 2, cy = dia / 2;
  const r = dia / 2 - 4;
  const hubR = dia * 0.1;
  const emojiR = r * 0.62;
  const labelR = r * 0.83;
  const emojiFz = Math.max(14, dia * 0.09);
  const labelFz = Math.max(7, dia * 0.052);



  const btnLabel =
    phase === 'loading'   ? 'LOADING...'  :
    phase === 'spinning'  ? 'SPINNING...' :
    phase === 'landing'   ? '⭐ LANDED!'  :
    phase === 'result'    ? '✨ MATCHED!' :
    phase === 'no-spins'  ? 'NO SPINS LEFT' :
    spinsUsed === 1       ? '🎰  SPIN AGAIN (1 LEFT)' :
    '🎰  SPIN (2 SPINS)';

  return (
    <AnimatePresence>
      <motion.div
        className="mw-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
      >
        {/* Stars */}
        <div className="mw-stars" aria-hidden>
          {STARS.map(s => (
            <div
              key={s.id}
              className="mw-star"
              style={{
                top: `${s.top}%`, left: `${s.left}%`,
                width: s.size, height: s.size,
                '--dur': `${s.dur}s`, '--delay': `${s.delay}s`,
                '--op': s.op, '--dx': `${s.dx}px`, '--dy': `${s.dy}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Vignette flash */}
        {showVignette && winIdx !== null && (
          <div
            className="mw-vignette"
            style={{ '--vc': SEGMENTS[winIdx].glow } as React.CSSProperties}
            aria-hidden
          />
        )}

        {/* Confetti */}
        <div className="mw-confetti-layer" aria-hidden>
          {confetti.map(p => (
            <div
              key={p.id}
              className="mw-confetti-particle"
              style={{
                background: p.color,
                '--tx': `${p.tx}px`, '--ty': `${p.ty}px`,
                '--rot': `${p.rot}deg`, '--dur': `${p.dur}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Top Controls Bar: Back button + Spins Counter Badge */}
        <div className="absolute top-[72px] sm:top-[76px] left-0 right-0 px-4 sm:px-6 flex items-center justify-between z-[99] pointer-events-auto select-none">
          <button
            onClick={() => { playClick(); onClose(); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/70 text-slate-300 hover:text-white hover:border-cyan-500/50 backdrop-blur-md transition-all text-xs font-bold uppercase tracking-wider active:scale-95 shadow-lg outline-none cursor-pointer"
            aria-label="Back to Map"
          >
            ← BACK
          </button>

          <div
            className={clsx(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md text-xs font-black uppercase tracking-wider transition-all select-none shadow-lg",
              spinsUsed >= MAX_DAILY_SPINS
                ? "bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                : spinsUsed === 1
                ? "bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                : "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            )}
          >
            {spinsUsed >= MAX_DAILY_SPINS ? (
              <>
                <span className="text-sm">🔒</span>
                <span>NO SPINS LEFT</span>
              </>
            ) : spinsUsed === 1 ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>1 SPIN LEFT TODAY</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>2 SPINS LEFT TODAY</span>
              </>
            )}
          </div>
        </div>

        {/* ── Wheel area ── */}
        <div className="mw-wheel-area">

          {/* Gold pointer */}
          <div className="mw-pointer-wrap">
            <div className={`mw-pointer ${pointerLand ? 'mw-pointer-land' : 'mw-pointer-idle'}`} />
          </div>

          {/* 3D perspective + ring */}
          <div className="mw-perspective">
            <div className={`mw-wheel-tilt${isShudder ? ' mw-shudder' : ''}`}>
              <div className="mw-outer-ring">
                {/* Spinning SVG */}
                <motion.div
                  onUpdate={onWheelUpdate}
                  style={{
                    rotate: rotation,
                    width: dia,
                    height: dia,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    opacity: phase === 'no-spins' ? 0.38 : 1,
                    transition: 'opacity 0.4s',
                  }}
                >
                  <svg
                    className="mw-wheel-svg"
                    width={dia}
                    height={dia}
                    viewBox={`0 0 ${dia} ${dia}`}
                  >
                    <defs>
                      {SEGMENTS.map((seg, i) => (
                        <radialGradient key={i} id={`mwg${i}`} cx="38%" cy="38%" r="75%">
                          <stop offset="0%" stopColor={seg.glow} stopOpacity="0.55" />
                          <stop offset="55%" stopColor={seg.base} stopOpacity="1" />
                          <stop offset="100%" stopColor={seg.base} stopOpacity="0.9" />
                        </radialGradient>
                      ))}
                      {/* Inner glow filter */}
                      <filter id="mwInnerGlow" x="-5%" y="-5%" width="110%" height="110%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Segments */}
                    {SEGMENTS.map((seg, i) => {
                      // Reverse visual drawing so it matches the clockwise rotation logic perfectly
                      const start = 360 - (i + 1) * SEG_DEG;
                      const end   = 360 - i * SEG_DEG;
                      const isWinner = phase === 'result' && winIdx === i;
                      const midAngle = start + SEG_DEG / 2;
                      const ePos = polar(cx, cy, emojiR, midAngle);
                      const lPos = polar(cx, cy, labelR, midAngle);

                      return (
                        <g key={i} className={isWinner ? 'mw-seg-winner' : ''}>
                          {/* Segment fill */}
                          <path
                            d={segPath(cx, cy, r, start, end)}
                            fill={`url(#mwg${i})`}
                            stroke="#FFD700"
                            strokeWidth="1.5"
                            strokeOpacity="0.7"
                          />
                          {/* Inner glow edge */}
                          <path
                            d={segPath(cx, cy, r * 0.98, start + 1, end - 1)}
                            fill="none"
                            stroke={seg.glow}
                            strokeWidth="3"
                            strokeOpacity="0.25"
                          />
                          {/* Emoji */}
                          <text
                            x={ePos.x} y={ePos.y}
                            textAnchor="middle" dominantBaseline="middle"
                            fontSize={emojiFz}
                            style={{ userSelect: 'none', pointerEvents: 'none' }}
                          >{seg.emoji}</text>
                          {/* Rotated label */}
                          <text
                            x={lPos.x} y={lPos.y}
                            textAnchor="middle" dominantBaseline="middle"
                            fontSize={labelFz}
                            fontFamily="Space Grotesk, sans-serif"
                            fontWeight="800"
                            letterSpacing="0.06em"
                            fill="#fff"
                            stroke="rgba(0,0,0,0.5)"
                            strokeWidth="2"
                            paintOrder="stroke fill"
                            style={{ userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' }}
                            transform={`rotate(${midAngle}, ${lPos.x}, ${lPos.y})`}
                          >{seg.label}</text>
                        </g>
                      );
                    })}

                    {/* Hub */}
                    <circle cx={cx} cy={cy} r={hubR + 3}
                      fill="none" stroke="#FFD700" strokeWidth="2.5" strokeOpacity="0.9"
                      style={{ filter: 'drop-shadow(0 0 6px #FFD700)' }}
                    />
                    <circle cx={cx} cy={cy} r={hubR}
                      fill="radial-gradient"
                      style={{
                        fill: 'url(#hubGrad)',
                        animation: 'hub-pulse 2.5s ease-in-out infinite',
                        filter: 'drop-shadow(0 0 8px #FFD70080)',
                      }}
                    />
                    <defs>
                      <radialGradient id="hubGrad" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
                        <stop offset="30%" stopColor="#FFD700" stopOpacity="0.7" />
                        <stop offset="70%" stopColor="#1a0a00" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#0a0800" stopOpacity="1" />
                      </radialGradient>
                    </defs>
                    {/* Hub glint */}
                    <circle cx={cx - hubR*0.28} cy={cy - hubR*0.28} r={hubR * 0.22}
                      fill="rgba(255,255,255,0.55)"
                    />
                  </svg>
                </motion.div>

                {/* No-spins overlay */}
                {phase === 'no-spins' && (
                  <div className="mw-no-spins-overlay" style={{ width: dia, height: dia }}>
                    <span className="mw-lock-emoji">🔒</span>
                    <span className="mw-comeback-text">COME BACK TOMORROW</span>
                    <span className="mw-countdown">Resets in {countdownStr}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mood banner (result phase) */}
          <AnimatePresence>
            {phase === 'result' && winIdx !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                <div
                  className="mw-mood-banner"
                  style={{
                    color: SEGMENTS[winIdx].glow,
                    borderColor: `${SEGMENTS[winIdx].glow}55`,
                    background: `${SEGMENTS[winIdx].glow}12`,
                    textShadow: `0 0 14px ${SEGMENTS[winIdx].glow}`,
                  }}
                >
                  {SEGMENTS[winIdx].emoji} YOUR MOOD: {SEGMENTS[winIdx].label}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SPIN button ── */}
        <button
          id="mood-wheel-spin-btn"
          className={`mw-spin-btn${phase === 'no-spins' ? ' no-spins' : ''}`}
          disabled={phase !== 'idle'}
          onClick={handleSpin}
          aria-label="Spin the mood wheel"
        >
          {btnLabel}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
