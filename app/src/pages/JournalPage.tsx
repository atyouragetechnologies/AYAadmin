import { useNavigate } from 'react-router-dom';
import { LessonJournal } from '../components/game/LessonJournal';
import { audioManager as audioSynth } from "../utils/audioManager";

export function JournalPage() {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 bg-slate-950">
            <LessonJournal 
                onClose={() => {
                    audioSynth.playBack();
                    navigate(-1);
                }} 
            />
        </div>
    );
}
