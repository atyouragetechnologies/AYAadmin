import { useNavigate } from 'react-router-dom';
import { ThemeSwitcherModal } from '../components/game/ThemeSwitcherModal';
import { audioManager as audioSynth } from "../utils/audioManager";

export function ThemeSwitcherPage() {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 bg-slate-950">
            <ThemeSwitcherModal 
                isOpen={true} 
                onClose={() => {
                    audioSynth.playBack();
                    navigate(-1);
                }} 
            />
        </div>
    );
}
