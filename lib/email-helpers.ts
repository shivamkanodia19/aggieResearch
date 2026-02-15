import { resend } from './resend';
import { createServiceRoleClient } from './supabase/server';
import { render } from '@react-email/render';
import NewOpportunityEmail from '@/emails/NewOpportunityEmail';
import ManualBroadcastEmail from '@/emails/ManualBroadcastEmail';
import { generateUnsubscribeToken, getUnsubscribeUrl } from './unsubscribe';
import type { EmailPreferences } from './types/database';

const FROM_EMAIL = 'Aggie Research Finder <noreply@aggieresearchfinder.com>';

/**
 * Send an email with unsubscribe headers and link.
 */
export async function sendEmailWithUnsubscribe(params: {
  to: string;
  subject: string;
  react: React.ReactElement;
  userId: string;
}) {
  if (!resend) return { data: null, error: 'Resend not configured' };

  const token = await generateUnsubscribeToken(params.userId);
  const unsubscribeUrl = getUnsubscribeUrl(token);
  const html = await render(params.react);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });
}

/**
 * Send new opportunity notification to a single user.
 * Only sends if master toggle + newOpportunities pref are on and opportunity matches.
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
    .select('id, email, name, major, interests, email_preferences, email_notifications_enabled')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return { sent: false, reason: 'User not found' };
  }

  // Check master toggle
  if (user.email_notifications_enabled === false) {
    return { sent: false, reason: 'User has email notifications disabled' };
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
    const token = await generateUnsubscribeToken(userId);
    const unsubscribeUrl = getUnsubscribeUrl(token);

    const html = await render(NewOpportunityEmail({
      userName: user.name || 'there',
      opportunity: {
        title: opportunity.title,
        department: opportunity.department || 'Not specified',
        piName: opportunity.piName || 'Not specified',
        description: opportunity.description || '',
      },
      unsubscribeUrl,
    }));

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `New Research Opportunity: ${opportunity.title}`,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
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
 * Respects master email toggle for all audiences.
 */
export async function sendManualBroadcast(
  subject: string,
  body: string,
  targetAudience: 'ALL' | 'OPT_IN_ONLY' | 'EMAIL_ENABLED' | 'ACTIVE_RESEARCH' | 'HAS_APPLICATIONS' | string,
  adminUserId?: string
) {
  if (!resend) {
    return { sent: 0, failed: 0, reason: 'Resend not configured' };
  }

  const adminSupabase = createServiceRoleClient();

  // Build base query - always filter by master toggle
  let query = adminSupabase
    .from('profiles')
    .select('id, email, name, email_preferences, major, email_notifications_enabled');

  // Specific major filter
  if (!['ALL', 'OPT_IN_ONLY', 'EMAIL_ENABLED', 'ACTIVE_RESEARCH', 'HAS_APPLICATIONS'].includes(targetAudience)) {
    query = query.ilike('major', `%${targetAudience}%`);
  }

  const { data: users, error } = await query;

  if (error || !users) {
    console.error('Failed to fetch users for broadcast:', error);
    return { sent: 0, failed: 0 };
  }

  // Filter by master toggle (all audiences respect it now)
  let filteredUsers = users.filter((u) => u.email_notifications_enabled !== false);

  // Additional filtering for specific audiences
  if (targetAudience === 'ACTIVE_RESEARCH') {
    const { data: activeUsers } = await adminSupabase
      .from('research_positions')
      .select('user_id')
      .eq('is_archived', false);
    const activeUserIds = new Set((activeUsers ?? []).map((r) => r.user_id));
    filteredUsers = filteredUsers.filter((u) => activeUserIds.has(u.id));
  } else if (targetAudience === 'HAS_APPLICATIONS') {
    const { data: appUsers } = await adminSupabase
      .from('applications')
      .select('user_id');
    const appUserIds = new Set((appUsers ?? []).map((a) => a.user_id));
    filteredUsers = filteredUsers.filter((u) => appUserIds.has(u.id));
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const user of filteredUsers) {
    try {
      const token = await generateUnsubscribeToken(user.id);
      const unsubscribeUrl = getUnsubscribeUrl(token);
      const html = await render(ManualBroadcastEmail({ subject, body, unsubscribeUrl }));
      const { data, error: sendError } = await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });

      if (sendError) {
        console.error(`[Broadcast] Failed to send to ${user.email}:`, sendError);
        errors.push(`${user.email}: ${sendError.message}`);
        failed++;
      } else {
        sent++;
        // Log successfully sent email
        await adminSupabase.from('email_logs').insert({
          user_id: user.id,
          type: 'MANUAL_BROADCAST' as const,
          subject,
        });
      }
    } catch (err) {
      console.error(`[Broadcast] Exception sending to ${user.email}:`, err);
      errors.push(`${user.email}: ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  // Track admin broadcast
  if (adminUserId) {
    await adminSupabase.from('admin_emails').insert({
      admin_user_id: adminUserId,
      subject,
      body,
      target_audience: targetAudience,
      recipients_count: sent,
    });
  }

  return { sent, failed, errors };
}
