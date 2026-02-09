import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminSupabase = createServiceRoleClient();
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const today = new Date(now.setHours(0, 0, 0, 0));

    // Total users
    const { count: totalRegistered } = await adminSupabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    const { count: totalGuest } = await adminSupabase
      .from('user_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('is_guest', true);

    // Active users (last 7 days, last 30 days)
    const { data: activeUsers7d } = await adminSupabase
      .from('analytics_events')
      .select('user_id')
      .eq('user_type', 'registered')
      .gte('timestamp', last7Days.toISOString());

    const { data: activeUsers30d } = await adminSupabase
      .from('analytics_events')
      .select('user_id')
      .eq('user_type', 'registered')
      .gte('timestamp', last30Days.toISOString());

    const uniqueUsers7d = new Set(activeUsers7d?.map(e => e.user_id).filter(Boolean) || []);
    const uniqueUsers30d = new Set(activeUsers30d?.map(e => e.user_id).filter(Boolean) || []);

    // New signups
    const { count: signupsToday } = await adminSupabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: signupsThisWeek } = await adminSupabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', last7Days.toISOString());

    const { count: signupsThisMonth } = await adminSupabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', last30Days.toISOString());

    // Conversion rate (guest → registered)
    const { count: guestSessions } = await adminSupabase
      .from('user_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('is_guest', true)
      .gte('start_time', last30Days.toISOString());

    const conversionRate = guestSessions && guestSessions > 0 
      ? ((signupsThisMonth || 0) / guestSessions) * 100
      : 0;

    return NextResponse.json({
      totalUsers: {
        registered: totalRegistered || 0,
        guest: totalGuest || 0,
        total: (totalRegistered || 0) + (totalGuest || 0),
      },
      activeUsers: {
        last7Days: uniqueUsers7d.size,
        last30Days: uniqueUsers30d.size,
      },
      newSignups: {
        today: signupsToday || 0,
        thisWeek: signupsThisWeek || 0,
        thisMonth: signupsThisMonth || 0,
      },
      conversionRate: parseFloat(conversionRate.toFixed(1)),
    });
  } catch (error) {
    console.error('Summary error:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}
