import { supabase } from './supabase';
import { STORY_DATABASE } from '../data/scenarios';
import { generateLevels } from './levelGenerator';
import { resolvePersonalityAvatar } from './avatarUtils';


/**
 * Log a journey event (passive tracking)
 * @param userId - User ID from auth
 * @param journeyId - ID of the journey
 * @param eventType - 'journey_start', 'choice_selected', 'journey_complete', etc.
 * @param eventData - Additional data (choice_id, time_spent, etc.)
 */
const isValidUuid = (id?: string | null): boolean => {
  if (!id) return false;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
};

/**
 * Log a journey event (passive tracking)
 */
export async function logJourneyEvent(userId: string, journeyId: string, eventType: string, eventData: any = {}) {
  if (!journeyId) return null;

  try {
    const payload = {
      id: generateUUID(),
      user_id: isValidUuid(userId) ? userId : null,
      journey_id: journeyId,
      event_type: eventType,
      event_data: eventData,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('journey_events').insert([payload]);

    if (!error) {
        // Trigger Recommendation Updates async
        if (eventType === 'journey_complete' || eventType === 'journey_start') {
            import('../services/recommendationEngine').then(({ updateUserTagPreference }) => {
                supabase.from('story_tags').select('tag_name').eq('story_id', journeyId).then((res: any) => {
                    if (res.data && payload.user_id) {
                        const tags = res.data.map((d: any) => d.tag_name);
                        const score = eventType === 'journey_complete' ? 1.0 : 0.2;
                        updateUserTagPreference(payload.user_id, tags, score);
                        
                        // Also update short term session preferences
                        import('../store/userStore').then(({ useUserStore }) => {
                            const store = useUserStore.getState();
                            tags.forEach((t: string) => store.updateSessionPreference(t, score));
                        });
                    }
                });
            });
        }
    }

    if (error) {
      if (error.code === '23503') {
        payload.user_id = null;
        payload.id = generateUUID();
        const { data: retryData, error: retryError } = await supabase.from('journey_events').insert([payload]);
        if (!retryError) return retryData;
      }
      console.error('Error logging journey event:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Exception in logJourneyEvent:', err);
    return null;
  }
}

/**
 * Log sentiment feedback after journey completion
 */
export async function logJourneyFeedback(
  userId: string,
  journeyId: string,
  sentimentScore: number,
  emoji: string,
  sessionDurationSeconds: number | null = null
) {
  if (sentimentScore < 0 || sentimentScore > 4) return null;

  try {
    const payload = {
      id: generateUUID(),
      user_id: isValidUuid(userId) ? userId : null,
      journey_id: journeyId,
      sentiment_score: sentimentScore,
      emoji: emoji,
      session_duration_seconds: sessionDurationSeconds,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('journey_feedback').insert([payload]);

    if (error) {
      if (error.code === '23503') {
        payload.user_id = null;
        payload.id = generateUUID();
        const { data: retryData, error: retryError } = await supabase.from('journey_feedback').insert([payload]);
        if (!retryError) return retryData;
      }
      console.error('Error logging feedback:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Exception in logJourneyFeedback:', err);
    return null;
  }
}

/**
 * Log feature usage (passive)
 */
export async function logFeatureUsage(userId: string, featureName: string, sessionId: string | null = null) {
  try {
    const payload = {
      id: generateUUID(),
      user_id: isValidUuid(userId) ? userId : null,
      feature_name: featureName,
      session_id: sessionId,
      accessed_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('feature_usage').insert([payload]);

    if (error) {
      if (error.code === '23503') {
        payload.user_id = null;
        payload.id = generateUUID();
        const { data: retryData, error: retryError } = await supabase.from('feature_usage').insert([payload]);
        if (!retryError) return retryData;
      }
      console.error('Error logging feature usage:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Exception in logFeatureUsage:', err);
    return null;
  }
}

/**
 * Log an unmatched search query (story request demand signal)
 */
export async function logUnmatchedSearch(userId: string, searchQuery: string) {
  if (!searchQuery || searchQuery.trim().length === 0) return null;

  try {
    const cleanQuery = searchQuery.trim();
    
    // Check if it already exists to avoid unique constraint 409 errors
    const { data: existingRecords } = await supabase
      .from('unmatched_searches')
      .select('id')
      .ilike('search_query', cleanQuery)
      .limit(1);

    if (existingRecords && existingRecords.length > 0) {
      // If it exists, just return to prevent 409 conflicts
      return existingRecords[0];
    }

    const { data, error } = await supabase
      .from('unmatched_searches')
      .insert([{
          id: generateUUID(),
          user_id: isValidUuid(userId) ? userId : null,
          search_query: cleanQuery,
          searched_at: new Date().toISOString(),
      }]);

    if (error) {
      if (error.code === '23503') {
        // Foreign key violation - user doesn't exist in parent table (guest user)
        // Retry with null user_id
        const { data: retryData, error: retryError } = await supabase
          .from('unmatched_searches')
          .insert([{
              id: generateUUID(),
              user_id: null,
              search_query: cleanQuery,
              searched_at: new Date().toISOString(),
          }]);
        if (!retryError) return retryData;
      }
      console.error('Error logging unmatched search:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Exception in logUnmatchedSearch:', err);
    return null;
  }
}

/**
 * Add/vote on personality wish list
 */
// Fallback UUID generator for insecure contexts (like mobile testing over HTTP)
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function addToWishlist(userId: string, personalityName: string): Promise<{ success: boolean; error?: string }> {
  const cleanName = personalityName?.trim();
  if (!cleanName) return { success: false, error: 'Empty name' };

  const validUserId = isValidUuid(userId) ? userId : null;
  const insertId = generateUUID();

  try {
    // Check if personality already exists (case-insensitive) to increment vote count
    const { data: existingRecords } = await supabase
      .from('personality_wishlist')
      .select('id, vote_count, personality_name')
      .ilike('personality_name', cleanName)
      .limit(1);

    const existing = existingRecords?.[0];

    if (existing) {
      const { error: updateError } = await supabase
        .from('personality_wishlist')
        .update({ 
          vote_count: (Number(existing.vote_count) || 1) + 1,
          requested_at: new Date().toISOString()
        })
        .eq('id', existing.id);
        
      if (!updateError) {
        return { success: true };
      }
    }

    // Insert new record if not existing
    const { error } = await supabase
      .from('personality_wishlist')
      .insert([{
          id: insertId,
          user_id: validUserId,
          personality_name: cleanName,
          vote_count: 1,
          requested_at: new Date().toISOString(),
      }]);

    if (error) {
      if (error.code === '23503') {
        const { error: retryError } = await supabase
          .from('personality_wishlist')
          .insert([{
              id: generateUUID(),
              user_id: null,
              personality_name: cleanName,
              vote_count: 1,
              requested_at: new Date().toISOString(),
          }]);
        if (!retryError) return { success: true };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception in addToWishlist:', err);
    return { success: false, error: `Exception: ${err.message}` };
  }
}

/**
 * Log story difficulty rating (1-5)
 * @param userId
 * @param journeyId
 * @param difficultyRating - 1-5
 * @param part - 1 or 2
 */
export async function logDifficultyFeedback(userId: string, journeyId: string, difficultyRating: number, part: number = 1) {
  if (difficultyRating < 1 || difficultyRating > 5) {
    console.error('Difficulty rating must be 1-5');
    return null;
  }

  try {
    const payload = {
      id: generateUUID(),
      user_id: isValidUuid(userId) ? userId : null,
      journey_id: journeyId,
      difficulty_rating: difficultyRating,
      part: part,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('story_difficulty_feedback').insert([payload]);

    if (error) {
      if (error.code === '23503') {
        payload.user_id = null;
        payload.id = generateUUID();
        const { data: retryData, error: retryError } = await supabase.from('story_difficulty_feedback').insert([payload]);
        if (!retryError) return retryData;
      }
      console.error('Error logging difficulty feedback:', error);
      return null;
    }

    console.log(`✓ Difficulty feedback logged: ${difficultyRating}/5 for ${journeyId}`);
    return data;
  } catch (err) {
    console.error('Exception in logDifficultyFeedback:', err);
    return null;
  }
}

/**
 * Save topic preference
 * @param userId
 * @param topic - 'science', 'sports', 'arts', 'business', 'social_impact'
 */
export async function saveTopicPreference(userId: string, topic: string) {
  try {
    const payload = {
      id: generateUUID(),
      user_id: isValidUuid(userId) ? userId : null,
      topic: topic,
      selected_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('user_topic_preferences').insert([payload]);

    if (error) {
      if (error.code === '23503') {
        payload.user_id = null;
        payload.id = generateUUID();
        const { data: retryData, error: retryError } = await supabase.from('user_topic_preferences').insert([payload]);
        if (!retryError) return retryData;
      }
      console.error('Error saving topic preference:', error);
      return null;
    }

    console.log(`✓ Topic preference saved: ${topic}`);
    return data;
  } catch (err) {
    console.error('Exception in saveTopicPreference:', err);
    return null;
  }
}

/**
 * Log survey response
 * @param userId
 * @param questionKey - 'biggest_takeaway', 'recommend', 'useful_feature'
 * @param response
 */
export async function saveSurveyResponse(userId: string, questionKey: string, response: string | number) {
  try {
    const payload = {
      id: generateUUID(),
      user_id: isValidUuid(userId) ? userId : null,
      question_key: questionKey,
      response_text: typeof response === 'string' ? response : null,
      response_rating: typeof response === 'number' ? response : null,
      responded_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('survey_responses').insert([payload]);

    if (error) {
      if (error.code === '23503') {
        payload.user_id = null;
        payload.id = generateUUID();
        const { data: retryData, error: retryError } = await supabase.from('survey_responses').insert([payload]);
        if (!retryError) return retryData;
      }
      console.error('Error saving survey response:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception in saveSurveyResponse:', err);
    return null;
  }
}

/**
 * Get top requested personalities (for admin/wish list display)
 */
export async function getTopRequestedPersonalities(limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('personality_wishlist')
      .select('personality_name, vote_count');

    if (error) {
      console.error('Error fetching top personalities:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Group and sum votes by lowercased key to avoid duplicates
    const groups: Record<string, { displayName: string; count: number }> = {};
    data.forEach((row: any) => {
      const rawName = String(row.personality_name || '').trim();
      if (!rawName) return;
      const key = rawName.toLowerCase();
      if (!groups[key]) {
        // Format display name nicely
        const capitalized = rawName
          .split(' ')
          .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '')
          .join(' ');
        groups[key] = { displayName: capitalized, count: 0 };
      }
      groups[key].count += (Number(row.vote_count) || 1);
    });

    return Object.values(groups)
      .map(g => ({ personality_name: g.displayName, vote_count: g.count }))
      .sort((a, b) => b.vote_count - a.vote_count)
      .slice(0, limit);
  } catch (err) {
    console.error('Exception in getTopRequestedPersonalities:', err);
    return [];
  }
}

/**
 * Get global sentiment distribution
 */
export async function getGlobalSentimentDistribution() {
  try {
    const { data, error } = await supabase
      .from('journey_feedback')
      .select('sentiment_score, emoji');

    if (error) return null;

    const total = data.length;
    const avgSentiment = total > 0
      ? (data.reduce((sum: number, fb: any) => sum + fb.sentiment_score, 0) / total).toFixed(2)
      : 0;

    const sentimentBreakdown = [
      { name: '😕', value: data.filter((fb: any) => fb.sentiment_score === 0).length, fill: '#ef4444' },
      { name: '😐', value: data.filter((fb: any) => fb.sentiment_score === 1).length, fill: '#f97316' },
      { name: '🙂', value: data.filter((fb: any) => fb.sentiment_score === 2).length, fill: '#facc15' },
      { name: '😊', value: data.filter((fb: any) => fb.sentiment_score === 3).length, fill: '#4ade80' },
      { name: '🔥', value: data.filter((fb: any) => fb.sentiment_score === 4).length, fill: '#3b82f6' },
    ];

    return { total, avgSentiment: parseFloat(avgSentiment as string), distribution: sentimentBreakdown };
  } catch (err) {
    return null;
  }
}

/**
 * Get global difficulty stats
 */
export async function getGlobalDifficultyStats() {
  try {
    const { data, error } = await supabase
      .from('story_difficulty_feedback')
      .select('difficulty_rating');

    if (error) return null;

    const total = data.length;
    const avgDifficulty = total > 0
      ? (data.reduce((sum: number, fb: any) => sum + fb.difficulty_rating, 0) / total).toFixed(2)
      : 0;

    const difficultyBreakdown = [
      { name: 'Too Easy (1)', count: data.filter((fb: any) => fb.difficulty_rating === 1).length },
      { name: 'Easy (2)', count: data.filter((fb: any) => fb.difficulty_rating === 2).length },
      { name: 'Just Right (3)', count: data.filter((fb: any) => fb.difficulty_rating === 3).length },
      { name: 'Hard (4)', count: data.filter((fb: any) => fb.difficulty_rating === 4).length },
      { name: 'Too Hard (5)', count: data.filter((fb: any) => fb.difficulty_rating === 5).length },
    ];

    return { total, avgDifficulty: parseFloat(avgDifficulty as string), distribution: difficultyBreakdown };
  } catch (err) {
    return null;
  }
}

/**
 * Get feature usage
 */
export async function getFeatureUsageStats() {
  try {
    const { data, error } = await supabase
      .from('feature_usage')
      .select('feature_name');

    if (error) return [];

    const counts: Record<string, number> = {};
    data.forEach((row: any) => {
      counts[row.feature_name] = (counts[row.feature_name] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch (err) {
    return [];
  }
}

export async function getStoryAnalytics(journeyId: string) {
  try {
    const { data, error } = await supabase
      .from('journey_events')
      .select('event_type, event_data')
      .eq('journey_id', journeyId);

    if (error || !data) return null;

    let completions = 0;
    let abandons = 0;
    const frameTimes: Record<string, number[]> = {};
    const choiceDistribution: Record<string, Record<string, number>> = {};

    data.forEach((ev: any) => {
      const { frame_id, time_taken_ms, choice_text } = ev.event_data || {};
      
      if (ev.event_type === 'story_completed') completions++;
      if (ev.event_type === 'story_abandoned') abandons++;
      
      if (ev.event_type === 'frame_completed' && frame_id) {
        if (!frameTimes[frame_id]) frameTimes[frame_id] = [];
        if (time_taken_ms) frameTimes[frame_id].push(time_taken_ms);

        if (choice_text) {
          if (!choiceDistribution[frame_id]) choiceDistribution[frame_id] = {};
          choiceDistribution[frame_id][choice_text] = (choiceDistribution[frame_id][choice_text] || 0) + 1;
        }
      }
    });

    const avgFrameTimes = Object.keys(frameTimes).map(f => ({
      frame_id: f,
      avg_time_s: parseFloat((frameTimes[f].reduce((a, b) => a + b, 0) / frameTimes[f].length / 1000).toFixed(1))
    })).sort((a, b) => b.avg_time_s - a.avg_time_s);

    const totalStarts = completions + abandons;
    const completionRate = totalStarts > 0 ? (completions / totalStarts) * 100 : 0;

    return {
      completions,
      abandons,
      completionRate: completionRate.toFixed(1) + '%',
      avgFrameTimes,
      choiceDistribution
    };
  } catch (err) {
    return null;
  }
}

export async function getUserAnalytics(userQuery: string) {
  if (!userQuery?.trim()) return null;
  let userId = userQuery.trim();
  let userProfile: any = null;

  try {
    if (!isValidUuid(userId)) {
      // Lookup by username or mobile
      const { data: foundUser } = await supabase
        .from('users')
        .select('id, username, name, age, mobile')
        .or(`username.eq.${userId},mobile.eq.${userId}`)
        .maybeSingle();

      if (foundUser) {
        userId = foundUser.id;
        userProfile = foundUser;
      } else {
        return null;
      }
    } else {
      const { data: foundUser } = await supabase
        .from('users')
        .select('id, username, name, age, mobile')
        .eq('id', userId)
        .maybeSingle();
      userProfile = foundUser;
    }

    const { data: events, error: evErr } = await supabase
      .from('journey_events')
      .select('event_type, event_data, journey_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (evErr) return null;

    let storiesStarted = new Set();
    let storiesCompleted = new Set();
    let avgTimes: number[] = [];

    events?.forEach((ev: any) => {
      if (ev.journey_id) storiesStarted.add(ev.journey_id);
      if (ev.event_type === 'story_completed' || ev.event_type === 'journey_complete') {
        storiesCompleted.add(ev.journey_id);
      }
      if (ev.event_type === 'frame_completed' && ev.event_data?.time_taken_ms) {
        avgTimes.push(ev.event_data.time_taken_ms);
      }
    });

    const avgDecisionTimeS = avgTimes.length > 0 
      ? (avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length / 1000).toFixed(1)
      : '0.0';

    const { data: feedback } = await supabase
      .from('journey_feedback')
      .select('sentiment_score, journey_id')
      .eq('user_id', userId);

    const avgSentiment = feedback && feedback.length > 0 
      ? (feedback.reduce((sum: number, f: any) => sum + f.sentiment_score, 0) / feedback.length).toFixed(1)
      : 'N/A';

    return {
      userId,
      userProfile,
      totalStoriesStarted: storiesStarted.size,
      totalStoriesCompleted: storiesCompleted.size,
      completionRate: storiesStarted.size > 0 ? ((storiesCompleted.size / storiesStarted.size) * 100).toFixed(1) + '%' : '0%',
      avgDecisionTimeS,
      avgSentiment,
      recentActivity: events?.slice(0, 15) || []
    };
  } catch (err) {
    return null;
  }
}

export async function getAllJourneyIds(): Promise<string[]> {
  try {
    const { data } = await supabase.from('journey_events').select('journey_id');
    if (!data) return [];
    return Array.from(new Set(data.map((d: any) => d.journey_id))) as string[];
  } catch {
    return [];
  }
}

export function getStoryInfo(id: string) {
  if (!id) return { title: 'Unknown Story', personality: 'Unknown', age: null as number | null, avatar: '' };
  if (id === 'onboarding_quiz' || id.startsWith('onboarding')) {
    return { 
      title: 'Onboarding Mindset Assessment', 
      personality: 'Self Discovery Quiz', 
      age: null, 
      avatar: 'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/avatar_business.webp' 
    };
  }
  const all = generateLevels(18);
  const lvl = all.find(l => (l.scenarioId || l.id) === id || l.id === id);
  if (lvl) {
    return {
      title: lvl.title || id,
      personality: lvl.personality || lvl.archetype || 'Public Figure',
      age: lvl.age || null,
      avatar: resolvePersonalityAvatar(lvl.personality || lvl.archetype || '')
    };
  }

  // Fallback: parse ID like lvl_age_18_virat_1
  const parts = id.split('_');
  const ageIdx = parts.indexOf('age');
  const age = ageIdx !== -1 && parts[ageIdx + 1] ? parseInt(parts[ageIdx + 1], 10) : null;
  const name = parts.length > 3 ? parts[3].charAt(0).toUpperCase() + parts[3].slice(1) : id;

  return {
    title: id,
    personality: name,
    age,
    avatar: resolvePersonalityAvatar(name)
  };
}

export function getFrameDetails(journeyId: string, frameId: string) {
  const dbStory = STORY_DATABASE[journeyId];
  if (dbStory?.frames) {
    const frame = dbStory.frames.find((f: any) => f.id === frameId);
    if (frame) {
      return {
        prompt: frame.text || '',
        speaker: frame.speaker || '',
        choicesMap: (frame.choices || []).reduce((acc: any, c: any) => {
          acc[c.text] = { score: c.score, feedbackTitle: c.feedbackTitle || c.feedbackText };
          return acc;
        }, {})
      };
    }
  }
  return { prompt: '', speaker: '', choicesMap: {} };
}

export default {
  logJourneyEvent,
  logJourneyFeedback,
  logFeatureUsage,
  logUnmatchedSearch,
  addToWishlist,
  logDifficultyFeedback,
  saveTopicPreference,
  saveSurveyResponse,
  getTopRequestedPersonalities,
  getGlobalSentimentDistribution,
  getGlobalDifficultyStats,
  getFeatureUsageStats,
  getStoryAnalytics,
  getUserAnalytics,
  getAllJourneyIds,
  getStoryInfo,
  getFrameDetails
};

