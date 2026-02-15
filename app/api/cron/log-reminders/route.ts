import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sendEmailWithUnsubscribe } from '@/lib/email-helpers';
import { generateUnsubscribeToken, getUnsubscribeUrl } from '@/lib/unsubscribe';
import LogReminderEmail from '@/emails/LogReminderEmail';
import { resend } from '@/lib/resend';

function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const headerSecret = request.headers.get('x-cron-secret');
  const url = request.nextUrl ?? new URL(request.url);
  const querySecret = url.searchParams.get('secret') ?? url.searchParams.get('cron_secret');
  return bearer === secret || headerSecret === secret || querySecret === secret;
}

/** Get current CST day name and hour */
function getCurrentCST(): { dayName: string; hour: number } {
  const now = new Date();
  const cstString = now.toLocaleString('en-US', { timeZone: 'America/Chicago' });
  const cstDate = new Date(cstString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return {
    dayName: days[cstDate.getDay()],
    hour: cstDate.getHours(),
  };
}

/** Get the start of the current week (Sunday 00:00 UTC) */
function getWeekStartUTC(): Date {
  const now = new Date();
  const cstString = now.toLocaleString('en-US', { timeZone: 'America/Chicago' });
  const cstDate = new Date(cstString);
  const day = cstDate.getDay(); // 0 = Sunday
  const sundayCST = new Date(cstDate);
  sundayCST.setDate(cstDate.getDate() - day);
  sundayCST.setHours(0, 0, 0, 0);
  return sundayCST;
}

/** Format a week range like "Feb 9 - Feb 15" */
function formatWeekRange(weekStart: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const end = new Date(weekStart);
  end.setDate(weekStart.getDate() + 6);
  return `${months[weekStart.getMonth()]} ${weekStart.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;
}

const HOUR_TO_TIME: Record<number, string> = {
  9: '09:00',
  12: '12:00',
  15: '15:00',
  18: '18:00',
  21: '21:00',
};

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!resend) {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });
  }

  const { dayName, hour } = getCurrentCST();
  const timeSlot = HOUR_TO_TIME[hour];

  // Only run at valid reminder times
  if (!timeSlot) {
    return NextResponse.json({ message: `Not a reminder time slot (hour=${hour})`, sent: 0, skipped: 0 });
  }

  const supabase = createServiceRoleClient();
  const weekStart = getWeekStartUTC();
  const weekStartISO = weekStart.toISOString();

  // Find positions with reminders matching current day and time
  // Join with profiles to check master toggle and get email
  const { data: positions, error } = await supabase
    .from('research_positions')
    .select(`
      id,
      title,
      pi_name,
      user_id,
      last_reminder_sent_at,
      profiles!inner (
        id,
        email,
        name,
        email_notifications_enabled
      )
    `)
    .eq('email_reminder_enabled', true)
    .eq('email_reminder_day', dayName)
    .eq('email_reminder_time', timeSlot)
    .eq('is_archived', false);

  if (error) {
    console.error('[log-reminders] Query error:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }

  if (!positions || positions.length === 0) {
    return NextResponse.json({ message: 'No reminders to send', sent: 0, skipped: 0 });
  }

  let sent = 0;
  let skipped = 0;

  for (const pos of positions) {
    const profile = pos.profiles as unknown as {
      id: string;
      email: string;
      name: string | null;
      email_notifications_enabled: boolean | null;
    };

    // Check master toggle
    if (profile.email_notifications_enabled === false) {
      skipped++;
      continue;
    }

    // Check if already reminded this week
    if (pos.last_reminder_sent_at) {
      const lastSent = new Date(pos.last_reminder_sent_at);
      if (lastSent >= weekStart) {
        skipped++;
        continue;
      }
    }

    // Check if user already logged this week
    const { data: existingLog } = await supabase
      .from('weekly_logs')
      .select('id')
      .eq('position_id', pos.id)
      .gte('week_start', weekStartISO)
      .limit(1);

    if (existingLog && existingLog.length > 0) {
      skipped++;
      continue;
    }

    // Send reminder email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aggieresearchfinder.com';
      const token = await generateUnsubscribeToken(profile.id);
      const unsubscribeUrl = getUnsubscribeUrl(token);

      await resend.emails.send({
        from: 'Aggie Research Finder <noreply@aggieresearchfinder.com>',
        to: profile.email,
        subject: `Time to log your research hours - ${pos.title}`,
        react: LogReminderEmail({
          userName: profile.name || 'there',
          positionTitle: pos.title,
          piName: pos.pi_name || 'your PI',
          weekRange: formatWeekRange(weekStart),
          logUrl: `${baseUrl}/research/${pos.id}`,
          unsubscribeUrl,
        }),
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });

      // Update last_reminder_sent_at
      await supabase
        .from('research_positions')
        .update({ last_reminder_sent_at: new Date().toISOString() })
        .eq('id', pos.id);

      // Log the email
      await supabase.from('email_logs').insert({
        user_id: profile.id,
        type: 'LOG_REMINDER',
        subject: `Time to log your research hours - ${pos.title}`,
      });

      sent++;
    } catch (err) {
      console.error(`[log-reminders] Failed for position ${pos.id}:`, err);
      skipped++;
    }
  }

  console.log(`[log-reminders] ${dayName} ${timeSlot} CST: sent=${sent}, skipped=${skipped}`);
  return NextResponse.json({ sent, skipped });
}
