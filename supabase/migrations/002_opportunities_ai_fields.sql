-- AI-generated fields for opportunities (per frontend spec)
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS ai_summary TEXT,
  ADD COLUMN IF NOT EXISTS relevant_majors TEXT[],
  ADD COLUMN IF NOT EXISTS research_field VARCHAR(100),
  ADD COLUMN IF NOT EXISTS skills_gained TEXT[],
  ADD COLUMN IF NOT EXISTS time_commitment VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_opportunities_research_field ON public.opportunities(research_field);
