import { useUserStore } from '../../store/userStore';
import { audioManager } from '../../utils/audioManager';
import { VibeSpinnerButton } from '../MoodWheel/VibeSpinnerButton';
import { useNavigate } from 'react-router-dom';

interface ForYouCarouselProps {
    onPlayLevel?: (l: any) => void;
    allLevels?: any[];
}

export function ForYouCarousel({ onPlayLevel: _onPlayLevel, allLevels: _allLevels }: ForYouCarouselProps) {
    const navigate = useNavigate();
    const profile = useUserStore(state => state.profile);

    return (
        <div className="w-full pt-20 md:pt-24 pb-2 z-40 relative flex items-center justify-center pointer-events-auto">
            <div className="flex items-center justify-center scale-95 md:scale-105 transition-transform">
                <VibeSpinnerButton
                    streak={profile?.current_streak || 0}
                    completed={!!profile?.daily_challenge_completed}
                    userId={profile?.id || ''}
                    onClick={() => {
                        audioManager.playClick();
                        navigate('/game/mood');
                    }}
                />
            </div>
        </div>
    );
}


