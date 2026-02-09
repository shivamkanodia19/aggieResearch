import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json();

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid events data' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Batch insert events
    const eventsToInsert = events.map((event: any) => ({
      user_id: event.userId || null,
      session_id: event.sessionId,
      event_type: event.eventType,
      event_data: event.eventData || {},
      user_type: event.userType || 'guest',
      timestamp: new Date(event.timestamp).toISOString(),
    }));

    const { error } = await supabase
      .from('analytics_events')
      .insert(eventsToInsert);

    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json({ error: 'Failed to log events' }, { status: 500 });
    }

    // Update or create user session
    if (events.length > 0) {
      const firstEvent = events[0];
      const { error: sessionError } = await supabase
        .from('user_sessions')
        .upsert({
          session_id: firstEvent.sessionId,
          user_id: firstEvent.userId || null,
          is_guest: firstEvent.userType === 'guest',
          last_active: new Date().toISOString(),
        }, {
          onConflict: 'session_id',
        });

      if (sessionError) {
        console.error('Session update error:', sessionError);
        // Don't fail the request if session update fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to log events' }, { status: 500 });
  }
}
