import { useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { LevelMap } from '../components/game/LevelMap';
import { PersonalityIntro } from '../components/game/PersonalityIntro';
import { ScenarioGame } from '../components/game/ScenarioGame';
import { MatchReport } from '../components/game/MatchReport';
import { ProfileDashboard } from '../components/game/ProfileDashboard';
import { DnaProfile } from '../components/game/DnaProfile';
import { CharacterSelection } from '../components/game/CharacterSelection';
import { MoodWheel } from '../components/MoodWheel/MoodWheel';
import { DailyChallengeReveal } from '../components/game/DailyChallengeReveal';
import { LevelUpCelebration } from '../components/game/LevelUpCelebration';
import { calculateLevelInfo } from '../utils/levelSystem';
import { generateLevels } from '../utils/levelGenerator';

import { useState } from 'react';
import { X, Dna } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotLoader } from '../components/ui/MascotLoader';

export function MapRouteHandler() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if we just returned from MatchReport or redirected from auth
    const searchParams = new URLSearchParams(location.search);
    const [showDnaUpdated, setShowDnaUpdated] = useState(searchParams.get('dnaUpdated') === 'true');
    const [showAlreadySignedIn, setShowAlreadySignedIn] = useState(searchParams.get('alreadySignedIn') === 'true');
    
    // Note: Automatic subscription popup on page load removed as requested
    // Subscription modal remains accessible via explicit user action (e.g. SideMenu / Profile)

    const closeDnaDialog = () => {
        setShowDnaUpdated(false);
        navigate('/game', { replace: true });
    };

    const closeSignedInDialog = () => {
        setShowAlreadySignedIn(false);
        navigate('/game', { replace: true });
    };

    return (
        <>
            <LevelMap 
                onPlayLevel={(level) => navigate(`/game/intro/${level.id}`)} 
                onOpenDnaProfile={() => navigate('/game/dna')}
            />
            
            <AnimatePresence>
                {showDnaUpdated && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm p-8 rounded-[2rem] bg-slate-900 border border-[#00f2ff]/30 shadow-[0_0_40px_rgba(0,242,255,0.2)] text-center flex flex-col items-center"
                        >
                            <button
                                onClick={closeDnaDialog}
                                className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00f2ff] to-[#00ff9d] flex items-center justify-center mb-6 shadow-lg shadow-[#00f2ff]/30">
                                <Dna size={32} className="text-black" />
                            </div>
                            
                            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">DNA Updated!</h2>
                            <p className="text-sm text-slate-400 mb-8">
                                Based on your latest decisions, your behavioral DNA profile has evolved.
                            </p>
                            
                            <button
                                onClick={() => navigate('/game/dna')}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#00ff9d] text-black font-bold uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00f2ff]/20"
                            >
                                Check Your DNA Data
                            </button>
                        </motion.div>
                    </div>
                )}
                
                {showAlreadySignedIn && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm p-8 rounded-[2rem] bg-slate-900 border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)] text-center flex flex-col items-center"
                        >
                            <button
                                onClick={closeSignedInDialog}
                                className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2 mt-4">Welcome Back!</h2>
                            <p className="text-sm text-slate-400 mb-8">
                                You are already signed in. Resume your journey!
                            </p>
                            
                            <button
                                onClick={closeSignedInDialog}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-500/20"
                            >
                                Continue to Game
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

export function IntroRouteHandler() {
    const { id } = useParams();
    const navigate = useNavigate();
    const levels = useUserStore((state) => state.levels);
    
    let level = levels.find((l) => String(l.id) === String(id));
    if (!level) {
        level = generateLevels(18).find((l) => String(l.id) === String(id));
    }
    if (!level) {
        return <MascotLoader message="LOADING TIMELINE..." subMessage="Opening personality archives..." />;
    }

    return (
        <PersonalityIntro 
            level={level} 
            onStart={() => navigate(`/game/play/${level.id}`)} 
            onBack={() => navigate('/game')} 
        />
    );
}

