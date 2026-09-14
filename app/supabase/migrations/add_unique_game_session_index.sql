-- Prevent duplicate game_sessions for the same user + personality on the same day.
-- This acts as a database-level safety net in addition to the application-level useRef guard.
CREATE UNIQUE INDEX IF NOT EXISTS unique_game_session 
ON game_sessions(user_id, selected_personality, ((created_at AT TIME ZONE 'UTC')::date));
