/**
 * Email Templates for Research Progress Updates
 */

import { format } from "date-fns";

interface EmailTemplateInput {
  type: "weekly_update" | "monthly_summary" | "meeting_prep";
  position: {
    title: string;
    piName: string;
  };
  logs: {
    weekStart: Date;
    hoursWorked: number | null;
    accomplishments: string[];
    learnings: string[];
    blockers: string[];
    nextWeekPlan: string[];
  }[];
  studentName: string;
  startDate: Date;
  endDate: Date;
}

interface EmailOutput {
  subject: string;
  body: string;
}

export function generateEmailTemplate(
  input: EmailTemplateInput
): EmailOutput {
  const { type, position, logs, studentName, startDate, endDate } = input;

  const totalHours = logs.reduce(
    (sum, log) => sum + (log.hoursWorked || 0),
    0
  );
  const allAccomplishments = logs.flatMap((log) => log.accomplishments);
  const currentBlockers = logs[logs.length - 1]?.blockers || [];
  const nextSteps = logs[logs.length - 1]?.nextWeekPlan || [];

  const firstName = position.piName.split(" ")[0];
  const dateRange = `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;

  switch (type) {
    case "weekly_update":
      return {
        subject: `Weekly Research Update - ${format(endDate, "MMM d")}`,
        body: `Hi Dr. ${firstName},

I wanted to share a quick update on my progress this week.

**Hours:** ${logs[0]?.hoursWorked || 0} hours

**What I accomplished:**
${allAccomplishments.map((a) => `• ${a}`).join("\n")}

${
  currentBlockers.length > 0
    ? `**Questions/Blockers:**\n${currentBlockers.map((b) => `• ${b}`).join("\n")}\n\n`
    : ""
}**Plan for next week:**
${nextSteps.map((s) => `• ${s}`).join("\n")}

Please let me know if you'd like to discuss anything or if you have feedback on my direction.

Best,
${studentName}`,
      };

    case "monthly_summary":
      return {
        subject: `Monthly Research Summary - ${format(endDate, "MMMM yyyy")}`,
        body: `Hi Dr. ${firstName},

Here's a summary of my research progress for ${format(startDate, "MMMM yyyy")}.

**Overview:**
• Total hours: ${totalHours}
• Weeks logged: ${logs.length}

**Key Accomplishments:**
${allAccomplishments.map((a) => `• ${a}`).join("\n")}

${
  currentBlockers.length > 0
    ? `**Current Blockers:**\n${currentBlockers.map((b) => `• ${b}`).join("\n")}\n\n`
    : ""
}**Next Steps:**
${nextSteps.map((s) => `• ${s}`).join("\n")}

I've attached a detailed progress report. Please let me know if you have any questions or feedback.

Best,
${studentName}`,
      };

    case "meeting_prep":
      return {
        subject: `Meeting Prep - Research Update (${dateRange})`,
        body: `Hi Dr. ${firstName},

Ahead of our meeting, here's a summary of my recent progress (${dateRange}).

**Hours logged:** ${totalHours}

**Accomplishments:**
${allAccomplishments.slice(0, 5).map((a) => `• ${a}`).join("\n")}

**Items to discuss:**
${currentBlockers.map((b) => `• ${b}`).join("\n")}${
          nextSteps.length > 0
            ? `\n\n**Proposed next steps:**\n${nextSteps.map((s) => `• ${s}`).join("\n")}`
            : ""
        }

I've attached a detailed breakdown. Looking forward to our meeting.

Best,
${studentName}`,
      };

    default:
      return {
        subject: `Research Update - ${dateRange}`,
        body: `Progress report attached.`,
      };
  }
}