export function PlayRouteHandler() {
    const { id } = useParams();
    const navigate = useNavigate();
    const levels = useUserStore((state) => state.levels);
    const completeLevel = useUserStore((state) => state.completeLevel);
    const unlockLevel = useUserStore((state) => state.unlockLevel);
    const setPendingStreakData = useUserStore((state) => state.setPendingStreakData);
    
    let level = levels.find((l) => String(l.id) === String(id));
    if (!level) {
        level = generateLevels(18).find((l) => String(l.id) === String(id));
    }
    if (!level) {
        return <MascotLoader message="ENTERING SIMULATION..." subMessage="Calibrating branching pathways..." />;
    }

    const handleComplete = (stars: number) => {
        completeLevel(level.id, stars);
        const currentIndex = levels.findIndex(l => l.id === level.id);
        if (currentIndex !== -1 && currentIndex < levels.length - 1) {
            unlockLevel(levels[currentIndex + 1].id);
        }
        navigate(`/game/report/${level.id}`);
    };

    return (
        <ScenarioGame 
            level={level} 
            onComplete={handleComplete} 
            onBack={() => navigate('/game')} 
            onDailyChallengeComplete={setPendingStreakData} 
        />
    );
}

export function ReportRouteHandler() {
    const { id } = useParams();
    const navigate = useNavigate();
    const levels = useUserStore((state) => state.levels);
    const profile = useUserStore((state) => state.profile);
    
    let level = levels.find((l) => String(l.id) === String(id));
    if (!level) {
        level = generateLevels(18).find((l) => String(l.id) === String(id));
    }
    if (!level || !profile) {
        return <MascotLoader message="CALCULATING REPORT..." subMessage="Synthesizing your decision DNA..." />;
    }

    return (
        <MatchReport
            storyId={String(level.id)}
            userTraits={profile.traits}
            userProfile={profile.psychologicalProfile}
            idolTraits={level.idolTraits || { discipline: 50, resilience: 50, risk: 50, leadership: 50, creativity: 50, empathy: 50, vision: 50 }}
            idolName={level.personality || level.archetype}
            onClose={() => navigate('/game?dnaUpdated=true')}
        />
    );
}

export function DnaRouteHandler() {
    const navigate = useNavigate();
    const profile = useUserStore((state) => state.profile);
    if (!profile) {
        return <MascotLoader message="SEQUENCING BEHAVIORAL DNA..." subMessage="Loading neural personality profile..." />;
    }

    return <DnaProfile onBack={() => navigate('/game')} />;
}

export function ProfileRouteHandler() {
    const navigate = useNavigate();
    const profile = useUserStore((state) => state.profile);
    if (!profile) {
        return <MascotLoader message="LOADING TRAVELER PROFILE..." subMessage="Syncing your rank & achievements..." />;
    }

    return <ProfileDashboard onBack={() => navigate('/game')} />;
}

export function SelectionRouteHandler() {
    const { age } = useParams();
    const navigate = useNavigate();
    const levels = useUserStore((state) => state.levels);
    
    if (!age) return <Navigate to="/game" replace />;
    const activeAge = parseInt(age, 10);
    
    return (
        <CharacterSelection 
            age={activeAge}
            options={levels.filter(l => Number(l.age) === Number(activeAge))}
            onSelect={(level) => navigate(`/game/intro/${level.id}`)}
            onBack={() => navigate('/game')} 
        />
    );
}

export function MoodRouteHandler() {
    const navigate = useNavigate();
    const profile = useUserStore((state) => state.profile);
    if (!profile) {
        return <MascotLoader message="INITIALIZING MOOD WHEEL..." subMessage="Aligning celestial coordinates..." />;
    }

    return (
        <MoodWheel
            userId={profile.id || ''}
            userAge={profile.age || 18}
            onMoodSelected={(mood) => {
                navigate('/game/daily-reveal', { state: { mood } });
            }}
            onClose={() => navigate(-1)}
        />
    );
}

export function DailyRevealRouteHandler() {
    const location = useLocation();
    const navigate = useNavigate();
    const mood = location.state?.mood;
    
    if (!mood) return <Navigate to="/game" replace />;

    return (
        <DailyChallengeReveal
            mood={mood}
            onClose={() => navigate(-1)}
            onComplete={(level) => navigate(`/game/intro/${level.id}`)}
        />
    );
}

export function LevelUpRouteHandler() {
    const navigate = useNavigate();
    const profile = useUserStore((state) => state.profile);

    if (!profile) return <Navigate to="/game" replace />;

    const levelInfo = calculateLevelInfo(profile.total_xp || 0);

    return (
        <div className="w-full min-h-[100dvh] bg-slate-950">
            <LevelUpCelebration
                levelName={levelInfo.title}
                levelNumber={profile.level || 1}
                onComplete={() => navigate(-1)}
            />
        </div>
    );
}

export { AdminPanelPage as AdminRouteHandler } from './AdminPanelPage';