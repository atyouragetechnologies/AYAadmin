-- Migration 029: Explicit RLS & Grant for Story Metadata
-- Ensures anonymous and authenticated clients can query story_metadata for Situation Map filtering.

ALTER TABLE public.story_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "story_metadata_select" ON public.story_metadata;
CREATE POLICY "story_metadata_select" ON public.story_metadata FOR SELECT USING (true);

GRANT SELECT ON TABLE public.story_metadata TO anon, authenticated, service_role;
