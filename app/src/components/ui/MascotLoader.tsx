import { useEffect, useRef, useState } from 'react';
import { MASCOT_FRAMES, getFrameIndexForElapsed, MASCOT_LOOP_DURATION } from '../../data/mascotFrames';

interface MascotLoaderProps {
    fullscreen?: boolean;
    message?: string;
    subMessage?: string;
    transparentBg?: boolean;
    speed?: number;
}

export function MascotLoader({
    fullscreen = true,
    message = 'Loading...',
    subMessage,
    transparentBg = false,
}: MascotLoaderProps) {
    const [frameIndex, setFrameIndex] = useState(0);
    const startRef = useRef(performance.now());
    const reqRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        // Preload next few frames
        for (let i = 1; i <= 5 && i < MASCOT_FRAMES.length; i++) {
            const im = new Image();
            im.src = MASCOT_FRAMES[i].path;
        }

        const tick = (now: number) => {
            const elapsed = (now - startRef.current) % MASCOT_LOOP_DURATION;
            setFrameIndex(getFrameIndexForElapsed(elapsed));
            reqRef.current = requestAnimationFrame(tick);
        };
        reqRef.current = requestAnimationFrame(tick);
        return () => {
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, []);

    const content = (
        <div className="relative flex flex-col items-center justify-center select-none max-w-xs w-full px-6 py-8 text-center animate-fade-in">
            {/* Mascot Animation */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                <div className="absolute inset-0 bg-purple-500/25 blur-3xl rounded-full" />
                <img 
                    src={MASCOT_FRAMES[frameIndex].path} 
                    alt="Loading Mascot" 
                    className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_20px_rgba(213,117,255,0.4)]"
                />
            </div>

            {/* Simple Loading Message */}
            {message && (
                <p className="text-sm font-semibold text-[#00f2ff] tracking-[0.2em] uppercase" style={{ textShadow: '0 0 15px rgba(0, 242, 255, 0.5)' }}>
                    {message}
                </p>
            )}

            {/* Optional Submessage */}
            {subMessage && (
                <p className="mt-2 text-xs text-slate-400 font-normal tracking-wide">
                    {subMessage}
                </p>
            )}
        </div>
    );

    if (!fullscreen) {
        return content;
    }

    return (
        <div
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center p-4 ${
                transparentBg
                    ? 'bg-black/60 backdrop-blur-sm'
                    : 'bg-[#09090f]/95 backdrop-blur-md'
            }`}
        >
            {content}
        </div>
    );
}

export const SimpleLoader = MascotLoader;
export default MascotLoader;
