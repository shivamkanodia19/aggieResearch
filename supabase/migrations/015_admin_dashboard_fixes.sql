-- Ensure admin-related columns exist on profiles
-- These may already exist from earlier migrations; IF NOT EXISTS makes this safe to re-run.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_email_sent TIMESTAMP WITH TIME ZONE;

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON public.profiles(last_active_at);

-- Allow admins to read all profiles (needed for admin dashboard user list)
-- The service role client bypasses RLS, but this policy ensures the admin check
-- query (which uses the anon client with RLS) can read the user's own is_admin field.
-- The existing "Users can view own profile" policy already covers this, but
-- we add a safety net for admin reads:
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
    )
  );

-- To grant admin access, run:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'your-email@tamu.edu';
