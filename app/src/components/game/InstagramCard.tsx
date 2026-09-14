import { forwardRef } from 'react';
import type { UserProfile } from '../../types/gameTypes';

interface InstagramCardProps {
    profile: UserProfile | null;
    personalityDNA: {
        idol1: { name: string; avatarUrl: string; desc: string };
        idol2: { name: string; avatarUrl: string; desc: string };
    } | null;
    dynamicProfileTag: string;
    levelName: string;
}

const getIdolHook = (name: string) => {
    const hooks: Record<string, string> = {
        'Sundar Pichai': 'Sundar Pichai was leading core products shaping the internet',
        'Bill Gates': 'Bill Gates had already founded Microsoft and secured major contracts',
        'Steve Jobs': 'Steve Jobs was building the first Apple computers in his garage',
        'Mark Zuckerberg': 'Mark Zuckerberg was launching the foundation of a billion-user network',
        'A.R. Rahman': 'A.R. Rahman was revolutionizing modern music composition',
        'Mary Kom': 'Mary Kom was dominating championships against impossible odds',
        'Kobe Bryant': 'Kobe Bryant was already training 6 hours a day',
        'Elon Musk': 'Elon Musk was actively building his first major tech empires',
        'Default': 'legends were already deciding their absolute fate'
    };
    for (const [key, hook] of Object.entries(hooks)) {
         if (name.includes(key)) return hook;
    }
    return `${name} was already laying the groundwork for a global legacy`;
}

