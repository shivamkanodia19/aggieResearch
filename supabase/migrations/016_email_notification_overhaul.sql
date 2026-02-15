-- 016: Email notification overhaul
-- Adds master email toggle, per-position log reminders, admin email tracking

-- Master toggle on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;

-- Reminder columns on research_positions
ALTER TABLE public.research_positions
  ADD COLUMN IF NOT EXISTS email_reminder_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_reminder_day VARCHAR(10) DEFAULT 'Sunday',
  ADD COLUMN IF NOT EXISTS email_reminder_time VARCHAR(5) DEFAULT '18:00',
  ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Admin email tracking
CREATE TABLE IF NOT EXISTS public.admin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  target_audience VARCHAR(100) NOT NULL,
  recipients_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email_enabled
  ON public.profiles(email_notifications_enabled)
  WHERE email_notifications_enabled = true;

CREATE INDEX IF NOT EXISTS idx_research_positions_reminder
  ON public.research_positions(email_reminder_enabled, email_reminder_day, email_reminder_time)
  WHERE email_reminder_enabled = true;
