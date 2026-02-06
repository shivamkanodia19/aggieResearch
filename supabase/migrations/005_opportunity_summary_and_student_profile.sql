-- Full Groq opportunity summary (JSON)
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS opportunity_summary JSONB;

-- Student profile from resume (for matching)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_data JSONB,
  ADD COLUMN IF NOT EXISTS resume_file_name TEXT;

-- Recommendation cache (userId + opportunityId -> match result)
CREATE TABLE IF NOT EXISTS public.recommendation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  match_score INT NOT NULL,
  match_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendation_cache_user_id ON public.recommendation_cache(user_id);

ALTER TABLE public.recommendation_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recommendation cache" ON public.recommendation_cache;
CREATE POLICY "Users can view own recommendation cache" ON public.recommendation_cache
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recommendation cache" ON public.recommendation_cache;
CREATE POLICY "Users can insert own recommendation cache" ON public.recommendation_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);
