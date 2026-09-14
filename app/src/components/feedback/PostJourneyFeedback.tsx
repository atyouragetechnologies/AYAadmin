import { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { logJourneyFeedback } from '../../utils/feedbackUtils';
import { supabase } from '../../utils/supabase';
import { Sparkles, ThumbsUp, ThumbsDown, Check, ArrowRight } from 'lucide-react';
import './PostJourneyFeedback.css';

/**
 * Enhanced PostJourneyFeedback:
 * Step 1: Emoji reaction ("Did this help?") -> +5 XP
 * Step 2: "What will you try differently?" reflection -> +10 XP (saves to story_reflections)
 */
export function PostJourneyFeedback({
  journeyId,
  sessionDurationSeconds,
  onFeedbackComplete,
}: {
  journeyId: string;
  sessionDurationSeconds: number | null;
  onFeedbackComplete?: () => void;
}) {
  const user = useUserStore(state => state.profile);
  const addXp = useUserStore(state => state.addXp);
  const updateSessionPreference = useUserStore(state => state.updateSessionPreference);
  
  const [step, setStep] = useState<'emoji' | 'reflection' | 'done'>('emoji');
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 2 reflection states
  const [reflectionText, setReflectionText] = useState('');
  const [wasRelevant, setWasRelevant] = useState<boolean | null>(null);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  const emojis = [
    { icon: '😕', label: 'Very negative', score: 0 },
    { icon: '😐', label: 'Neutral', score: 1 },
    { icon: '🤔', label: 'Okay', score: 2 },
    { icon: '😊', label: 'Good', score: 3 },
    { icon: '🔥', label: 'Excellent', score: 4 },
  ];

  const REFLECTION_CHIPS = [
    'Take a bold decision',
    'Stay calm in pressure',
    'Prioritize creative time',
    'Speak up with confidence',
    'Listen more before acting',
    'Embrace current uncertainty'
  ];

  const handleEmojiClick = async (score: number, emoji: string) => {
    if (!user || !user.id) {
      if (onFeedbackComplete) onFeedbackComplete();
      return;
    }

    setIsLoading(true);

    try {
      // 1. Log emoji feedback to Supabase
      await logJourneyFeedback(
        user.id,
        journeyId,
        score,
        emoji,
        sessionDurationSeconds
      );

      // Award XP for Step 1
      addXp(5);

      // Advance to Step 2 reflection
      setStep('reflection');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setStep('reflection');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter(c => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleSaveReflection = async () => {
    if (!user || !user.id) {
      if (onFeedbackComplete) onFeedbackComplete();
      return;
    }

    setIsLoading(true);

    try {
      if (!user.id.startsWith('offline-')) {
        await supabase.from('story_reflections').insert({
          user_id: user.id,
          story_id: journeyId,
          reflection_text: reflectionText.trim() || null,
          selected_chips: selectedChips,
          was_relevant: wasRelevant,
          did_help: true,
        });
      }

      // Update session preferences to immediately inform next recommendation
      selectedChips.forEach(chip => {
        const tag = chip.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        updateSessionPreference(tag, 1);
      });

      addXp(10);
      setStep('done');

      setTimeout(() => {
        if (onFeedbackComplete) onFeedbackComplete();
      }, 1500);
    } catch (err) {
      console.error('Error saving reflection:', err);
      if (onFeedbackComplete) onFeedbackComplete();
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="feedback-confirmation">
        <p className="flex items-center justify-center gap-2">
          <Check size={18} className="text-emerald-400" />
          <span>✓ Reflection Saved! +15 Total XP</span>
        </p>
      </div>
    );
  }

  if (step === 'reflection') {
    return (
      <div className="post-journey-feedback max-w-md mx-auto p-4 sm:p-6 bg-slate-900/95 rounded-2xl border border-purple-500/30 text-white shadow-2xl">
        <div className="flex items-center gap-2 mb-3 text-purple-300">
          <Sparkles size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Integration & Action (+10 XP)
          </span>
        </div>

        <p className="text-xs sm:text-sm font-semibold mb-3">
          What will you try differently after this story?
        </p>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {REFLECTION_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => toggleChip(chip)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                selectedChips.includes(chip)
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Optional free-text */}
        <textarea
          value={reflectionText}
          onChange={e => setReflectionText(e.target.value)}
          placeholder="Personal note to your future self (optional)..."
          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 resize-none h-16 mb-3"
        />

        {/* Was this story relevant? */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <span className="text-slate-400">Was this story relevant to you?</span>
          <div className="flex gap-2">
            <button
              onClick={() => setWasRelevant(true)}
              className={`p-1.5 rounded-lg border ${
                wasRelevant === true ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <ThumbsUp size={14} />
            </button>
            <button
              onClick={() => setWasRelevant(false)}
              className={`p-1.5 rounded-lg border ${
                wasRelevant === false ? 'bg-rose-600 border-rose-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <ThumbsDown size={14} />
            </button>
          </div>
        </div>

        {/* Submit or skip */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (onFeedbackComplete) onFeedbackComplete();
            }}
            className="text-xs text-slate-400 hover:text-white"
          >
            Skip
          </button>
          <button
            onClick={handleSaveReflection}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5 shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Complete</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-journey-feedback">
      <p className="feedback-prompt">How was that journey?</p>

      <div className="emoji-reactions">
        {emojis.map((item) => (
          <button
            key={item.score}
            className="emoji-btn"
            onClick={() => handleEmojiClick(item.score, item.icon)}
            disabled={isLoading}
            title={item.label}
            aria-label={`Rate as ${item.label}`}
          >
            {item.icon}
          </button>
        ))}
      </div>

      <p className="feedback-hint">Your feedback helps AYA recommend better stories</p>
    </div>
  );
}

export default PostJourneyFeedback;
