-- Fix Opportunity Flow & Revamp Weekly Log System
-- Adds archive support for research positions and week tracking metadata for logs

-- ============================================================
-- 1. research_positions: add archive columns
-- ============================================================
ALTER TABLE public.research_positions
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_research_positions_is_archived
  ON public.research_positions(is_archived);

-- ============================================================
-- 2. weekly_logs: add week_end and week_number
-- ============================================================
ALTER TABLE public.weekly_logs
  ADD COLUMN IF NOT EXISTS week_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS week_number INTEGER;

CREATE INDEX IF NOT EXISTS idx_weekly_logs_week_number
  ON public.weekly_logs(week_number);

-- ============================================================
-- 3. Backfill week_end for existing logs
--    week_end = week_start + 6 days 23:59:59.999
-- ============================================================
UPDATE public.weekly_logs
SET week_end = week_start + INTERVAL '6 days 23 hours 59 minutes 59 seconds'
WHERE week_end IS NULL;

-- ============================================================
-- 4. Backfill week_number for existing logs
--    Calculated as weeks between the research position start_date
--    and the log's week_start, plus one.
-- ============================================================
UPDATE public.weekly_logs wl
SET week_number = GREATEST(1,
  EXTRACT(DAYS FROM (
    DATE_TRUNC('week', wl.week_start) - DATE_TRUNC('week', rp.start_date)
  ))::INTEGER / 7 + 1
)
FROM public.research_positions rp
WHERE wl.position_id = rp.id
  AND wl.week_number IS NULL;

-- ============================================================
-- 5. RLS policies are inherited from 007_research_journal.sql
--    No changes needed - existing policies already cover:
--    - Users can CRUD their own research_positions (based on user_id)
--    - Users can CRUD weekly_logs for their own positions
-- ============================================================
