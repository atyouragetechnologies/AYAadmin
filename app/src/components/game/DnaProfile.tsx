import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { audioManager as audioSynth } from "../../utils/audioManager";
import { ArrowLeft, Copy, Check, Star, Shield, Download, ClipboardList, Flame, Dna, Compass, TrendingUp, TrendingDown, Minus, Sparkles, Briefcase, RefreshCw } from 'lucide-react';
import { generateLevels } from '../../utils/levelGenerator';
import { useUserStore } from '../../store/userStore';
import { calculateLevelInfo } from '../../utils/levelSystem';
import domtoimage from 'dom-to-image';
import { InstagramCard } from './InstagramCard';
import { FutureSelfCard } from './FutureSelfCard';
import { FutureSelfShareCard } from './FutureSelfShareCard';
import { GenomicReportCard } from './GenomicReportCard';
import { calculateLifeTraits, matchFutureArchetype } from '../../utils/futureSelfMatch';
import { bgmManager } from '../../utils/bgmManager';
import { getFollowerCount, getFollowingCount } from '../../services/followService';
import { fetchUserDnaProfile, saveUserDnaProfile, subscribeToLiveDnaUpdates, type UserDnaProfile } from '../../services/dnaService';
import { generateCurrentChapter, generateEmergingYou, getPotentiallyAlignedDirections } from '../../services/insightService';
import { MascotLoader } from '../ui/MascotLoader';
import { useDevicePerformance } from '../../hooks/useDevicePerformance';

interface DnaProfileProps {
    onBack: () => void;
}

const FloatingParticle = ({ style, animationDuration }: { style: any, animationDuration: string }) => (
    <div 
        className="absolute rounded-full mix-blend-screen opacity-60"
        style={{
            ...style,
            animation: `float-particle ${animationDuration} ease-in-out infinite alternate`,
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor'
        }}
    />
);

const AnimatedHelix = () => (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
        {/* Simple CSS-based double helix illusion */}
        <div className="relative w-40 h-[600px] flex flex-col justify-between items-center py-20">
            {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="relative w-full h-8 flex items-center justify-between" style={{ animationDelay: `${i * 0.2}s` }}>
                    <div className="w-4 h-4 rounded-full bg-cyan-400 helix-dot-1" style={{ animationDelay: `${i * 0.15}s` }}></div>
                    <div className="w-4 h-4 rounded-full bg-purple-500 helix-dot-2" style={{ animationDelay: `${i * 0.15}s` }}></div>
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-cyan-400/20 to-purple-500/20"></div>
                </div>
            ))}
        </div>
        <style>{`
            .helix-dot-1 { animation: traverse-x 3s ease-in-out infinite alternate; }
            .helix-dot-2 { animation: traverse-x 3s ease-in-out infinite alternate-reverse; }
            @keyframes traverse-x {
                0% { transform: translateX(0) scale(1); z-index: 10; }
                50% { transform: translateX(64px) scale(1.5); z-index: 20; }
                100% { transform: translateX(128px) scale(0.5); z-index: 5; }
            }
            @keyframes float-particle {
                0% { transform: translateY(0) scale(1); }
                100% { transform: translateY(-40px) scale(1.2); }
            }
        `}</style>
    </div>
);

const NeonTraitBar = ({ label, value, neonColor }: { label: string, value: number, neonColor: string }) => {
    return (
        <div className="relative w-full mb-5 group">
            <div className="flex justify-between items-end mb-1 text-xs font-black uppercase tracking-widest text-[#f2effb]">
                <span className="drop-shadow-md">{label}</span>
                <span className="opacity-80">{value}%</span>
            </div>
            
            {/* 3D Depth Track */}
            <div className="w-full h-5 rounded overflow-hidden relative bg-[#000000] border-t border-[rgba(255,255,255,0.1)] shadow-[0_4px_10px_rgba(0,0,0,0.8)_inset]">
                {/* Fill */}
                <div 
                    className="h-full relative rounded flex items-center justify-end pr-1 transition-all duration-1000 ease-out"
                    style={{ 
                        width: `${value}%`,
                        background: `linear-gradient(90deg, transparent, ${neonColor})`,
                        boxShadow: `0 0 15px ${neonColor}, inset 0 0 5px ${neonColor}`
                    }}
                >
                    {/* Laser Head */}
                    <div className="h-full w-2 bg-white blur-[1px]"></div>
                </div>
            </div>
        </div>
    );
};

