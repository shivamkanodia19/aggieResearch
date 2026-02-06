-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

-- Update existing users to have onboarding_complete = false (they'll need to complete it)
UPDATE public.profiles
SET onboarding_complete = FALSE
WHERE onboarding_complete IS NULL;
