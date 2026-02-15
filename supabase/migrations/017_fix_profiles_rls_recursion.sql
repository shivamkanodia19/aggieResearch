-- Fix: the "Admins can view all profiles" policy from migration 015 causes
-- infinite recursion because it queries the profiles table from within a
-- policy on the profiles table. This results in 500 errors on ALL profiles
-- queries (including the admin check in the admin layout).
--
-- Solution: use a SECURITY DEFINER function to check admin status. This
-- function runs as the DB owner, bypassing RLS for the inner query and
-- breaking the recursion.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Drop the broken self-referential policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate it using the SECURITY DEFINER function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR public.is_admin()
  );
