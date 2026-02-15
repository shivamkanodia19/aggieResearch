import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin check
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Admin check failed:', profileError);
      return NextResponse.json(
        { error: 'Failed to verify admin status. The is_admin column may not exist — run the latest migrations.' },
        { status: 500 }
      );
    }

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const adminSupabase = createServiceRoleClient();

    const { data: users, error } = await adminSupabase
      .from('profiles')
      .select('id, name, email, major, interests, email_preferences, last_active_at, last_email_sent, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch users:', error);
      return NextResponse.json(
        { error: `Failed to fetch users: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(users || []);
  } catch (err) {
    console.error('Admin users route error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
