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

    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get('dateRange') || '7d';
    const userType = searchParams.get('userType') || 'all';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const adminSupabase = createServiceRoleClient();

    // Build query
    let query = adminSupabase
      .from('analytics_events')
      .select('event_data, user_id')
      .eq('event_type', 'tab_click')
      .gte('timestamp', startDate.toISOString());

    if (userType !== 'all') {
      query = query.eq('user_type', userType);
    }

    const { data: tabClicks, error } = await query;

    if (error) {
      throw error;
    }

    // Aggregate by tab
    const tabStats: Record<string, {
      tabName: string;
      totalClicks: number;
      uniqueUsers: Set<string>;
    }> = {};

    tabClicks?.forEach((click: any) => {
      const tabName = click.event_data?.tab_name || 'Unknown';
      
      if (!tabStats[tabName]) {
        tabStats[tabName] = {
          tabName,
          totalClicks: 0,
          uniqueUsers: new Set(),
        };
      }

      tabStats[tabName].totalClicks++;
      if (click.user_id) {
        tabStats[tabName].uniqueUsers.add(click.user_id);
      }
    });

    // Format results
    const results = Object.values(tabStats).map((stat) => ({
      tabName: stat.tabName,
      totalClicks: stat.totalClicks,
      uniqueUsers: stat.uniqueUsers.size,
      avgClicksPerUser: stat.uniqueUsers.size > 0 
        ? (stat.totalClicks / stat.uniqueUsers.size).toFixed(1)
        : '0.0',
      clickRate: 0, // Calculate based on total users
    }));

    // Sort by total clicks descending
    results.sort((a, b) => b.totalClicks - a.totalClicks);

    return NextResponse.json({ tabs: results });
  } catch (error) {
    console.error('Tab analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch tab data' }, { status: 500 });
  }
}