export function DnaProfile({ onBack }: DnaProfileProps) {
    const profile = useUserStore((state) => state.profile);
    const setProfile = useUserStore((state) => state.setProfile);
    const { isLowEnd } = useDevicePerformance();

    // DNA Report mounts → bgm-neon-map.mp3
    useEffect(() => {
        bgmManager.play('neon-map');
    }, []);

    const [isLiveSyncing, setIsLiveSyncing] = useState(false);
    const [lastLiveSync, setLastLiveSync] = useState<string>('Live Synced');

    // Central handler to hydrate Zustand from fresh backend DNA profile
    const handleFreshDna = useCallback((dbProfile: UserDnaProfile | null) => {
        if (!dbProfile) return;
        console.log('[DnaProfile] Live DNA update received from backend:', dbProfile.traits);
        const currentState = useUserStore.getState().profile;
        if (currentState) {
            setProfile({
                ...currentState,
                traits: {
                    ...currentState.traits,
                    risk: dbProfile.traits.risk,
                    creativity: dbProfile.traits.creativity,
                    vision: dbProfile.traits.vision,
                    empathy: dbProfile.traits.empathy,
                    leadership: dbProfile.traits.leadership,
                },
                total_xp: Math.max(dbProfile.totalXp, currentState.total_xp || 0),
                level: Math.max(dbProfile.level, currentState.level || 1),
                stories_completed: Math.max(dbProfile.storiesCompleted, currentState.stories_completed || 0),
                ...(dbProfile.lifeTraits ? { lifeTraits: { ...(currentState.lifeTraits || {}), ...dbProfile.lifeTraits } } : {}),
            } as any);
            setLastLiveSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
    }, [setProfile]);

    // Live subscription & mount hydration
    useEffect(() => {
        const activeUserId = profile?.id;
        if (!activeUserId) return;

        let isMounted = true;

        // 1. Initial hydration from Supabase
        fetchUserDnaProfile(activeUserId)
            .then(fresh => {
                if (isMounted && fresh) {
                    handleFreshDna(fresh);
                }
            })
            .catch(e => {
                console.warn('[DnaProfile] Initial fetch warning:', e);
            });

        // 2. Realtime Postgres Changes Subscription + Heartbeat Polling
        const unsubscribe = subscribeToLiveDnaUpdates(activeUserId, (fresh) => {
            if (isMounted && fresh) {
                handleFreshDna(fresh);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [profile?.id, handleFreshDna]);

    // Force an immediate manual roundtrip sync to Supabase
    const handleManualSync = async () => {
        if (isLiveSyncing) return;
        setIsLiveSyncing(true);
        try { audioSynth.playClick(); } catch {}
        try {
            const activeUserId = profile?.id;
            const fresh = await fetchUserDnaProfile(activeUserId);
            if (fresh) {
                handleFreshDna(fresh);
            } else if (profile?.traits && activeUserId) {
                // Seed initial DB profile if missing
                const created = await saveUserDnaProfile({
                    userId: activeUserId,
                    traits: profile.traits,
                    totalXp: profile.total_xp,
                    level: profile.level,
                    storiesCompleted: profile.stories_completed,
                });
                handleFreshDna(created);
            }

            if (activeUserId) {
                const [fc, fwc] = await Promise.all([
                    getFollowerCount(activeUserId),
                    getFollowingCount(activeUserId),
                ]);
                setFollowerCount(fc);
                setFollowingCount(fwc);
            }
            try { audioSynth.playSparkle?.(); } catch {}
        } catch (err) {
            console.error('[DnaProfile] Manual sync error:', err);
        } finally {
            setTimeout(() => setIsLiveSyncing(false), 400);
        }
    };

    // Fallback traits if profile missing completely
    const userTraits = profile?.traits || {
        risk: 50, creativity: 50, vision: 50, empathy: 50, leadership: 50, resilience: 50
    };

    // DNA Profile generation
    const personalityDNA = useMemo(() => {
        const levels = generateLevels(18);
        const uniqueIdols = new Map<string, any>();
        levels.forEach((l: any) => {
            if (l.personality && !uniqueIdols.has(l.personality)) {
                uniqueIdols.set(l.personality, l);
            }
        });

        const diffs: { name: string; diff: number; level: any }[] = [];
        for (const [name, level] of uniqueIdols.entries()) {
            const p = level.idolTraits;
            if (!p) continue;
            
            const totalDiff = 
                Math.abs((userTraits.risk || 50) - (p.risk || 50)) +
                Math.abs((userTraits.creativity || 50) - (p.creativity || 50)) +
                Math.abs((userTraits.vision || 50) - (p.vision || 50)) +
                Math.abs((userTraits.empathy || 50) - (p.empathy || 50)) +
                Math.abs((userTraits.leadership || 50) - (p.leadership || 50));
                
            diffs.push({ name, diff: totalDiff, level });
        }
        
        diffs.sort((a, b) => a.diff - b.diff);
        const top2 = diffs.slice(0, 2);
        
        const getTraitDesc = (item: any, excludedTrait?: string) => {
            const name = item.name;
            const p = item.level.idolTraits;
            let traits = [
                { key: 'leadership', value: p.leadership || 0, desc: `${name.split(' ')[0]}'s relentless drive` },
                { key: 'creativity', value: p.creativity || 0, desc: `${name.split(' ')[0]}'s creative vision` },
                { key: 'vision', value: p.vision || 0, desc: `${name.split(' ')[0]}'s analytical mind` },
                { key: 'empathy', value: p.empathy || 0, desc: `${name.split(' ')[0]}'s emotional depth` },
                { key: 'risk', value: p.risk || 0, desc: `${name.split(' ')[0]}'s bold fearlessness` }
            ];
            
            if (excludedTrait) {
                traits = traits.filter(t => t.key !== excludedTrait);
            }
            
            traits.sort((a, b) => b.value - a.value);
            return traits[0];
        };

        if (top2.length < 2) return null;

        const t1 = getTraitDesc(top2[0]);
        let t2 = getTraitDesc(top2[1]);
        if (t1.key === t2.key) {
            t2 = getTraitDesc(top2[1], t1.key);
        }

        return {
            idol1: {
                name: top2[0].name,
                avatarUrl: top2[0].level.avatarUrl || '',
                desc: t1.desc
            },
            idol2: {
                name: top2[1].name,
                avatarUrl: top2[1].level.avatarUrl || '',
                desc: t2.desc
            }
        };
    }, [userTraits]);

    const [copiedDNA, setCopiedDNA] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFutureGenerating, setIsFutureGenerating] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [activeTab, setActiveTab] = useState<'telemetry' | 'genomic'>('genomic');
    const cardRef = useRef<HTMLDivElement>(null);
    const futureSelfCardRef = useRef<HTMLDivElement>(null);

    // ── Social counts (followers / following) ────────────────────────────────
    const [followerCount, setFollowerCount] = useState<number | null>(null);
    const [followingCount, setFollowingCount] = useState<number | null>(null);

    useEffect(() => {
        if (!profile?.id) return;
        Promise.all([
            getFollowerCount(profile.id),
            getFollowingCount(profile.id),
        ]).then(([fc, fwc]) => {
            setFollowerCount(fc);
            setFollowingCount(fwc);
        }).catch(() => { /* counts fail silently */ });
    }, [profile?.id]);

    // ── Future Self Match computation ────────────────────────────────────────
    const futureMatch = useMemo(() => {
        // Calculate fresh life traits dynamically from volatile userTraits
        const freshLifeTraits = calculateLifeTraits(userTraits as any, profile?.current_streak ?? 0);
        
        // If profile has persisted lifeTraits, use it only if it has non-flat values
        const hasCustomLifeTraits = profile?.lifeTraits && Object.values(profile.lifeTraits).some(v => v !== 50);
        const effectiveLifeTraits = hasCustomLifeTraits
            ? { ...freshLifeTraits, ...profile.lifeTraits }
            : freshLifeTraits;

        return matchFutureArchetype(effectiveLifeTraits);
    }, [profile?.lifeTraits, profile?.current_streak, userTraits]);

    const storiesCompleted = profile?.stories_completed ?? 0;
    const decisionsCount = Math.max(storiesCompleted * 3, storiesCompleted); // ~3 choices per story

    const handleShareDNA = () => {
        if (!personalityDNA) return;
        const textToCopy = `My Personality DNA: I have ${personalityDNA.idol1.desc} and ${personalityDNA.idol2.desc}. Discover yours at https://atyourage.app 🧬`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedDNA(true);
        setTimeout(() => setCopiedDNA(false), 2000);
        setTimeout(() => setShowOptions(false), 2000);
    };

    const handleFutureSelfShare = async () => {
        if (!futureSelfCardRef.current || isFutureGenerating) return;
        try {
            audioSynth.playClick();
            setIsFutureGenerating(true);
            await new Promise(resolve => setTimeout(resolve, 150));
            const dataUrl = await domtoimage.toPng(futureSelfCardRef.current, {
                quality: 1,
                bgcolor: '#07050f',
                width: 1080,
                height: 1080,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                    left: '0px',
                    top: '0px',
                }
            });
            const link = document.createElement('a');
            link.download = `aya-future-self-${profile?.name || 'card'}.webp`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Future self share failed:', err);
        } finally {
            setIsFutureGenerating(false);
        }
    };

    const handleDownloadCard = async () => {
        console.log('Download card clicked');
        if (!cardRef.current || isGenerating) return;
        
        try {
            audioSynth.playClick();
            setIsGenerating(true);

            // Give React a frame to ensure the DOM is completely ready including the refs
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const dataUrl = await domtoimage.toPng(cardRef.current, {
                quality: 1,
                bgcolor: '#000000',
                width: 1080,
                height: 1080,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            });
            
            const link = document.createElement('a');
            link.download = `aya-dna-${profile?.name || 'card'}.webp`;
            link.href = dataUrl;
            link.click();
            
            setTimeout(() => setShowOptions(false), 1000);
        } catch (error) {
            console.error("Failed to generate image:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Calculate dynamic real life challenge
    const struggleStr = profile?.psychologicalProfile?.interest_struggle || '';
    let realLifeChallenge = "Embrace the unknown and act courageously today.";
    if (struggleStr.includes('Overthinking')) realLifeChallenge = "Write 3 decisions you've been delaying. Pick one and act today.";
    else if (struggleStr.includes('Laziness & Procrastination')) realLifeChallenge = "Do the one task you've been avoiding for just 5 minutes right now.";
    else if (struggleStr.includes('Fear of what others think')) realLifeChallenge = "Share one honest opinion with someone today.";
    else if (struggleStr.includes('Staying consistent')) realLifeChallenge = "Set one non-negotiable daily habit starting tonight.";

    const dynamicProfileTag = useMemo(() => {
        const traits = [
            { name: "BORN LEADER", value: userTraits.leadership || 0 },
            { name: "CREATIVE SOUL", value: userTraits.creativity || 0 },
            { name: "STRATEGIC MIND", value: userTraits.vision || 0 },
            { name: "PEOPLE'S CHAMPION", value: userTraits.empathy || 0 },
            { name: "BOLD MAVERICK", value: userTraits.risk || 0 }
        ];
        traits.sort((a, b) => b.value - a.value);
        return traits[0].name;
    }, [userTraits]);

    if (!profile) {
        return <MascotLoader message="SEQUENCING YOUR DNA..." subMessage="Decoding behavioral matrices..." />;
    }

    return (
        <div className="fixed inset-0 z-[120] w-full h-full bg-[#0d0d16] font-sans text-[#f2effb] overflow-y-auto overflow-x-hidden pt-safe pb-[calc(env(safe-area-inset-bottom)+6rem)] selection:bg-[#99f7ff] selection:text-[#004145]">
            
            {/* Deep Space Background gradient */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,#2b2b38_0%,#000000_60%)]" />
            
            {!isLowEnd && (
                <>
                    {/* Floating Particles */}
                    <div className="fixed inset-0 pointer-events-none">
                        <FloatingParticle style={{ top: '10%', left: '20%', width: 6, height: 6, backgroundColor: '#99f7ff', color: '#99f7ff' }} animationDuration="4s" />
                        <FloatingParticle style={{ top: '40%', right: '15%', width: 4, height: 4, backgroundColor: '#ff51fa', color: '#ff51fa' }} animationDuration="5s" />
                        <FloatingParticle style={{ bottom: '20%', left: '30%', width: 8, height: 8, backgroundColor: '#d575ff', color: '#d575ff' }} animationDuration="6s" />
                        <FloatingParticle style={{ top: '60%', left: '80%', width: 5, height: 5, backgroundColor: '#99f7ff', color: '#99f7ff' }} animationDuration="3s" />
                    </div>

                    <AnimatedHelix />
                </>
            )}

            {/* Navigation Header */}
            <div className="relative z-20 flex items-center justify-between pt-36 pb-6 px-6 w-full max-w-4xl mx-auto">
                <button 
                    onClick={() => { audioSynth.playBack(); onBack(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0d0d16] hover:bg-[#1a1a24] rounded-full border border-[#00f2ff]/30 transition-all hover:scale-105 active:scale-95 shadow-md text-[#00f2ff] font-bold tracking-widest text-sm uppercase"
                >
                    <ArrowLeft size={18} /> BACK
                </button>
            </div>

            <main className="relative z-20 w-full max-w-3xl mx-auto px-4 sm:px-8 pb-12 flex flex-col items-center">
                
                {/* Header Section */}
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-100 to-purple-300 drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Your Identity Profile
                </h1>
                
                {/* User Data */}
                <div className="text-center mb-10 flex flex-col items-center">
                    <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-[#fcf8ff] drop-shadow-md">
                        {profile?.name || 'GUEST_0X'}
                    </h2>
                    {profile?.username && (
                        <p className="mt-1 text-[#00f1fe] font-bold tracking-widest text-sm">
                            @{profile.username}
                        </p>
                    )}
                    {/* Follower / following counts */}
                    {(followerCount !== null || followingCount !== null) && (
                        <div className="mt-2 flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                            <span className="text-[#acaab5]">
                                <span className="text-[#00f2ff] text-sm">{followerCount ?? '–'}</span>
                                {' '}Followers
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[#d575ff]" />
                            <span className="text-[#acaab5]">
                                <span className="text-[#d575ff] text-sm">{followingCount ?? '–'}</span>
                                {' '}Following
                            </span>
                        </div>
                    )}
                    <div className="mt-2 text-[#acaab5] tracking-[0.3em] text-sm uppercase flex items-center gap-4">
                        <span>AGE: <span className="text-[#99f7ff] font-bold">{profile?.age || 18}</span></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d575ff] shadow-[0_0_8px_#d575ff]" />
                        <span>STATUS: <span className="text-[#ff51fa] font-bold">ACTIVE</span></span>
                    </div>
                </div>

                {/* Profile Badge & Live Connected Status */}
                <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
                    <div className="px-6 py-2 rounded-full border-2 border-[rgba(153,247,255,0.3)] bg-[rgba(0,85,90,0.8)] shadow-lg flex items-center gap-2">
                        <Shield size={16} className="text-[#99f7ff] animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-[#99f7ff]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{dynamicProfileTag}</span>
                    </div>

                    {/* Live Cloud Connection Indicator */}
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] select-none">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="tracking-wider uppercase font-mono">{lastLiveSync}</span>
                        <button
                            type="button"
                            onClick={handleManualSync}
                            disabled={isLiveSyncing}
                            className="ml-1 p-1 hover:bg-emerald-500/20 rounded-full transition-all active:scale-90 text-emerald-200 hover:text-white cursor-pointer"
                            title="Sync DNA with Cloud"
                        >
                            <RefreshCw size={12} className={isLiveSyncing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* View Mode Navigation Tabs */}
                <div className="mb-10 flex items-center justify-center p-1.5 rounded-full bg-[#13131c] border border-[rgba(0,242,255,0.3)] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={() => { audioSynth.playClick(); setActiveTab('telemetry'); }}
                        className={`px-5 sm:px-6 py-2.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                            activeTab === 'telemetry'
                                ? 'bg-gradient-to-r from-[#00f2ff] to-[#00a2ff] text-slate-950 shadow-[0_0_15px_rgba(0,242,255,0.4)] scale-105'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Shield size={15} /> Telemetry
                    </button>
                    <button
                        onClick={() => { audioSynth.playClick(); setActiveTab('genomic'); }}
                        className={`px-5 sm:px-6 py-2.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                            activeTab === 'genomic'
                                ? 'bg-gradient-to-r from-[#d575ff] to-[#ff51fa] text-white shadow-[0_0_15px_rgba(213,117,255,0.4)] scale-105'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Dna size={15} /> Career Report 🧬
                    </button>
                </div>

                {activeTab === 'genomic' ? (
                    <div className="w-full animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-4 px-1 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <span className="text-lg">🧬</span>
                            <p className="text-[12px] text-cyan-300 font-semibold leading-snug">
                                Your DNA data updates automatically as you play more stories and improve your performance inside the app.
                            </p>
                        </div>
                        <GenomicReportCard username={profile?.username || profile?.name} />
                    </div>
                ) : (
                    <>
                {/* Trait Bars Card */}
                <div className="w-full bg-[#191923] border-t border-l border-[#8300b4]/30 border-r border-b border-[#00e2ee]/30 rounded-[2rem] p-6 sm:p-8 mb-10 shadow-lg transition-colors duration-500 hover:border-[#00e2ee]/50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#acaab5] mb-6">Core Telemetry</h3>
                    
                    <NeonTraitBar label="Risk Taker" value={userTraits.risk} neonColor="#ff51fa" />
                    <NeonTraitBar label="Creative" value={userTraits.creativity} neonColor="#bc13fe" />
                    <NeonTraitBar label="Analytical" value={userTraits.vision} neonColor="#00f2ff" />
                    <NeonTraitBar label="Social" value={userTraits.empathy} neonColor="#00ff9d" />
                    <NeonTraitBar label="Ambitious" value={userTraits.leadership} neonColor="#ffb800" />
                </div>

                {/* ── 1. CURRENT YOU & CURRENT CHAPTER ── */}
                <div className="w-full bg-[#191923] border border-cyan-500/30 rounded-[2rem] p-6 sm:p-8 mb-10 shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                                <Compass size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                                    Current Chapter
                                </span>
                                <h3 className="text-xl font-black text-white">
                                    {generateCurrentChapter(userTraits).label}
                                </h3>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono uppercase">
                            Active State
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {generateCurrentChapter(userTraits).description}
                    </p>
                </div>

                {/* ── 2. EMERGING YOU (BEHAVIORAL TRAJECTORY) ── */}
                <div className="w-full bg-[#191923] border border-purple-500/30 rounded-[2rem] p-6 sm:p-8 mb-10 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-purple-300">
                                Emerging You
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                Recent behavioral shifts based on scenario decision patterns
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {generateEmergingYou(profile?.onboarding_scores, userTraits).map((item, idx) => {
                            const traitLabels: Record<string, string> = {
                                risk: 'Risk Taking',
                                creativity: 'Creative Instinct',
                                vision: 'Vision & Analysis',
                                empathy: 'Social Attunement',
                                leadership: 'Leadership Drive'
                            };

                            return (
                                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-200">
                                        {traitLabels[item.trait] || item.trait}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        {item.direction === 'rising' && (
                                            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                                                <TrendingUp size={14} className="mr-1" /> Rising (+{item.delta})
                                            </span>
                                        )}
                                        {item.direction === 'falling' && (
                                            <span className="flex items-center text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                                                <TrendingDown size={14} className="mr-1" /> Calibrating ({item.delta})
                                            </span>
                                        )}
                                        {item.direction === 'stable' && (
                                            <span className="flex items-center text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                                                <Minus size={14} className="mr-1" /> Anchored
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── 3. POTENTIALLY ALIGNED CAREER DIRECTIONS ── */}
                <div className="w-full bg-[#191923] border border-amber-500/30 rounded-[2rem] p-6 sm:p-8 mb-10 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-amber-300">
                                Potentially Aligned Directions
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                Exploratory career environments aligned with your observed behavioral profile
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        {getPotentiallyAlignedDirections(userTraits).map((dir, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                                <span className="text-xs sm:text-sm font-bold text-amber-100">
                                    {dir}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-3 italic text-center">
                        * AYA suggests behavioral archetypes for exploration and is not a deterministic aptitude guarantee.
                    </p>
                </div>

                {/* Progression Hub Card */}
                <div className="w-full bg-[#191923] border-t border-l border-[#00ff9d]/30 border-r border-b border-[#00f2ff]/30 rounded-[2rem] p-6 sm:p-8 mb-10 shadow-lg transition-colors duration-500 hover:border-[#00f2ff]/50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#acaab5] mb-6">Experience Protocol</h3>
                    
                    <div className="flex flex-col items-center mb-6 mt-2">
                        <div className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#00ff9d] mb-2 font-black">Level {profile?.level || 1}</div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00f2ff] drop-shadow-[0_0_15px_rgba(0,255,157,0.4)] text-center">
                            {calculateLevelInfo(profile?.total_xp || 0).title}
                        </h2>
                    </div>

                    <div className="relative w-full mb-8">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[#f2effb] mb-3">
                            <span className="opacity-70">Progress Target</span>
                            <span className="text-[#00f2ff]">{profile?.total_xp || 0} / {calculateLevelInfo(profile?.total_xp || 0).xpCeiling + 1} XP</span>
                        </div>
                        {/* Custom Progression Bar */}
                        <div className="w-full h-4 rounded-full overflow-hidden bg-[#000000] border-t border-[rgba(255,255,255,0.1)] shadow-[0_4px_10px_rgba(0,0,0,0.8)_inset]">
                            <div className="h-full flex items-center justify-end pr-1 transition-all duration-1000 ease-out bg-gradient-to-r from-[#00ff9d] to-[#00f2ff] shadow-[0_0_15px_#00f2ff,inset_0_0_5px_#00ff9d]"
                                style={{ 
                                    width: `${Math.min(100, Math.max(0, ((profile?.total_xp || 0) - calculateLevelInfo(profile?.total_xp || 0).xpFloor) / ((calculateLevelInfo(profile?.total_xp || 0).xpCeiling + 1) - calculateLevelInfo(profile?.total_xp || 0).xpFloor) * 100))}%` 
                                }}>
                                {/* Laser Head */}
                                <div className="h-full w-1.5 bg-white blur-[1px]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest pt-2 border-t border-white/5">
                        <span className="text-[#acaab5]">Stories Integrated</span>
                        <div className="flex items-center gap-2">
                             <span className="text-[#ff51fa] drop-shadow-[0_0_8px_#ff51fa] text-xl sm:text-2xl font-black">{profile?.stories_completed || 0}</span>
                             <span className="text-[#acaab5] text-[10px]">Data Nodes</span>
                        </div>
                    </div>
                </div>

                {/* Streak Protocol Card */}
                <div className="w-full bg-[#191923] border-t border-l border-[#ff51fa]/30 border-r border-b border-[#fe3c3c]/30 rounded-[2rem] p-6 sm:p-8 mb-10 shadow-lg transition-colors duration-500 hover:border-[#ff51fa]/50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#acaab5] mb-6 flex items-center gap-2">
                        <Flame size={16} className="text-[#ff51fa]" /> Streak Protocol
                    </h3>
                    
                    <div className="flex justify-around items-center mb-8">
                        {/* Current */}
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#acaab5] font-bold mb-2">Current Streak</span>
                            <div className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#ff51fa] to-[#fe3c3c] drop-shadow-[0_0_15px_rgba(254,60,60,0.6)] font-black">
                                🔥 {profile?.current_streak || 0}
                            </div>
                        </div>
                        {/* Longest */}
                        <div className="flex flex-col items-center border-l border-white/10 pl-6 sm:pl-12">
                            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#acaab5] font-bold mb-2">Longest</span>
                            <div className="text-2xl text-slate-300 font-black">
                                ⭐ {profile?.longest_streak || 0}
                            </div>
                        </div>
                    </div>

                    {/* 7 Day Calendar Dots */}
                    <div className="w-full pt-6 border-t border-white/10">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-4 text-center">7-Day Consistency Tracker</span>
                        <div className="flex justify-between">
                            {[0,1,2,3,4,5,6].map((dayOffset) => {
                                const streak = profile?.current_streak || 0;
                                const isFilled = (streak > 0) && (dayOffset < (streak === 0 ? 0 : ((streak - 1) % 7) + 1));
                                const isToday = dayOffset === ((streak === 0 ? 0 : ((streak - 1) % 7)));
                                
                                return (
                                    <div key={dayOffset} className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                                            ${isFilled 
                                                ? 'bg-gradient-to-br from-[#ff51fa] to-[#fe3c3c] border-transparent shadow-[0_0_15px_rgba(255,81,250,0.6)]' 
                                                : 'bg-black/50 border-[#484751]'}
                                        `}>
                                            {isFilled && <Check size={14} className="text-white drop-shadow-md" />}
                                        </div>
                                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[#ff51fa] shadow-[0_0_8px_#ff51fa]"></span>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ══ FUTURE SELF CARD ══════════════════════════════════════ */}
                <FutureSelfCard
                    futureMatch={futureMatch}
                    storiesCompleted={storiesCompleted}
                    decisionsCount={decisionsCount}
                    onShare={handleFutureSelfShare}
                />

                {/* Personality DNA Section */}
                {personalityDNA && (
                    <div className="w-full bg-[rgba(31,31,42,0.9)] rounded-[2rem] p-8 mb-10 border border-[#484751] relative overflow-hidden group shadow-lg">
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00f2ff]/5 to-[#ff00ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="flex flex-col items-center relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#00f2ff] drop-shadow-md mb-8">Personality DNA Link</h3>
                            
                            <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8">
                                {/* Portrait 1 */}
                                <div className="relative flex flex-col items-center">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.4)]">
                                        <img src={personalityDNA.idol1.avatarUrl} alt={personalityDNA.idol1.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="mt-3 text-xs md:text-sm font-black uppercase tracking-widest text-[#00f2ff] drop-shadow-md text-center max-w-[120px]">{personalityDNA.idol1.name}</span>
                                </div>
                                
                                {/* Glowing Plus */}
                                <div className="text-5xl font-black text-[#ff51fa] drop-shadow-[0_0_15px_#ff51fa] animate-pulse pb-8">
                                    +
                                </div>

                                {/* Portrait 2 */}
                                <div className="relative flex flex-col items-center">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#d575ff] shadow-[0_0_20px_rgba(213,117,255,0.4)]">
                                        <img src={personalityDNA.idol2.avatarUrl} alt={personalityDNA.idol2.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="mt-3 text-xs md:text-sm font-black uppercase tracking-widest text-[#d575ff] drop-shadow-md text-center max-w-[120px]">{personalityDNA.idol2.name}</span>
                                </div>
                            </div>

                            {/* Mix Description */}
                            <p className="text-center text-lg sm:text-2xl font-serif italic text-yellow-300/90 text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 to-yellow-400 drop-shadow-[0_0_5px_rgba(253,224,71,0.5)]">
                                "{`You have ${personalityDNA.idol1.desc} and ${personalityDNA.idol2.desc}`}"
                            </p>
                        </div>
                    </div>
                )}

                {/* Real Life Challenge Card */}
                <div className="w-full bg-[#13131c] rounded-2xl border border-[rgba(255,81,250,0.3)] shadow-lg p-6 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#ff51fa] shadow-[0_0_10px_#ff51fa]"></div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ff51fa] mb-3 flex items-center gap-2">
                        <Star size={16} /> Current Directive
                    </h3>
                    <p className="text-[#f2effb] font-serif text-lg leading-relaxed">
                        {realLifeChallenge}
                    </p>
                </div>

                {/* Share Dropdown / Dual Actions */}
                <div className="w-full sm:w-[80%] flex flex-col gap-4">
                    {!showOptions ? (
                        <button 
                            onClick={() => { audioSynth.playClick(); setShowOptions(true); }}
                            className="group relative w-full h-16 rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(0,242,255,0.3)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#006a70] via-[#00f1fe] to-[#005f64] opacity-80" />
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-[shimmer_2s_infinite]" />
                            
                            <span className="relative z-10 w-full h-full flex items-center justify-center gap-3 text-white font-black text-lg md:text-xl uppercase tracking-[0.3em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                <Copy className="w-6 h-6" />
                                SHARE YOUR DNA
                            </span>
                            <style>{`
                                @keyframes shimmer {
                                    0% { background-position: -200% 0; }
                                    100% { background-position: 200% 0; }
                                }
                            `}</style>
                        </button>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 w-full animate-fade-in-up">
                            {/* Copy Text Action */}
                            <button 
                                onClick={() => { audioSynth.playClick(); handleShareDNA(); }}
                                className="flex-1 flex items-center justify-center gap-3 h-14 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[#191923] hover:border-[#00f2ff]/50 transition-all shadow-[0_0_15px_rgba(0,242,255,0)] hover:shadow-[0_0_15px_rgba(0,242,255,0.2)] text-[#f2effb]"
                            >
                                {copiedDNA ? <Check className="w-5 h-5 text-[#4ade80]" /> : <ClipboardList className="w-5 h-5" />}
                                <span className="font-space uppercase font-bold tracking-widest text-[12px] sm:text-sm">
                                    {copiedDNA ? "COPIED!" : "COPY TEXT"}
                                </span>
                            </button>

                            {/* Download Card Action */}
                            <button 
                                onClick={handleDownloadCard}
                                disabled={isGenerating}
                                className="flex-1 flex items-center justify-center gap-3 h-14 rounded-full bg-gradient-to-r from-[#d575ff]/20 to-[#99f7ff]/20 border border-[rgba(0,242,255,0.3)] hover:from-[#d575ff]/40 hover:to-[#99f7ff]/40 transition-all shadow-[0_0_15px_rgba(0,242,255,0.1)] hover:shadow-[0_0_20px_rgba(213,117,255,0.4)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className={`w-5 h-5 ${isGenerating ? 'animate-bounce' : ''}`} />
                                <span className="font-space uppercase font-bold tracking-widest text-[12px] sm:text-sm">
                                    {isGenerating ? "GENERATING..." : "DOWNLOAD CARD"}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
                </>
                )}

                {/* HIDDEN OFF-SCREEN INSTAGRAM CARD */}
                <div className="absolute top-[-9999px] left-[-9999px]">
                    <InstagramCard
                        ref={cardRef}
                        profile={profile}
                        personalityDNA={personalityDNA}
                        dynamicProfileTag={dynamicProfileTag}
                        levelName={calculateLevelInfo(profile?.total_xp || 0).title}
                    />
                </div>

                {/* OFF-SCREEN FUTURE SELF SHARE CARD */}
                <div style={{ position: 'fixed', left: -99999, top: 0, width: 1080, height: 1080, overflow: 'hidden', pointerEvents: 'none', zIndex: -9999 }}>
                    <FutureSelfShareCard
                        ref={futureSelfCardRef}
                        futureMatch={futureMatch}
                        userName={profile?.name}
                    />
                </div>

            </main>
        </div>
    );
}