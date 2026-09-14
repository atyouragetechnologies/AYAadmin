import { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { saveTopicPreference } from '../../utils/feedbackUtils';
import './TopicPreferencesSurvey.css';

/**
 * Shown after user completes 3rd journey.
 * Asks: "What topics interest you?"
 * Multi-select checkboxes.
 * Awards +10 XP for answering.
 */
export function TopicPreferencesSurvey({ onComplete }: { onComplete?: (topics: string[] | null) => void }) {
  const user = useUserStore(state => state.profile);
  const addXp = useUserStore(state => state.addXp);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const topics = [
    { id: 'science', label: '🔬 Science & Innovation' },
    { id: 'sports', label: '⚽ Sports & Athletics' },
    { id: 'arts', label: '🎨 Arts & Creativity' },
    { id: 'business', label: '💼 Business & Entrepreneurship' },
    { id: 'social_impact', label: '🌍 Social Impact' },
  ];

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubmit = async () => {
    if (!user || !user.id || selectedTopics.length === 0) return;

    setIsLoading(true);

    try {
      // Save each selected topic
      for (const topic of selectedTopics) {
        await saveTopicPreference(user.id, topic);
      }

      // Award XP
      addXp(10);

      setIsSubmitted(true);

      // Callback
      if (onComplete) {
        onComplete(selectedTopics);
      }

      // Hide after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving topic preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="survey-submitted">
        ✓ Thanks! We'll personalize your experience. +10 XP
      </div>
    );
  }

  return (
    <div className="topic-preferences-survey">
      <h3>What topics interest you?</h3>
      <p className="survey-subtitle">Help us personalize your journey</p>

      <div className="checkbox-grid">
        {topics.map((topic) => (
          <label key={topic.id} className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedTopics.includes(topic.id)}
              onChange={() => toggleTopic(topic.id)}
              disabled={isLoading}
            />
            <span>{topic.label}</span>
          </label>
        ))}
      </div>

      <div className="survey-actions">
        <button
          className="survey-submit-btn"
          onClick={handleSubmit}
          disabled={selectedTopics.length === 0 || isLoading}
        >
          Save Preferences
        </button>
        <button
          className="survey-skip-btn"
          onClick={() => {
            if (onComplete) onComplete(null);
          }}
          disabled={isLoading}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

export default TopicPreferencesSurvey;
