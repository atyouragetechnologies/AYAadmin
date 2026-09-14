import React, { useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const AUTH_MASCOT_ASSETS = {
    WAVING: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/Macot/waving mascot.lottie',
    HAPPY: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/Macot/happy mascot.lottie',
    WATCHING: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/Macot/watching left mascot.lottie',
} as const;

interface AuthMascotProps {
    /** Whether the user is interacting/hovering over primary actions to trigger happy reaction */
    isHappy?: boolean;
    /** Override mascot asset URL if needed */
    customAsset?: string;
    /** Extra wrapper styling */
    className?: string;
}

export const AuthMascot: React.FC<AuthMascotProps> = ({
    isHappy = false,
    customAsset,
    className = '',
}) => {
    // Preload mascot files into browser HTTP cache
    useEffect(() => {
        Object.values(AUTH_MASCOT_ASSETS).forEach((assetUrl) => {
            fetch(encodeURI(assetUrl)).catch(() => {});
        });
    }, []);

    const activeAsset = customAsset || (isHappy ? AUTH_MASCOT_ASSETS.HAPPY : AUTH_MASCOT_ASSETS.WAVING);
    const encodedSrc = encodeURI(activeAsset);

    return (
        <div className={`hidden md:flex flex-col items-center justify-center shrink-0 pointer-events-none select-none z-20 ${className}`}>
            <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-[360px] lg:h-[360px] flex items-center justify-center drop-shadow-2xl">
                {/* Glowing Background Aura */}
                <div
                    className={`absolute inset-4 rounded-full blur-3xl opacity-35 transition-colors duration-500 ${
                        isHappy ? 'bg-amber-400 opacity-70 animate-pulse' : 'bg-purple-500 opacity-40'
                    }`}
                />

                <DotLottieReact
                    key={isHappy ? 'happy' : 'waving'}
                    src={encodedSrc}
                    loop
                    autoplay
                    renderConfig={{ autoResize: true }}
                    layout={{ fit: 'contain', align: [0.5, 0.5] }}
                    style={{ width: '100%', height: '100%' }}
                    className="w-full h-full object-contain relative z-10"
                />
            </div>
        </div>
    );
};
