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
    const limit = parseInt(searchParams.get('limit') || '50');

    const adminSupabase = createServiceRoleClient();

    const { data: recentEvents, error } = await adminSupabase
      .from('analytics_events')
      .select(`
        timestamp,
        user_type,
        event_type,
        event_data,
        user_id,
        profiles:user_id (
          email
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    const formattedEvents = recentEvents?.map((event: any) => ({
      timestamp: event.timestamp,
      userType: event.user_type,
      userEmail: event.profiles?.email || 'Guest',
      action: formatAction(event.event_type),
      target: event.event_data?.tab_name || event.event_data?.feature || 'Unknown',
      eventType: event.event_type,
    })) || [];

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error('Activity feed error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}

function formatAction(eventType: string): string {
  const actionMap: Record<string, string> = {
    'tab_click': 'Clicked',
    'page_view': 'Viewed',
    'opportunity_save': 'Saved',
    'application_create': 'Created',
    'log_create': 'Logged',
  };
  return actionMap[eventType] || 'Performed';
}
