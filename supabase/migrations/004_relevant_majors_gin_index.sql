-- GIN index on relevant_majors for efficient filter-by-major queries (array contains)
CREATE INDEX IF NOT EXISTS idx_opportunities_relevant_majors ON public.opportunities USING GIN (relevant_majors);
