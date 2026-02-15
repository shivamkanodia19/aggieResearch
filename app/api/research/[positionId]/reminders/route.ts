import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { positionId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { positionId } = params;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.email_reminder_enabled === 'boolean') {
      updates.email_reminder_enabled = body.email_reminder_enabled;
    }
    if (typeof body.email_reminder_day === 'string') {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (!validDays.includes(body.email_reminder_day)) {
        return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
      }
      updates.email_reminder_day = body.email_reminder_day;
    }
    if (typeof body.email_reminder_time === 'string') {
      const validTimes = ['09:00', '12:00', '15:00', '18:00', '21:00'];
      if (!validTimes.includes(body.email_reminder_time)) {
        return NextResponse.json({ error: 'Invalid time' }, { status: 400 });
      }
      updates.email_reminder_time = body.email_reminder_time;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // RLS ensures user can only update their own positions
    const { data, error } = await supabase
      .from('research_positions')
      .update(updates)
      .eq('id', positionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Reminder update error:', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