export const InstagramCard = forwardRef<HTMLDivElement, InstagramCardProps>(
    ({ profile, personalityDNA, dynamicProfileTag, levelName }, ref) => {
        // Fallback traits
        const userTraits = profile?.traits || {
            risk: 50, creativity: 50, vision: 50, empathy: 50, leadership: 50
        };

        const renderGameBar = (label: string, value: number, colorStart: string, colorEnd: string, glow: string) => (
            <div className="flex flex-col gap-1 w-full relative z-10 group">
                <div className="flex justify-between items-end w-full px-1">
                    <span 
                        className="font-black text-[15px] uppercase tracking-[0.2em] italic text-[#f2effb] drop-shadow-md" 
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        {label}
                    </span>
                    <span 
                        className="font-black text-[18px] uppercase tracking-widest text-[#ffffff] drop-shadow-md" 
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        {value}<span className="text-[12px] opacity-60">/100</span>
                    </span>
                </div>
                {/* HUD Bar Track */}
                <div className="relative h-3.5 w-full bg-[#0a0a10] border-t border-b border-[#ffffff]/10 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] overflow-hidden transform -skew-x-12">
                    {/* Fill */}
                    <div 
                        className="absolute top-0 left-0 h-full flex items-center justify-end transition-all ease-out"
                        style={{ 
                            width: `${value}%`,
                            background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})`,
                            boxShadow: `0 0 20px ${glow}, inset 0 0 8px #ffffff`
                        }}
                    >
                        <div className="w-2 h-full bg-white blur-[1px]"></div>
                    </div>
                    {/* HUD Scanline / Graticule effect */}
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)] mix-blend-overlay"></div>
                </div>
            </div>
        );

        const hookText = getIdolHook(personalityDNA?.idol1.name || 'Default');

        return (
            <div 
                ref={ref}
                className="relative w-[1080px] h-[1080px] bg-[#05050A] overflow-hidden flex flex-col items-center justify-between"
                style={{ 
                    fontFamily: "'Space Grotesk', sans-serif",
                    boxSizing: 'border-box'
                }}
            >
                {/* Cinematic Background Canvas */}
                <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                    
                    {/* Diagonal Light Beams (Using conic/linear gradients) */}
                    <div className="absolute top-[-30%] left-[-20%] w-[150%] h-[150%] bg-[linear-gradient(135deg,rgba(0,242,255,0.06)_0%,transparent_40%,transparent_60%,rgba(213,117,255,0.04)_100%)] rotate-12 transform-gpu"></div>
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_20%,#000000_70%)]"></div>
                    
                    {/* Dark Vignette Edge Blur */}
                    <div className="absolute inset-0 shadow-[inset_0_0_200px_100px_rgba(0,0,0,1)]"></div>
                    
                    {/* Dense Particle Noise Overlay */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')" }}></div>

                    {/* Dramatic Core Glow behind Identity */}
                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#00f2ff]/20 via-[#bc13fe]/10 to-transparent rounded-full sm:blur-[140px] blur-[60px] mix-blend-screen"></div>

                    {/* Sparkle Details generated via strict positioning */}
                    <div className="absolute top-[18%] left-[24%] w-1.5 h-1.5 bg-white drop-shadow-[0_0_8px_white] rotate-45"></div>
                    <div className="absolute top-[40%] right-[15%] w-2 h-2 bg-[#00f2ff] drop-shadow-[0_0_12px_#00f2ff] rotate-45"></div>
                    <div className="absolute bottom-[28%] left-[10%] w-1.5 h-1.5 bg-[#ff51fa] drop-shadow-[0_0_8px_#ff51fa] rotate-45"></div>
                </div>

                {/* --- TOP SECTION: Hook Line --- */}
                <header className="relative z-10 w-full pt-16 px-16 flex flex-col items-center">
                    <div className="mb-4 px-6 py-2 rounded-sm border border-[rgba(255,184,0,0.4)] bg-[rgba(255,184,0,0.05)] shadow-[0_0_15px_rgba(255,184,0,0.1)_inset]">
                        <span className="text-[#ffb800] uppercase font-black tracking-[0.4em] text-sm">What would YOU have done?</span>
                    </div>
                    
                    <h1 className="text-[100px] leading-[0.9] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] to-[#acaab5] drop-shadow-[0_10px_30px_rgba(0,0,0,1)] text-center mb-2" style={{ textShadow: "0px 0px 40px rgba(255,255,255,0.2)"}}>
                        AT YOUR AGE...
                    </h1>
                    
                    <h2 className="text-[#ffb800] text-2xl font-black italic tracking-wider text-center max-w-3xl leading-snug uppercase drop-shadow-[0_0_15px_rgba(255,184,0,0.4)]">
                        {hookText}
                    </h2>
                </header>

                {/* --- MIDDLE SECTION: Identity --- */}
                <main className="relative z-10 w-full flex-grow flex flex-col items-center justify-center px-12 pb-6">
                    
                    {/* User Identity Hologram */}
                    <div className="flex flex-col items-center mb-10">
                        <h3 className="text-7xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] mb-2">
                            {profile?.name || 'GUEST_0X'}
                        </h3>
                        <div className="flex items-center gap-4">
                            <span className="px-4 py-1.5 bg-[#00f2ff]/10 border-l-2 border-r-2 border-[#00f2ff] text-[#00f2ff] font-bold tracking-[0.3em] uppercase text-xl shadow-[0_0_20px_#00f2ff_inset,0_0_20px_#00f2ff]">
                                Age {profile?.age || 18} • {levelName}
                            </span>
                        </div>
                    </div>

                    {/* DNA Portraits Cinematic Array */}
                    {personalityDNA && (
                        <div className="flex flex-col items-center w-full">
                            <div className="flex items-center justify-center gap-12 relative w-full mb-8">
                                
                                {/* Background Tech Grid */}
                                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#ffffff]/10 -translate-y-1/2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"></div>
                                
                                {/* Portrait 1 - Cyan Glow */}
                                <div className="relative group z-10 flex flex-col items-center gap-4">
                                    <div className="relative w-40 h-40 rounded-full border-4 border-[#000000] ring-4 ring-[#00f2ff] shadow-[0_0_50px_rgba(0,242,255,0.6),inset_0_0_40px_rgba(0,242,255,0.8)] overflow-hidden">
                                        <div className="absolute inset-0 bg-[#00f2ff]/20 z-10 mix-blend-overlay"></div>
                                        <img src={personalityDNA.idol1.avatarUrl} crossOrigin="anonymous" alt={personalityDNA.idol1.name} className="w-full h-full object-cover grayscale brightness-125 contrast-125" />
                                    </div>
                                    <span className="bg-[#00f2ff]/10 text-[#00f2ff] font-black px-4 py-1 border border-[#00f2ff]/40 shadow-[0_0_15px_#00f2ff] uppercase tracking-[0.2em]">
                                        {personalityDNA.idol1.name}
                                    </span>
                                </div>

                                {/* Link Indicator */}
                                <div className="relative z-10 w-16 h-16 rounded-full bg-[#05050A] border-4 border-[#ff51fa] flex items-center justify-center shadow-[0_0_40px_#ff51fa,inset_0_0_20px_#ff51fa]">
                                    <div className="w-2 h-2 bg-[#ff51fa] rounded-full drop-shadow-[0_0_10px_#ffffff]"></div>
                                </div>

                                {/* Portrait 2 - Purple Glow */}
                                <div className="relative group z-10 flex flex-col items-center gap-4">
                                    <div className="relative w-40 h-40 rounded-full border-4 border-[#000000] ring-4 ring-[#bc13fe] shadow-[0_0_50px_rgba(188,19,254,0.6),inset_0_0_40px_rgba(188,19,254,0.8)] overflow-hidden">
                                        <div className="absolute inset-0 bg-[#bc13fe]/20 z-10 mix-blend-overlay"></div>
                                        <img src={personalityDNA.idol2.avatarUrl} crossOrigin="anonymous" alt={personalityDNA.idol2.name} className="w-full h-full object-cover grayscale brightness-125 contrast-125" />
                                    </div>
                                    <span className="bg-[#bc13fe]/10 text-[#bc13fe] font-black px-4 py-1 border border-[#bc13fe]/40 shadow-[0_0_15px_#bc13fe] uppercase tracking-[0.2em]">
                                        {personalityDNA.idol2.name}
                                    </span>
                                </div>
                            </div>

                            {/* Aggressive Quote Block */}
                            <div className="relative py-4 px-10 border-l-4 border-r-4 border-[#ffb800] bg-gradient-to-r from-[rgba(255,184,0,0.1)] via-[rgba(255,184,0,0.02)] to-[rgba(255,184,0,0.1)] shadow-[0_0_30px_rgba(255,184,0,0.1)]">
                                <p className="font-serif italic text-3xl font-bold text-center text-[#ffb800] drop-shadow-[0_0_10px_rgba(255,184,0,0.8)]">
                                    "{`You have ${personalityDNA.idol1.desc} and ${personalityDNA.idol2.desc}`}"
                                </p>
                            </div>
                        </div>
                    )}
                </main>

                {/* --- BOTTOM SECTION: Stats HUD --- */}
                <div className="relative z-10 w-full px-16 pb-8">
                    {/* HUD Module Container */}
                    <div className="w-full bg-[rgba(20,20,30,0.6)] sm:backdrop-blur-md rounded-lg border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                        
                        {/* Title Bar */}
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                            <span className="text-[#acaab5] uppercase tracking-[0.3em] text-sm font-bold">DNA Match Target Detected</span>
                            <span className="text-[#00ff9d] text-3xl font-black uppercase tracking-wider drop-shadow-[0_0_15px_#00ff9d]">
                                {Math.max(50, Math.floor(Math.random() * 20) + 75)}% DNA Match with {personalityDNA?.idol1.name || dynamicProfileTag} 🏆
                            </span>
                        </div>

                        {/* Trait Bars Grid */}
                        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                            {renderGameBar("Risk Taker", userTraits.risk || 50, "#ff51fa", "#ff0055", "#ff51fa")}
                            {renderGameBar("Creative", userTraits.creativity || 50, "#bc13fe", "#8000ff", "#bc13fe")}
                            {renderGameBar("Analytical", userTraits.vision || 50, "#00f2ff", "#0088ff", "#00f2ff")}
                            {renderGameBar("Social", userTraits.empathy || 50, "#00ff9d", "#00aa55", "#00ff9d")}
                            <div className="col-span-2">
                                {renderGameBar("Ambitious", userTraits.leadership || 50, "#ffb800", "#ff6600", "#ffb800")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER: Call To Action --- */}
                <footer className="relative z-20 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-6 pb-12 px-16 flex items-center justify-between border-t-2 border-[#484751]/50">
                    {/* AYA Identifier */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-white flex items-center justify-center transform hover:rotate-90 transition-transform">
                            <span className="text-white font-black text-xl">A</span>
                        </div>
                        <span className="text-white font-black tracking-[0.4em] text-lg">AT YOUR AGE</span>
                    </div>
                    
                    {/* Link */}
                    <div className="flex flex-col items-center">
                        <span className="text-[#00f2ff] uppercase tracking-widest font-black text-[18px] drop-shadow-[0_0_12px_#00f2ff]">
                            PLAY FREE AT
                        </span>
                        <span className="text-[#f2effb] uppercase tracking-[0.2em] font-light text-md opacity-80">
                            atyourage.app
                        </span>
                    </div>

                    {/* QR / Right Anchor */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/20">
                        <span className="text-white uppercase font-black tracking-[0.2em]">🧬 FIND YOUR DNA</span>
                    </div>
                </footer>

            </div>
        );
    }
);

InstagramCard.displayName = 'InstagramCard';
