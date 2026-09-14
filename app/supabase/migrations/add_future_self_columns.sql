-- Future Self Match columns — additive migration, safe on existing rows
ALTER TABLE personality_profiles
  ADD COLUMN IF NOT EXISTS future_archetype TEXT,
  ADD COLUMN IF NOT EXISTS future_archetype_score INTEGER,
  ADD COLUMN IF NOT EXISTS life_resilience INTEGER,
  ADD COLUMN IF NOT EXISTS life_discipline INTEGER,
  ADD COLUMN IF NOT EXISTS life_courage INTEGER,
  ADD COLUMN IF NOT EXISTS life_creativity INTEGER,
  ADD COLUMN IF NOT EXISTS life_emotional_control INTEGER,
  ADD COLUMN IF NOT EXISTS life_leadership INTEGER,
  ADD COLUMN IF NOT EXISTS life_risk_intelligence INTEGER,
  ADD COLUMN IF NOT EXISTS life_consistency INTEGER;
