-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO CREATE THE SCENARIOS AND LEVELS TABLES

CREATE TABLE IF NOT EXISTS public.scenarios (
  id TEXT PRIMARY KEY,
  title TEXT,
  source TEXT,
  frames JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.levels (
  id TEXT PRIMARY KEY,
  day_number INTEGER,
  title TEXT,
  description TEXT,
  personality TEXT,
  required_stars INTEGER,
  year INTEGER,
  age INTEGER,
  theme TEXT,
  archetype TEXT,
  bio TEXT,
  fame TEXT,
  achievements JSONB,
  lesson TEXT,
  avatar_url TEXT,
  scenario_id TEXT,
  idol_traits JSONB,
  status TEXT,
  is_locked BOOLEAN,
  stars INTEGER,
  part1 TEXT,
  part2 TEXT,
  placeholder BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security (RLS) so your frontend can read the levels/scenarios freely
ALTER TABLE public.scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels DISABLE ROW LEVEL SECURITY;
