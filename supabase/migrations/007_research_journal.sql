-- Research Journal Feature
-- Students can track weekly progress for accepted positions

-- Research positions (one per accepted opportunity per user)
CREATE TABLE IF NOT EXISTS public.research_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  
  -- Position details (pulled from opportunity, editable)
  title TEXT NOT NULL,
  pi_name TEXT NOT NULL,
  pi_email TEXT,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_research_positions_user_id ON public.research_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_positions_opportunity_id ON public.research_positions(opportunity_id);

-- Weekly logs for each position
CREATE TABLE IF NOT EXISTS public.weekly_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES public.research_positions(id) ON DELETE CASCADE,
  
  week_start TIMESTAMP WITH TIME ZONE NOT NULL, -- Monday of the week (normalized)
  
  -- Core metrics
  hours_worked DECIMAL(5, 2), -- e.g., 10.5 hours
  accomplishments TEXT[], -- Array of bullet points
  learnings TEXT[], -- Array of bullet points
  blockers TEXT[], -- Array of bullet points
  next_week_plan TEXT[], -- Array of bullet points
  
  -- Optional notes
  meeting_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(position_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_logs_position_id ON public.weekly_logs(position_id);
CREATE INDEX IF NOT EXISTS idx_weekly_logs_week_start ON public.weekly_logs(week_start);

-- RLS Policies
ALTER TABLE public.research_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own research positions
DROP POLICY IF EXISTS "Users can view own research positions" ON public.research_positions;
CREATE POLICY "Users can view own research positions" ON public.research_positions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own research positions
DROP POLICY IF EXISTS "Users can insert own research positions" ON public.research_positions;
CREATE POLICY "Users can insert own research positions" ON public.research_positions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own research positions
DROP POLICY IF EXISTS "Users can update own research positions" ON public.research_positions;
CREATE POLICY "Users can update own research positions" ON public.research_positions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own research positions
DROP POLICY IF EXISTS "Users can delete own research positions" ON public.research_positions;
CREATE POLICY "Users can delete own research positions" ON public.research_positions
  FOR DELETE USING (auth.uid() = user_id);

-- Users can view logs for their own positions
DROP POLICY IF EXISTS "Users can view own weekly logs" ON public.weekly_logs;
CREATE POLICY "Users can view own weekly logs" ON public.weekly_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_positions
      WHERE research_positions.id = weekly_logs.position_id
      AND research_positions.user_id = auth.uid()
    )
  );

-- Users can insert logs for their own positions
DROP POLICY IF EXISTS "Users can insert own weekly logs" ON public.weekly_logs;
CREATE POLICY "Users can insert own weekly logs" ON public.weekly_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.research_positions
      WHERE research_positions.id = weekly_logs.position_id
      AND research_positions.user_id = auth.uid()
    )
  );

-- Users can update logs for their own positions
DROP POLICY IF EXISTS "Users can update own weekly logs" ON public.weekly_logs;
CREATE POLICY "Users can update own weekly logs" ON public.weekly_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.research_positions
      WHERE research_positions.id = weekly_logs.position_id
      AND research_positions.user_id = auth.uid()
    )
  );

-- Users can delete logs for their own positions
DROP POLICY IF EXISTS "Users can delete own weekly logs" ON public.weekly_logs;
CREATE POLICY "Users can delete own weekly logs" ON public.weekly_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.research_positions
      WHERE research_positions.id = weekly_logs.position_id
      AND research_positions.user_id = auth.uid()
    )
  );
