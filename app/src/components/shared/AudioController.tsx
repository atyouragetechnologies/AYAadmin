import { useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { audioManager as audioSynth } from "../../utils/audioManager";
import { bgmManager } from '../../utils/bgmManager';

export function AudioController({ isMapActive = true }: { isMapActive?: boolean }) {
    // Global State
    const musicVolume = useUserStore((state) => state.musicVolume);
    const sfxVolume = useUserStore((state) => state.sfxVolume);
    const isMusicMuted = useUserStore((state) => state.isMusicMuted);
    const isSfxMuted = useUserStore((state) => state.isSfxMuted);
    const hasInteracted = useUserStore((state) => state.hasInteracted);
    const setHasInteracted = useUserStore((state) => state.setHasInteracted);

    // 1. Initialize Audio Context on first User Interaction
    useEffect(() => {
        const handleInteraction = () => {
            // Aggressively attempt to initialize/resume on every interaction
            // until the context is running. Mobile browsers require this inside 
            // a user gesture handler.
            audioSynth.init();
            
            if (!hasInteracted) {
                setHasInteracted(true);
                // Force immediate sync of volumes from store on first init
                const state = useUserStore.getState();
                audioSynth.setMusicVolume(state.isMusicMuted ? 0 : state.musicVolume);
                audioSynth.setSfxVolume(state.isSfxMuted ? 0 : state.sfxVolume);

                // Start music synchronously within the gesture to appease strict iOS rules
                if (!state.isMusicMuted && isMapActive) {
                    bgmManager.setVolume(state.musicVolume);
                }
            }
        };

        // Listen on window for broad coverage
        window.addEventListener('click', handleInteraction, { once: false });
        window.addEventListener('touchstart', handleInteraction, { once: false });
        window.addEventListener('mousedown', handleInteraction, { once: false });

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('mousedown', handleInteraction);
        };
    }, [hasInteracted, setHasInteracted]);

    // 2. Manage Music Playback & Volume
    useEffect(() => {
        // Sync volume with bgmManager
        bgmManager.setVolume(isMusicMuted ? 0 : musicVolume);
    }, [isMusicMuted, musicVolume]);

    // 3. Manage SFX Volume (Independent of Playback)
    useEffect(() => {
        audioSynth.setSfxVolume(isSfxMuted ? 0 : sfxVolume);
    }, [sfxVolume, isSfxMuted]);

    // No visible UI anymore - it lives in the Settings Modal now
    return null;
}
