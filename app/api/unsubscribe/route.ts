import { NextRequest, NextResponse } from 'next/server';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const userId = await verifyUnsubscribeToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from('profiles')
      .update({ email_notifications_enabled: false })
      .eq('id', userId);

    if (error) {
      console.error('Unsubscribe DB error:', error);
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
