import React from 'react';
import { motion } from 'framer-motion';
import { useDevicePerformance } from '../../hooks/useDevicePerformance';

interface CyberpunkAmbientBackgroundProps {
    isViolet?: boolean;
    isCyan?: boolean;
}

// Pre-calculated particle parameters to prevent runtime re-allocations
const PARTICLES = Array.from({ length: 14 }).map((_, i) => ({
    id: i,
    x: (i * 7 + 13) % 100,
    y: (i * 11 + 7) % 100,
    size: (i % 3) + 2,
    duration: (i % 5) + 7,
    delay: (i % 4) * 0.7,
    color: i % 2 === 0 ? 'rgba(0,241,254,0.7)' : 'rgba(192,132,252,0.7)',
}));

// Pre-calculated 3D Starfield parameters for zero-lag hardware-accelerated rendering
const STARS = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    top: `${(i * 17 + 5) % 95}%`,
    left: `${(i * 23 + 11) % 95}%`,
    size: (i % 3) === 0 ? 3 : (i % 2 === 0 ? 2 : 1),
    duration: (i % 4) + 2.5,
    delay: (i % 5) * 0.4,
    color: i % 3 === 0 ? '#00f1fe' : i % 2 === 0 ? '#c084fc' : '#ffffff',
}));

export const CyberpunkAmbientBackground: React.FC<CyberpunkAmbientBackgroundProps> = ({
    isViolet = true,
    isCyan = false,
}) => {
    const { isLowEnd } = useDevicePerformance();

    return (
        <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none z-0 select-none bg-[#0d0d16]">
            {/* Vignette Depth Layer */}
            <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.95)] z-10" />

            {/* Zero-Lag Cyberpunk 3D Starfield Layer */}
            {!isLowEnd && (
                <div className="absolute inset-0 z-5 pointer-events-none">
                {STARS.map((star) => (
                    <motion.div
                        key={`star-${star.id}`}
                        initial={{ opacity: 0.2, scale: 0.8 }}
                        animate={{
                            opacity: [0.15, 0.9, 0.15],
                            scale: [0.8, 1.3, 0.8],
                        }}
                        transition={{
                            duration: star.duration,
                            repeat: Infinity,
                            delay: star.delay,
                            ease: 'easeInOut',
                        }}
                        style={{
                            top: star.top,
                            left: star.left,
                            width: star.size,
                            height: star.size,
                            backgroundColor: star.color,
                            boxShadow: `0 0 ${star.size * 3}px ${star.color}`,
                        }}
                        className="absolute rounded-full"
                    />
                ))}
                </div>
            )}

            {/* Dynamic Spotlight Glow Orbs */}
            <motion.div
                animate={{
                    opacity: [0.15, 0.35, 0.15],
                    scale: [1, 1.15, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[120px] transition-colors duration-1000 ${
                    isViolet ? 'bg-[#9333ea]/30' : 'bg-[#00f1fe]/20'
                }`}
            />
            <motion.div
                animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1.1, 1, 1.1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className={`absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-[120px] transition-colors duration-1000 ${
                    isCyan ? 'bg-[#00f1fe]/25' : 'bg-[#c084fc]/25'
                }`}
            />

            {/* Perspective Cyberpunk 3D Grid Plane */}
            <div className="absolute inset-x-0 bottom-0 h-80 opacity-20 overflow-hidden [perspective:800px]">
                <div 
                    className="w-[200%] h-[200%] -ml-[50%] bg-[size:45px_45px] [transform:rotateX(68deg)] origin-bottom"
                    style={{
                        backgroundImage: `linear-gradient(to right, ${isViolet ? 'rgba(147,51,234,0.35)' : 'rgba(0,241,254,0.35)'} 1px, transparent 1px), linear-gradient(to bottom, ${isCyan ? 'rgba(0,241,254,0.35)' : 'rgba(147,51,234,0.35)'} 1px, transparent 1px)`
                    }}
                />
            </div>

            {/* Floating Ambient Glowing Particles */}
            {!isLowEnd && (
                <div className="absolute inset-0 z-10">
                {PARTICLES.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{
                            x: `${particle.x}vw`,
                            y: `${particle.y}vh`,
                            opacity: 0.2,
                        }}
                        animate={{
                            y: [`${particle.y}vh`, `${(particle.y - 25 + 100) % 100}vh`],
                            x: [`${particle.x}vw`, `${particle.x + (particle.id % 2 === 0 ? 3 : -3)}vw`],
                            opacity: [0.2, 0.85, 0.2],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                            ease: 'easeInOut',
                        }}
                        style={{
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: particle.color,
                            boxShadow: `0 0 10px ${particle.color}`,
                        }}
                        className="absolute rounded-full pointer-events-none"
                    />
                ))}
                </div>
            )}
        </div>
    );
};
