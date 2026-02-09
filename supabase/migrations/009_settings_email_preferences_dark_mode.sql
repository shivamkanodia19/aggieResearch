-- Email notification preferences and dark mode for settings page
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{
    "newOpportunities": true,
    "followUpReminders": true,
    "deadlineReminders": true,
    "weeklyDigest": false,
    "responseNotifications": true
  }'::jsonb;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.profiles.email_preferences IS 'User preferences for email reminders and notifications';
COMMENT ON COLUMN public.profiles.dark_mode IS 'User preference for dark theme';
