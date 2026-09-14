import { useUserStore } from '../../store/userStore';
import { Lock, Star, Settings, BookOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { createPortal } from 'react-dom';
import { DISCLAIMER_TEXT } from './AntiGravityCanvas';
import clsx from 'clsx';
import { AudioController } from '../shared/AudioController';
import { audioManager as audioSynth } from "../../utils/audioManager";
import { motion, useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { resolvePersonalityAvatar } from '../../utils/avatarUtils';


// Using Canvas with preloaded JPEG sequence (optimized to 60 frames)
const FRAME_CACHE: HTMLImageElement[] = [];
let framesLoadedCount = 0;

interface SolarMapProps {
    onPlayLevel: (level: any) => void;
    onOpenDnaProfile: () => void;
    isMapActive?: boolean;
}

export function SolarMap({ onPlayLevel, onOpenDnaProfile, isMapActive = true }: SolarMapProps) {
    const navigate = useNavigate();
    const levels = useUserStore((state) => state.levels);
    const profile = useUserStore((state) => state.profile);

    // Admin check — use profile.isAdmin from the store, with fallback to DB check
    const [isAdmin, setIsAdmin] = useState(!!profile?.isAdmin);
    useEffect(() => {
        if (profile?.isAdmin) { setIsAdmin(true); return; }
        const checkAdmin = async () => {
            try {
                const { checkIsAdmin } = await import('../../utils/adminCheck');
                const result = await checkIsAdmin();
                if (result) setIsAdmin(true);
            } catch {}
        };
        checkAdmin();
    }, [profile?.isAdmin]);
    const activeAge = profile?.age || 18;
    let processedLevels = levels.filter(l => Number(l.age) === Number(activeAge));

    // New stories that should be visible to ALL users regardless of interests.
    const alwaysShowPersonalities = new Set([
        'Billie Eilish', 'MrBeast', 'Ritesh Agarwal', 'Muhammad Ali',
        'Dhruv Rathee', 'Falguni Nayar', 'Nikola Tesla',
        'Zendaya', 'Neeraj Chopra', 'Prajakta Koli', 'Selena Gomez', 'Shah Rukh Khan'
    ]);

    if (profile?.psychologicalProfile) {
        const { interest_goal = '', interest_domain = '' } = profile.psychologicalProfile as any;

        let allowedNames = new Set<string>();
        let bypassFilter = false;

        const goals = interest_goal.split(',').map((s: string) => s.trim());
        const domains = interest_domain.split(',').map((s: string) => s.trim());
        const interests = [...goals, ...domains];

        if (interests.some((i: string) => i.includes('Success') || i.includes('Leadership'))) {
            bypassFilter = true;
        }

        if (!bypassFilter && interests.length > 0) {
            if (interests.some((i: string) => i.includes('Money') || i.includes('Business'))) {
                ['Bill Gates', 'Ratan Tata', 'Indra Nooyi', 'Walt Disney'].forEach(n => allowedNames.add(n));
            }
            if (interests.some((i: string) => i.includes('Tech'))) {
                ['Bill Gates', 'Steve Jobs', 'Sundar Pichai'].forEach(n => allowedNames.add(n));
            }
            if (interests.some((i: string) => i.includes('Creativity') || i.includes('Love'))) {
                ['Taylor Swift', 'Shah Rukh Khan', 'Frida Kahlo', 'A.R. Rahman', 'Steven Spielberg', 'J.K. Rowling', 'Mary Shelley'].forEach(n => allowedNames.add(n));
            }
            if (interests.some((i: string) => i.includes('Discipline'))) {
                ['Sachin Tendulkar', 'Virat Kohli', 'Kobe Bryant', 'P.V. Sindhu', 'Arnold'].forEach(n => allowedNames.add(n));
            }

            if (allowedNames.size > 0) {
                processedLevels = processedLevels.filter(l => {
                    const p = l.personality || '';
                    if (Array.from(alwaysShowPersonalities).some(n => p.includes(n))) return true;
                    return Array.from(allowedNames).some(name => p.includes(name));
                });
            }
        }
    }

    const ageLevels = processedLevels;

    // Streaks
    const checkStreak = useUserStore((state) => state.checkStreak);
    
    useEffect(() => {
        checkStreak(); // evaluate streaks on mount
    }, [checkStreak]);



    // Mobile Detection
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Configuration
    const NODE_SPACING_DESKTOP = 220;
    const NODE_SPACING_MOBILE = 180;
    const NODE_SPACING = isMobile ? NODE_SPACING_MOBILE : NODE_SPACING_DESKTOP;

    const DESKTOP_NODE_OFFSETS = [0, -60, 50, -50, 20, 60, -40, 30, -60, 0];
    const MOBILE_NODE_OFFSETS = [0, -20, 20, -20, 10, 25, -15, 10, -20, 0];

    const NODE_OFFSETS = isMobile ? MOBILE_NODE_OFFSETS : DESKTOP_NODE_OFFSETS;



    const getPosition = (index: number) => {
        const y = index * NODE_SPACING + (isMobile ? 120 : 150);
        // xOffset used on desktop; mobile centers nodes unconditionally
        const xOffset = index < NODE_OFFSETS.length
            ? NODE_OFFSETS[index]
            : Math.sin(index) * (isMobile ? 30 : 60);

        return { x: xOffset, y };
    };

    // Scroll refs and values
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
    
    // Scroll container height = lastNodePosition + viewport height
    const lastNodePosition = ageLevels.length > 0 ? getPosition(ageLevels.length - 1).y : 0;
    const totalHeight = lastNodePosition + windowHeight;

    const [canvasReady, setCanvasReady] = useState(framesLoadedCount === 60);

    // Intro Video & Disclaimer State
    const [isReady, setIsReady] = useState(false);
    const [isVideoFinished, setIsVideoFinished] = useState(false);
    const [showPlayButton, setShowPlayButton] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const setIntroVideoCompleted = useUserStore((state) => state.setIntroVideoCompleted);

    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { scrollYProgress } = useScroll({ container: containerRef });

    // Preload 60 JPEG frames
    useEffect(() => {
        if (FRAME_CACHE.length === 60) {
            setCanvasReady(true);
            return;
        }

        let loaded = 0;
        for (let i = 0; i < 60; i++) {
            const frameIndex = 1 + (i * 4); // 001, 005, 009...
            const src = `https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/map_frames_dark/ezgif-frame-${String(frameIndex).padStart(3, '0')}.webp`;
            const img = new Image();
            img.src = src;
            img.onload = () => {
                loaded++;
                if (loaded === 60) {
                    framesLoadedCount = 60;
                    setCanvasReady(true);
                }
            };
            FRAME_CACHE.push(img);
        }
    }, []);

    // Effect to handle total readiness
    useEffect(() => {
        if (canvasReady && isVideoFinished) {
            setIsReady(true);
            setIntroVideoCompleted(true);
            audioSynth.playStartup();
        }
    }, [canvasReady, isVideoFinished, setIntroVideoCompleted]);

    // Handle video auto-play and mute policy
    useEffect(() => {
        if (!isReady && videoRef.current) {
            const timer = setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.play().catch(err => {
                        if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
                            navigate('/game/mood');
                        }
                    });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isReady]);

    const handleManualPlay = () => {
        if (videoRef.current) {
            videoRef.current.play().then(() => {
                setShowPlayButton(false);
            }).catch(console.error);
        }
    };

    // Canvas Drawing rAF Loop
    useEffect(() => {
        if (!canvasReady) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let lastProgress = -1;
        let lastWidth = -1;
        let lastHeight = -1;
        let soundTimeout: any;

        const tick = () => {
            if (document.hidden) {
                animationFrameId = requestAnimationFrame(tick);
                return;
            }

            const current = scrollYProgress.get();
            const w = window.innerWidth;
            const h = window.innerHeight;
            
            if (current !== lastProgress || w !== lastWidth || h !== lastHeight) {
                // Audio glide
                if (lastProgress !== -1) {
                    const delta = Math.abs((current - lastProgress) * 480);
                    if (delta > 0.5) {
                        audioSynth.startGlide();
                        audioSynth.updateGlide(delta * 5);
                        clearTimeout(soundTimeout);
                        soundTimeout = setTimeout(() => {
                            audioSynth.stopGlide();
                        }, 100);
                    }
                }
                
                const index = Math.min(59, Math.max(0, Math.floor(current * 59)));
                const img = FRAME_CACHE[index];
                
                if (img) {
                    if (canvas.width !== w) canvas.width = w;
                    if (canvas.height !== h) canvas.height = h;
                    
                    const scale = Math.max(w / img.width, h / img.height) * 1.045;
                    const x = (w / 2) - (img.width / 2) * scale;
                    const y = (h / 2) - (img.height / 2) * scale;
                    
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    // Blend bottom-right corner to conceal Veo watermark
                    const gradRadius = Math.max(160, w * 0.18);
                    const brGrad = ctx.createRadialGradient(w, h, 0, w, h, gradRadius);
                    brGrad.addColorStop(0, 'rgba(10, 5, 16, 0.98)');
                    brGrad.addColorStop(0.5, 'rgba(10, 5, 16, 0.5)');
                    brGrad.addColorStop(1, 'rgba(10, 5, 16, 0)');
                    ctx.fillStyle = brGrad;
                    ctx.fillRect(w - gradRadius, h - gradRadius, gradRadius, gradRadius);
                    
                    lastProgress = current;
                    lastWidth = w;
                    lastHeight = h;
                }
            }
            
            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(animationFrameId);
            clearTimeout(soundTimeout);
        };
    }, [canvasReady, scrollYProgress]);

    useEffect(() => {
        audioSynth.playStartup();
    }, [ageLevels.length]);

    return (
        <div className="fixed inset-0 w-full h-[100dvh] bg-slate-950 overflow-hidden text-white">
            <AudioController isMapActive={isMapActive} />

            {/* Daily Challenge Button */}
            <div className="absolute top-[130px] md:top-[80px] left-0 w-full flex justify-center z-[100] pointer-events-none px-2">
                <div className="relative group w-full max-w-[250px]">
                    {!profile?.daily_challenge_completed && (
                        <div className="absolute -inset-1 bg-orange-500/20 blur-md rounded-full animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />
                    )}
                    <button
                        onClick={() => { audioSynth.playClick(); }}
                        disabled={profile?.daily_challenge_completed}
                        className={clsx(
                            "pointer-events-auto relative w-full py-2.5 px-4 rounded-full flex flex-row items-center justify-center gap-3 transition-all duration-500",
                            profile?.daily_challenge_completed 
                                ? "bg-[rgba(20,10,5,0.8)] border border-slate-700 text-slate-500 opacity-90 cursor-default backdrop-blur-md" 
                                : "bg-[rgba(20,10,5,0.9)] backdrop-blur-md border border-[#FFB347]/50 shadow-[0_0_15px_rgba(255,179,71,0.3)] hover:shadow-[0_0_25px_rgba(255,179,71,0.6)] hover:bg-[rgba(30,15,10,0.9)] hover:border-[#FFB347] hover:scale-105 active:scale-95"
                        )}
                    >
                        <span className={clsx("text-lg", profile?.daily_challenge_completed ? "grayscale opacity-30" : "drop-shadow-[0_0_8px_rgba(255,179,71,0.8)]")}>☀️</span>
                        <div className="flex flex-col items-start leading-tight">
                            <span className={clsx("text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em]", profile?.daily_challenge_completed ? "text-slate-500" : "text-white drop-shadow-md")}>
                                {profile?.daily_challenge_completed ? "COMPLETED" : "TODAY'S CHALLENGE"}
                            </span>
                            <span className={clsx("text-[9px] font-bold tracking-widest uppercase", profile?.daily_challenge_completed ? "text-slate-600" : "text-[#FFB347] drop-shadow-[0_0_5px_rgba(255,179,71,0.5)]")}>
                                {profile?.current_streak || 0} DAY STREAK
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Settings & Theme Buttons */}
            <div className="absolute left-4 md:left-6 z-[100] flex flex-col gap-2" style={{ top: 'max(5rem, calc(env(safe-area-inset-top, 0px) + 1rem))' }}>
                <button
                    onClick={() => { audioSynth.playClick(); navigate('/game/settings'); }}
                    className="w-8 h-8 md:w-10 md:h-10 bg-white/5 hover:bg-white/10 active:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-[#FFB347] transition-all border border-[#FFB347]/30 shadow-[0_0_10px_rgba(255,179,71,0.2)] hover:rotate-12 active:scale-90"
                    aria-label="Settings"
                >
                    <Settings size={18} className="md:w-5 md:h-5" />
                </button>
                <button
                    onClick={() => { audioSynth.playClick(); }}
                    className="w-8 h-8 md:w-10 md:h-10 bg-[#FFB347]/10 hover:bg-[#FFB347]/20 border border-[#FFB347]/50 backdrop-blur-md rounded-full flex items-center justify-center text-[#FFB347] transition-all shadow-[0_0_15px_rgba(255,179,71,0.3)] hover:-rotate-12 active:scale-90"
                    aria-label="Theme Switcher"
                >
                    <span className="text-sm">☀️</span>
                </button>
                {isAdmin && (
                    <button
                        onClick={() => { audioSynth.playClick(); navigate('/game/admin'); }}
                        className="mt-2 w-8 h-8 md:w-10 md:h-10 bg-fuchsia-900/40 hover:bg-fuchsia-800/60 border border-fuchsia-500/50 backdrop-blur-md rounded-full flex items-center justify-center text-fuchsia-300 transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:scale-110 active:scale-95"
                        title="Admin Panel"
                    >
                        <span className="text-sm font-black">👑</span>
                    </button>
                )}
            </div>

            {/* Journal Toggle & DNA Profile */}
            <div className="absolute right-4 md:right-6 z-[100] flex flex-col gap-2 items-end map-right-buttons" style={{ top: 'max(5rem, calc(env(safe-area-inset-top, 0px) + 1rem))' }}>
                <button
                    onClick={() => { audioSynth.playClick(); }}
                    className="group flex items-center gap-1.5 md:gap-3 pr-3 md:pr-6 pl-1.5 py-1 md:py-2 rounded-full shadow-2xl transition-all border-2 bg-slate-900 border-[#FFB347]/50 hover:border-[#FFB347] hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,179,71,0.2)]"
                >
                    <div className="text-[#0a0510] p-1 md:p-2 rounded-full shadow-md group-hover:rotate-12 transition-transform bg-gradient-to-br from-[#FFB347] to-[#ff6b35]">
                        <BookOpen size={14} className="stroke-[3] md:w-5 md:h-5" />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider hidden xs:block text-[#FFB347]/80">MY WISDOM</span>
                        <span className="text-xs md:text-sm font-black transition-colors text-[#FFB347] group-hover:text-white">JOURNAL</span>
                    </div>
                </button>

                 <button
                    onClick={() => { audioSynth.playClick(); onOpenDnaProfile(); }}
                    className="group flex items-center gap-1.5 pr-2 md:pr-4 pl-1.5 py-1 md:py-1.5 border hover:scale-105 active:scale-95 transition-all shadow-lg rounded-full pointer-events-auto bg-[#0a0510] border-[#FFB347]/30 backdrop-blur-md"
                >
                    <div className="text-xs font-black rounded-full flex items-center justify-center p-1 drop-shadow-md text-[#0a0510] border border-white/20 bg-gradient-to-r from-[#FFB347] to-[#ff9100]">
                        🧬
                    </div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest leading-none border-l pl-2 text-[#FFB347] border-[#FFB347]/30">DNA DATA</span>
                </button>
            </div>

            {/* Cinematic Intro & Disclaimer Portal */}
            {!isReady && createPortal(
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0510]">
                    <div 
                        onClick={showPlayButton ? handleManualPlay : undefined}
                        className={`absolute inset-0 z-20 flex flex-col p-6 sm:p-10 bg-[#0a0510] text-[#FFB347]/60 font-mono text-[10px] sm:text-xs overflow-y-auto leading-relaxed whitespace-pre-wrap transition-opacity duration-1000 ease-in-out ${(!isVideoPlaying && !isVideoFinished) ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${showPlayButton ? 'cursor-pointer' : ''}`}
                    >
                        <h2 className="text-[#FFB347] text-lg sm:text-xl font-bold mb-4 uppercase tracking-widest border-b border-[#FFB347]/30 pb-2 text-center">Solar Realm — Legal Disclaimer</h2>
                        <div className="opacity-80">
                            {DISCLAIMER_TEXT}
                        </div>
                        
                        {showPlayButton && (
                            <div className="mt-8 mb-12 text-center text-[#FFB347] font-black tracking-[0.2em] animate-pulse text-xs sm:text-sm border border-[#FFB347]/30 py-4 rounded-lg bg-[#FFB347]/5 shadow-[0_0_15px_rgba(255,179,71,0.1)]">
                                TAP ANYWHERE TO AGREE & ENTER THE SUN
                            </div>
                        )}
                    </div>

                    <video
                        ref={videoRef}
                        src="https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/intro.mp4"
                        autoPlay
                        playsInline
                        preload="auto"
                        onPlaying={() => setIsVideoPlaying(true)}
                        onTimeUpdate={(e) => {
                            const vid = e.target as HTMLVideoElement;
                            if (vid.duration && vid.duration - vid.currentTime < 0.5) {
                                setIsFadingOut(true);
                            }
                        }}
                        onEnded={() => setIsVideoFinished(true)}
                        className={`w-full h-full object-cover md:object-cover scale-[1.05] relative z-10 transition-opacity duration-500 ease-in-out ${isVideoPlaying && !isFadingOut ? 'opacity-100' : 'opacity-0'}`}
                    />
                    {/* Bottom-right watermark mask on intro video */}
                    <div 
                        className="absolute bottom-0 right-0 w-64 h-32 pointer-events-none z-20"
                        style={{ background: 'radial-gradient(ellipse at bottom right, rgba(10, 5, 16, 0.98) 0%, rgba(10, 5, 16, 0.6) 45%, transparent 75%)' }}
                    />
                </div>,
                document.body
            )}

            {/* Scrollable Map */}
            <div 
                ref={containerRef} 
                className="relative h-[100dvh] w-full bg-[#0a0510] text-white overflow-y-auto overflow-x-hidden selection:bg-[#FFB347] selection:text-[#4a2e00] font-sans"
                style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'auto' }}
            >
                {/* LAYER 1: Canvas Background */}
                <div className="fixed inset-0 z-0 pointer-events-none bg-black overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full object-cover"
                    />
                    {/* Bottom-right watermark mask on canvas */}
                    <div 
                        className="fixed bottom-0 right-0 w-56 sm:w-72 h-28 sm:h-36 pointer-events-none z-[2]"
                        style={{ background: 'radial-gradient(ellipse at bottom right, rgba(10, 5, 16, 0.98) 0%, rgba(10, 5, 16, 0.6) 45%, transparent 75%)' }}
                    />
                </div>
                
                <div className="fixed inset-0 bg-gradient-to-t from-[#0a0510]/80 via-transparent to-slate-900/50 mix-blend-overlay pointer-events-none z-10" />

                {/* LAYER 2: NODES */}
                <div
                    className="absolute top-0 left-0 w-full layer-mid pb-32 pointer-events-none z-20"
                    style={{ height: totalHeight, opacity: canvasReady ? 1 : 0 }}
                >
                    <div className="relative w-full max-w-md mx-auto mt-24 md:mt-32 pointer-events-none h-full">
                        {/* Nodes */}

                        {/* Nodes */}
                        {ageLevels.map((level, i) => {
                            const pos = getPosition(i);
                            const isUnlocked = level.status !== 'locked';
                            const isCompleted = level.status === 'completed';
                            const isCurrent = isUnlocked && !isCompleted;

                            return (
                                <motion.div
                                    key={level.id}
                                    className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center transition-all duration-500 z-10 pointer-events-auto personality-node-container"
                                    style={isMobile
                                        ? { top: pos.y, left: '50%', transform: 'translateX(-50%)', zIndex: 20 + i }
                                        : { top: pos.y, transform: `translate(calc(-50% + ${pos.x}px), -50%)`, zIndex: 20 + i }
                                    }
                                    whileHover={{ scale: 1.1, y: -5 }}
                                >
                                    <div
                                        className={clsx(
                                            "relative cursor-pointer transition-transform group animate-float",
                                            isCurrent && "animate-breath",
                                            !isUnlocked && "grayscale opacity-70"
                                        )}
                                        onTouchStart={() => { if (isUnlocked) audioSynth.playHover(); }}
                                        onClick={() => {
                                            if (isUnlocked) {
                                                audioSynth.playClick();
                                                onPlayLevel(level);
                                            }
                                        }}
                                    >
                                        {/* Avatar Ring */}
                                        <div className={clsx(
                                            "relative rounded-full overflow-hidden flex items-center justify-center bg-black transition-all duration-300",
                                            "w-16 h-16 md:w-24 md:h-24",
                                            isCurrent 
                                                ? "border-4 border-[#FFB347] ring-4 ring-[#FFB347]/30 shadow-[0_0_30px_rgba(255,179,71,0.8),0_10px_20px_rgba(0,0,0,0.8)]"
                                                : "border-transparent ring-2 ring-[#FFB347]/50 shadow-[0_5px_15px_rgba(0,0,0,0.6)]"
                                        )}>
                                            <img src={level.avatarUrl || resolvePersonalityAvatar(level.personality || '')} alt={level.archetype} className="w-full h-full object-cover" />
                                            {!isUnlocked && (
                                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                                                    <Lock size={20} className="text-slate-400 opacity-80 md:w-6 md:h-6" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Glow under node */}
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-10 bg-black/50 blur-xl -z-10 rounded-full" />

                                        {/* Labels */}
                                        <div className={clsx(
                                            "absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 transition-all duration-300 transform flex flex-col items-center",
                                            "md:-bottom-14",
                                            isUnlocked ? "scale-100" : "scale-90"
                                        )}>
                                            {level.personality && (
                                                <div className={clsx(
                                                    "relative -mb-2 px-3 py-0.5 rounded-full border shadow-sm flex items-center justify-center z-40",
                                                    "md:-mb-3 md:px-4 md:py-1 md:border-2",
                                                    isUnlocked 
                                                        ? (isCurrent ? "bg-[#FFB347] border-[#fff0d4] text-[#4a2e00] shadow-[0_0_15px_rgba(255,179,71,0.6)]" : "bg-[rgba(15,10,5,0.8)] border-[#FFB347]/50 text-[#FFB347] backdrop-blur-md shadow-[0_0_10px_rgba(255,179,71,0.2)]")
                                                        : "bg-slate-900 border-slate-700 text-slate-500"
                                                )}>
                                                    <span className="text-[10px] md:text-sm font-black uppercase drop-shadow-sm tracking-widest personality-name-label">
                                                        {level.personality}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={clsx(
                                                "px-4 py-1 pt-3 pb-1 md:px-6 md:py-2 md:pt-4 md:pb-2 rounded-xl shadow-2xl flex items-center justify-center min-w-[100px] md:min-w-[140px]",
                                                isUnlocked
                                                    ? (isCurrent 
                                                        ? "bg-gradient-to-r from-[#FFB347] to-[#ff7b00] border-b-[3px] md:border-b-4 border-[#803d00]"
                                                        : "bg-[rgba(15,10,5,0.85)] backdrop-blur-md border border-[#FFB347]/40 shadow-[0_0_20px_rgba(0,0,0,0.8)]")
                                                    : "bg-slate-900/90 border-b-[3px] md:border-b-4 border-slate-950"
                                            )}>
                                                <span className={clsx(
                                                    "text-[10px] md:text-xs font-bold uppercase tracking-wider leading-none text-center story-title-label",
                                                    isUnlocked 
                                                        ? (isCurrent ? "text-white drop-shadow-md" : "text-[#fff0d4] drop-shadow-[0_0_5px_rgba(255,179,71,0.5)]")
                                                        : "text-slate-500"
                                                )}>
                                                    {level.title}
                                                </span>
                                            </div>
                                        </div>

                                        {isCompleted && (
                                            <div className="absolute -top-4 md:-top-6 flex gap-1 justify-center w-full">
                                                {[1, 2, 3].map(s => (
                                                    <Star key={s} size={16} className="fill-[#FFB347] text-[#ffdd99] drop-shadow-[0_0_8px_rgba(255,179,71,0.8)] animate-bounce md:w-5 md:h-5" style={{ animationDelay: `${s * 100}ms` }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div >
    );
}

