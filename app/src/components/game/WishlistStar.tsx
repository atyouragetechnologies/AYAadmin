import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { audioManager as audioSynth } from '../../utils/audioManager';
import { useUserStore } from '../../store/userStore';
import { WishlistModal } from './WishlistModal';

interface WishlistStarProps {
    className?: string;
    inline?: boolean;
}

export function WishlistStar({ className = '', inline = false }: WishlistStarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const profile = useUserStore((state) => state.profile);
    const isCandyMode = useUserStore((state) => state.isCandyMode);

    const handleClick = () => {
        try {
            audioSynth.playClick();
        } catch {}
        setIsOpen(true);
    };

    const starSvg = (
        <svg
            viewBox="0 0 100 100"
            className="w-full h-full transition-transform duration-300 group-hover:rotate-12"
        >
            <defs>
                <radialGradient id="starRadialGlowInline" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="25%" stopColor="#FEF08A" />
                    <stop offset="55%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#B45309" />
                </radialGradient>
                <linearGradient id="primaryBeamGradInline" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFBEB" />
                    <stop offset="40%" stopColor="#FDE047" />
                    <stop offset="75%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="secondaryBeamGradInline" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
                <filter id="glowFilterInline" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Secondary Diagonal Diamond Star (Rotated 45deg) */}
            <path
                d="M50 18 L55 45 L82 50 L55 55 L50 82 L45 55 L18 50 L45 45 Z"
                fill="url(#secondaryBeamGradInline)"
                opacity="0.9"
            />

            {/* Primary Radiant Beams */}
            <path
                d="M50 4 L57 43 L96 50 L57 57 L50 96 L43 57 L4 50 L43 43 Z"
                fill="url(#primaryBeamGradInline)"
                filter="url(#glowFilterInline)"
            />

            {/* Brilliant Star Center Core */}
            <circle cx="50" cy="50" r="9" fill="url(#starRadialGlowInline)" />
            <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" />

            {/* Tiny Diamond Center Glint */}
            <polygon points="50,44 52.5,50 50,56 47.5,50" fill="#FFFFFF" />
            <polygon points="44,50 50,52.5 56,50 50,47.5" fill="#FFFFFF" />
        </svg>
    );

    return (
        <>
            {inline ? (
                /* Inline Mode: Placed directly beneath Sound & Audio controls in top-right stack */
                <div
                    onMouseEnter={() => {
                        setIsHovered(true);
                        try { audioSynth.playHover?.(); } catch {}
                    }}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`flex items-center gap-2 pointer-events-auto ${className}`}
                >
                    {/* Expandable Wishlist Tag (expands to the left like audio sliders) */}
                    <div
                        className={clsx(
                            "transition-all duration-300 ease-in-out flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xl backdrop-blur-md",
                            isCandyMode
                                ? "bg-white/95 border-amber-300 text-amber-900"
                                : "bg-slate-900/90 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]",
                            isHovered
                                ? "w-28 opacity-100 scale-100"
                                : "w-0 opacity-0 scale-90 px-0 pointer-events-none border-none overflow-hidden"
                        )}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                            Wishlist ✨
                        </span>
                    </div>

                    {/* Round Floating Star Button matching Music & Sound controls */}
                    <button
                        type="button"
                        data-tutorial="wishlist"
                        onClick={handleClick}
                        className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border shadow-lg active:scale-95 group relative cursor-pointer",
                            isCandyMode
                                ? "bg-amber-100 text-amber-600 border-amber-300 hover:bg-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                                : "bg-slate-900/90 text-amber-300 border-amber-500/40 hover:border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.35)] hover:scale-105"
                        )}
                        title="Wish upon a Star - Wishlist a Personality"
                        aria-label="Wish upon a Star"
                    >
                        {/* Ambient Golden Pulsing Halo */}
                        <div className="absolute -inset-1 rounded-full bg-amber-400/20 blur-sm pointer-events-none group-hover:bg-amber-400/40 transition-colors animate-pulse" />

                        {/* Sparkling Star Graphic */}
                        <div className="relative w-6 h-6 flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]">
                            {starSvg}
                        </div>

                        {/* Micro Twinkle Orbit Sparkle */}
                        <div className="absolute -top-0.5 -right-0.5 pointer-events-none animate-ping">
                            <span className="block w-1.5 h-1.5 rounded-full bg-yellow-200" />
                        </div>
                    </button>
                </div>
            ) : (
                /* Standalone Mode (Fixed position fallback) */
                <motion.div
                    data-tutorial="wishlist"
                    className={`fixed left-6 md:left-8 z-40 pointer-events-auto select-none ${className}`}
                    style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}
                    animate={{
                        y: [0, -10, 0],
                        rotate: [-1.5, 1.5, -1.5],
                    }}
                    transition={{
                        duration: 3.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    onMouseEnter={() => {
                        setIsHovered(true);
                        try { audioSynth.playHover?.(); } catch {}
                    }}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <button
                        onClick={handleClick}
                        className="relative group focus:outline-none flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
                        aria-label="Wish upon a star - Open Personality Wishlist"
                        title="Wish upon a star"
                    >
                        {/* Ambient Glow Halo */}
                        <motion.div
                            className="absolute -inset-3 rounded-full blur-xl pointer-events-none"
                            animate={{
                                scale: isHovered ? [1.2, 1.35, 1.2] : [1, 1.15, 1],
                                opacity: isHovered ? [0.8, 1, 0.8] : [0.45, 0.7, 0.45],
                            }}
                            transition={{
                                duration: 2.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            style={{
                                background: isCandyMode
                                    ? 'radial-gradient(circle, rgba(244,114,182,0.6) 0%, rgba(251,191,36,0.5) 50%, transparent 75%)'
                                    : 'radial-gradient(circle, rgba(255,220,100,0.65) 0%, rgba(245,158,11,0.45) 45%, rgba(168,85,247,0.3) 70%, transparent 85%)',
                            }}
                        />

                        {/* Main Brilliant Sparkling Star Container */}
                        <motion.div
                            className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center filter drop-shadow-[0_0_16px_rgba(245,158,11,0.85)]"
                            whileHover={{ scale: 1.16 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            {starSvg}
                        </motion.div>

                        {/* Interactive Wishlist Tag Pill */}
                        <div className="mt-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-amber-500/40 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)] group-hover:scale-105 group-hover:border-amber-400 group-hover:text-yellow-200 transition-all">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-0.5" />
                            <span>Wishlist</span>
                        </div>
                    </button>
                </motion.div>
            )}

            {/* Wishlist Modal Dialog */}
            <WishlistModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                userId={profile?.id}
                isCandyMode={isCandyMode}
            />
        </>
    );
}

export default WishlistStar;
