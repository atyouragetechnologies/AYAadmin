import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { logJourneyEvent } from '../utils/feedbackUtils';

/**
 * Hook to track journey events automatically
 * Call this in your main journey component
 */
export function useJourneyTracking(journeyId: string) {
  const user = useUserStore(state => state.profile);

  useEffect(() => {
    if (!user || !user.id || !journeyId) return;

    // Log journey start
    logJourneyEvent(user.id, journeyId, 'journey_start', {
      start_time: new Date().toISOString(),
    });

    // Track time spent
    const sessionStartTime = Date.now();

    return () => {
      // On unmount, log how long they were there
      const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      if (user && user.id) {
        logJourneyEvent(user.id, journeyId, 'journey_ended', {
          duration_seconds: durationSeconds,
        });
      }
    };
  }, [journeyId, user]);
}

export default useJourneyTracking;
