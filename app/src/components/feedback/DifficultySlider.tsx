import { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { logDifficultyFeedback } from '../../utils/feedbackUtils';
import './DifficultySlider.css';

/**
 * Shown after Part 1 completes (before Part 2).
 * Asks: "Did that challenge feel right?"
 * Slider from 1 (too easy) to 5 (too hard).
 */
export function DifficultySlider({ journeyId, onSubmit }: { journeyId: string, onSubmit?: (difficulty: number) => void }) {
  const user = useUserStore(state => state.profile);
  const [difficulty, setDifficulty] = useState(3);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const difficultyLabels: Record<number, string> = {
    1: 'Too Easy',
    2: 'Easy',
    3: 'Just Right',
    4: 'Hard',
    5: 'Too Hard',
  };

  const handleSubmit = async () => {
    if (!user || !user.id) return;

    setIsLoading(true);

    try {
      await logDifficultyFeedback(user.id, journeyId, difficulty, 1);
      setIsSubmitted(true);

      // Call parent callback
      if (onSubmit) {
        onSubmit(difficulty);
      }

      // Hide after 2 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error('Error submitting difficulty feedback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="difficulty-submitted">
        ✓ Thanks! Continuing to Part 2...
      </div>
    );
  }

  return (
    <div className="difficulty-slider">
      <p className="difficulty-prompt">Did that challenge feel right?</p>

      <div className="slider-container">
        <span className="label-left">Too Easy</span>

        <input
          type="range"
          min="1"
          max="5"
          value={difficulty}
          onChange={(e) => setDifficulty(parseInt(e.target.value))}
          className="slider"
          disabled={isLoading}
        />

        <span className="label-right">Too Hard</span>
      </div>

      <p className="difficulty-label">
        {difficultyLabels[difficulty]}
      </p>

      <button
        className="difficulty-submit-btn"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        Continue to Part 2
      </button>
    </div>
  );
}

export default DifficultySlider;
