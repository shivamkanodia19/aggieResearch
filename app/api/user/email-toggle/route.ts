import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ email_notifications_enabled: enabled })
      .eq('id', user.id);

    if (error) {
      console.error('Email toggle update error:', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ email_notifications_enabled: enabled });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
