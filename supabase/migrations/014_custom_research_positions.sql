-- Custom Research Positions
-- Allow users to create research positions not from Aggie Collaborate
-- by making opportunity_id nullable.

-- ============================================================
-- 1. Make opportunity_id nullable
-- ============================================================
ALTER TABLE public.research_positions
  ALTER COLUMN opportunity_id DROP NOT NULL;

-- ============================================================
-- 2. Drop the existing unique constraint on (user_id, opportunity_id)
--    since custom positions have NULL opportunity_id.
--    Replace with a partial unique index that only applies when
--    opportunity_id IS NOT NULL.
-- ============================================================
ALTER TABLE public.research_positions
  DROP CONSTRAINT IF EXISTS research_positions_user_id_opportunity_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_research_positions_user_opp_unique
  ON public.research_positions(user_id, opportunity_id)
  WHERE opportunity_id IS NOT NULL;

-- ============================================================
-- 3. Drop the FK index on opportunity_id and recreate as partial
--    (only matters for non-null values)
-- ============================================================
DROP INDEX IF EXISTS idx_research_positions_opportunity_id;
CREATE INDEX IF NOT EXISTS idx_research_positions_opportunity_id
  ON public.research_positions(opportunity_id)
  WHERE opportunity_id IS NOT NULL;

-- ============================================================
-- 4. Add optional department column for custom positions
-- ============================================================
ALTER TABLE public.research_positions
  ADD COLUMN IF NOT EXISTS department TEXT;

-- ============================================================
-- 5. Add optional description column for custom positions
-- ============================================================
ALTER TABLE public.research_positions
  ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================================
-- 6. Comment for clarity
-- ============================================================
COMMENT ON COLUMN public.research_positions.opportunity_id IS
  'NULL for custom positions created by users (not from Aggie Collaborate)';
