-- Guest browsing + progressive disclosure

-- 1) Track whether a user has ever used the applications pipeline
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_used_pipeline BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.profiles.has_used_pipeline IS 'True after user saves their first opportunity (reveals My Applications tab)';

-- 2) Allow public (anon) users to browse opportunities
-- Drop the old "authenticated only" policy and replace with a public read policy.
DROP POLICY IF EXISTS "Authenticated users can view opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Public can view opportunities" ON public.opportunities;

CREATE POLICY "Public can view opportunities" ON public.opportunities
  FOR SELECT USING (true);

