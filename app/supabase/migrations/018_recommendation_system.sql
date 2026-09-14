-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Table for story tags (Topics, Themes, Traits, etc.)
CREATE TABLE IF NOT EXISTS public.story_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id TEXT NOT NULL,
    tag_name TEXT NOT NULL,
    weight FLOAT NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, tag_name)
);

-- Table for story embeddings
CREATE TABLE IF NOT EXISTS public.story_embeddings (
    story_id TEXT PRIMARY KEY,
    embedding vector(384),
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for user tag preferences (long term profile)
CREATE TABLE IF NOT EXISTS public.user_tag_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    score FLOAT NOT NULL DEFAULT 0.0,
    interaction_count INTEGER DEFAULT 1,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tag_name)
);

-- Table for user embeddings
CREATE TABLE IF NOT EXISTS public.user_embeddings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    embedding vector(384),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendation logs for analytics
CREATE TABLE IF NOT EXISTS public.recommendation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recommended_story_ids TEXT[] NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to match stories by embedding
CREATE OR REPLACE FUNCTION match_stories(
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  exclude_story_ids text[] DEFAULT '{}'::text[]
)
RETURNS TABLE (
  story_id text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    se.story_id,
    1 - (se.embedding <=> query_embedding) AS similarity
  FROM story_embeddings se
  WHERE 1 - (se.embedding <=> query_embedding) > match_threshold
    AND NOT (se.story_id = ANY(exclude_story_ids))
  ORDER BY se.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Allow public read/write temporarily for easy client integration (mirroring existing AYA setup)
ALTER TABLE public.story_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_embeddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tag_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_embeddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_logs DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.story_tags TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.story_embeddings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_tag_preferences TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_embeddings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.recommendation_logs TO anon, authenticated, service_role;
