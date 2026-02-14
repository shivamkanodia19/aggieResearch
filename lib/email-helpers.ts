import { resend } from './resend';
import { createServiceRoleClient } from './supabase/server';
import NewOpportunityEmail from '@/emails/NewOpportunityEmail';
import ManualBroadcastEmail from '@/emails/ManualBroadcastEmail';
import type { EmailPreferences } from './types/database';

const FROM_EMAIL = 'Aggie Research Finder <noreply@aggieresearchfinder.com>';

/**
 * Send new opportunity notification to a single user.
 * Only sends if user has opted in and frequency matches INSTANT (newOpportunities = true).
 */
export async function sendNewOpportunityNotification(
  userId: string,
  opportunity: {
    id: string;
    title: string;
    department: string | null;
    piName: string | null;
    description: string | null;
    relevant_majors: string[] | null;
    technical_disciplines: string[] | null;
  }
) {
  if (!resend) {
    return { sent: false, reason: 'Resend not configured' };
  }

  const adminSupabase = createServiceRoleClient();

  const { data: user, error: userError } = await adminSupabase
    .from('profiles')
    .select('id, email, name, major, interests, email_preferences')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return { sent: false, reason: 'User not found' };
  }

  const prefs = (user.email_preferences as EmailPreferences | null) ?? {
    newOpportunities: true,
    followUpReminders: true,
    deadlineReminders: true,
    weeklyDigest: false,
    responseNotifications: true,
  };

  if (!prefs.newOpportunities) {
    return { sent: false, reason: 'User opted out of new opportunity emails' };
  }

  // Check if opportunity matches user's major or interests
  const userMajor = user.major?.toLowerCase() ?? '';
  const userInterests = (user.interests as string[] | null) ?? [];
  const oppDept = (opportunity.department ?? '').toLowerCase();
  const oppMajors = (opportunity.relevant_majors ?? []).map((m: string) => m.toLowerCase());
  const oppDisc = (opportunity.technical_disciplines ?? []).map((d: string) => d.toLowerCase());
  const oppDesc = (opportunity.description ?? '').toLowerCase();

  const matchesMajor =
    userMajor &&
    (oppDept.includes(userMajor) ||
      oppMajors.some((m: string) => m.includes(userMajor)) ||
      oppDisc.some((d: string) => d.includes(userMajor)));

  const matchesInterests = userInterests.some(
    (interest: string) => {
      const lower = interest.toLowerCase();
      return (
        oppMajors.some((m: string) => m.includes(lower)) ||
        oppDisc.some((d: string) => d.includes(lower)) ||
        oppDesc.includes(lower)
      );
    }
  );

  if (!matchesMajor && !matchesInterests) {
    return { sent: false, reason: 'Opportunity does not match user interests' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `New Research Opportunity: ${opportunity.title}`,
      react: NewOpportunityEmail({
        userName: user.name || 'there',
        opportunity: {
          title: opportunity.title,
          department: opportunity.department || 'Not specified',
          piName: opportunity.piName || 'Not specified',
          description: opportunity.description || '',
        },
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return { sent: false, error };
    }

    // Log email
    await adminSupabase.from('email_logs').insert({
      user_id: userId,
      type: 'NEW_OPPORTUNITY',
      subject: `New Research Opportunity: ${opportunity.title}`,
    });

    // Update last email sent
    await adminSupabase
      .from('profiles')
      .update({ last_email_sent: new Date().toISOString() })
      .eq('id', userId);

    return { sent: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { sent: false, error };
  }
}

/**
 * Send manual broadcast to users based on target audience.
 */
export async function sendManualBroadcast(
  subject: string,
  body: string,
  targetAudience: 'ALL' | 'OPT_IN_ONLY' | string // string = specific major
) {
  if (!resend) {
    return { sent: 0, failed: 0, reason: 'Resend not configured' };
  }

  const adminSupabase = createServiceRoleClient();

  let query = adminSupabase
    .from('profiles')
    .select('id, email, name, email_preferences, major');

  if (targetAudience !== 'ALL') {
    // For OPT_IN_ONLY or specific major, we'll filter in JS since
    // email_preferences is a JSONB field
  }

  if (targetAudience !== 'ALL' && targetAudience !== 'OPT_IN_ONLY') {
    // Specific major filter
    query = query.ilike('major', `%${targetAudience}%`);
  }

  const { data: users, error } = await query;

  if (error || !users) {
    console.error('Failed to fetch users for broadcast:', error);
    return { sent: 0, failed: 0 };
  }

  // Filter opted-in users (unless sending to ALL)
  const filteredUsers = targetAudience === 'ALL'
    ? users
    : users.filter((u) => {
        const prefs = u.email_preferences as EmailPreferences | null;
        return prefs?.newOpportunities !== false;
      });

  const results = await Promise.allSettled(
    filteredUsers.map((user) =>
      resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject,
        react: ManualBroadcastEmail({ subject, body }),
      })
    )
  );

  // Log all successfully sent emails
  const logs = filteredUsers.map((user) => ({
    user_id: user.id,
    type: 'MANUAL_BROADCAST' as const,
    subject,
  }));

  if (logs.length > 0) {
    await adminSupabase.from('email_logs').insert(logs);
  }

  return {
    sent: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
  };
}
