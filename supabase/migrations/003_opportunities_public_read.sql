-- Allow unauthenticated read for landing preview and public browse
DROP POLICY IF EXISTS "Authenticated users can view opportunities" ON public.opportunities;
CREATE POLICY "Public can view opportunities" ON public.opportunities
  FOR SELECT USING (true);
