-- ============================================================================
-- FEEDBACK SYSTEM TABLES FOR AYA APP
-- Run these commands in Supabase SQL Editor
-- Do not modify character limits or data types
-- ============================================================================

-- TABLE 1: Journey Behavioral Events (Passive Tracking)
CREATE TABLE IF NOT EXISTS journey_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  journey_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'journey_start', 'choice_selected', 'journey_complete', 'pause', 'resume'
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_journey_events_user_id ON journey_events(user_id);
CREATE INDEX idx_journey_events_journey_id ON journey_events(journey_id);
CREATE INDEX idx_journey_events_created_at ON journey_events(created_at);

-- TABLE 2: Journey Completion Feedback (Emoji + Sentiment)
CREATE TABLE IF NOT EXISTS journey_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  journey_id TEXT NOT NULL,
  sentiment_score INT CHECK (sentiment_score >= 0 AND sentiment_score <= 4), -- 0-4 (😕 to 🔥)
  emoji TEXT NOT NULL,
  session_duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_journey_feedback_journey_id ON journey_feedback(journey_id);
CREATE INDEX idx_journey_feedback_created_at ON journey_feedback(created_at);

-- TABLE 3: Feature Usage Tracking (Passive)
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_name TEXT NOT NULL, -- 'dna_profile', 'journal', 'vibe_spinner', 'search', 'story_detail'
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX idx_feature_usage_feature_name ON feature_usage(feature_name);

-- TABLE 4: Unmatched Search Queries (Story Request Demand Signal)
CREATE TABLE IF NOT EXISTS unmatched_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  search_query TEXT NOT NULL,
  searched_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_unmatched_searches_query ON unmatched_searches(search_query);
CREATE INDEX idx_unmatched_searches_created_at ON unmatched_searches(searched_at);

-- TABLE 5: Personality Wish List (User Story Requests)
CREATE TABLE IF NOT EXISTS personality_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  personality_name TEXT NOT NULL,
  vote_count INT DEFAULT 1,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id, personality_name) -- One vote per user per personality
);

CREATE INDEX idx_wishlist_personality ON personality_wishlist(personality_name);
CREATE INDEX idx_wishlist_vote_count ON personality_wishlist(vote_count);

-- TABLE 6: Story Difficulty Feedback
CREATE TABLE IF NOT EXISTS story_difficulty_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  journey_id TEXT NOT NULL,
  difficulty_rating INT CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5), -- 1=too easy, 5=too hard
  part INT, -- 1 or 2
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_difficulty_journey ON story_difficulty_feedback(journey_id);

-- TABLE 7: Topic Preferences (User Survey Response)
CREATE TABLE IF NOT EXISTS user_topic_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL, -- 'science', 'sports', 'arts', 'business', 'social_impact'
  selected_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_topic_preferences_user ON user_topic_preferences(user_id);
CREATE INDEX idx_topic_preferences_topic ON user_topic_preferences(topic);

-- TABLE 8: Journey Completion Tracking (For Analytics)
CREATE TABLE IF NOT EXISTS journey_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  journey_id TEXT NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  total_time_seconds INT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_completions_user ON journey_completions(user_id);
CREATE INDEX idx_completions_journey ON journey_completions(journey_id);

-- TABLE 9: Survey Responses (Quarterly Detailed Feedback)
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_key TEXT NOT NULL, -- 'biggest_takeaway', 'recommend', 'useful_feature'
  response_text TEXT,
  response_rating INT,
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_survey_responses_user ON survey_responses(user_id);

-- TABLE 10: Admin Dashboard Cache (Refreshed Daily)
CREATE TABLE IF NOT EXISTS admin_feedback_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL UNIQUE,
  metric_value JSONB,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Users can only see their own feedback data
ALTER TABLE journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE unmatched_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_difficulty_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only insert their own data
CREATE POLICY "Users can insert their own feedback"
  ON journey_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journey feedback"
  ON journey_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feature usage"
  ON feature_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Wish list is public (anyone can vote), but insert is user-specific
CREATE POLICY "Users can vote on wish list"
  ON personality_wishlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow reading wishlist counts
CREATE POLICY "Anyone can read wishlist"
  ON personality_wishlist
  FOR SELECT
  USING (true);

-- Allow reading unmatched searches (for admin dashboard)
CREATE POLICY "Anyone can read unmatched searches"
  ON unmatched_searches
  FOR SELECT
  USING (true);

-- Allow inserting unmatched searches
CREATE POLICY "Users can insert unmatched searches"
  ON unmatched_searches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert difficulty feedback"
  ON story_difficulty_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert topic preferences"
  ON user_topic_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
