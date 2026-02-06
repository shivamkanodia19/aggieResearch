-- Technical discipline tags (engineering subfields, medicine, animal science, etc.)
-- Populated by Groq; research can span multiple disciplines.
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS technical_disciplines TEXT[];

CREATE INDEX IF NOT EXISTS idx_opportunities_technical_disciplines
  ON public.opportunities USING GIN (technical_disciplines);
