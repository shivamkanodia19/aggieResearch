import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const adminSupabase = createServiceRoleClient();
  const { userId } = params;

  // Fetch user profile
  const { data: targetUser, error: userError } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Fetch user's applications with opportunity data
  const { data: applications } = await adminSupabase
    .from('applications')
    .select('*, opportunity:opportunities(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Fetch user's research positions
  const { data: positions } = await adminSupabase
    .from('research_positions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Fetch user's weekly logs (via positions)
  const positionIds = (positions ?? []).map((p: any) => p.id);
  let weeklyLogs: any[] = [];
  if (positionIds.length > 0) {
    const { data: logs } = await adminSupabase
      .from('weekly_logs')
      .select('*')
      .in('position_id', positionIds)
      .order('week_start', { ascending: false })
      .limit(10);
    weeklyLogs = logs ?? [];
  }

  // Fetch email logs
  const { data: emailLogs } = await adminSupabase
    .from('email_logs')
    .select('*')
    .eq('user_id', userId)
    .order('sent_at', { ascending: false })
    .limit(10);

  // Calculate stats
  const apps = applications ?? [];
  const stageBreakdown = apps.reduce((acc: Record<string, number>, app: any) => {
    acc[app.stage] = (acc[app.stage] || 0) + 1;
    return acc;
  }, {});

  const stats = {
    totalSaved: apps.length,
    activeResearch: (positions ?? []).filter((p: any) => p.is_active).length,
    stageBreakdown,
    totalJournalEntries: weeklyLogs.length,
    emailsSent: (emailLogs ?? []).length,
    lastActive: targetUser.last_active_at,
  };

  return NextResponse.json({
    user: {
      ...targetUser,
      applications: apps,
      positions: positions ?? [],
      weeklyLogs,
      emailLogs: emailLogs ?? [],
    },
    stats,
  });
}
