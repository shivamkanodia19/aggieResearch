import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendManualBroadcast } from '@/lib/email-helpers';

export async function POST(req: Request) {
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

  let body: { subject?: string; body?: string; targetAudience?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { subject, body: emailBody, targetAudience } = body;

  if (!subject || !emailBody) {
    return NextResponse.json(
      { error: 'Subject and body required' },
      { status: 400 }
    );
  }

  const result = await sendManualBroadcast(
    subject,
    emailBody,
    targetAudience || 'OPT_IN_ONLY',
    user.id
  );

  if (result.failed > 0) {
    console.error('[SendEmail] Broadcast errors:', result.errors);
  }

  return NextResponse.json(result);
}
