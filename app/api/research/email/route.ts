import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmailTemplate } from "@/lib/email-templates";
import { generateProgressPDF } from "@/lib/pdf-generator";

/**
 * POST /api/research/email
 * Generate email template with PDF attachment for PI
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { positionId, startDate, endDate, emailType } = await req.json();

  if (!positionId || !startDate || !endDate || !emailType) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Get position with logs
  const { data: position, error: posError } = await supabase
    .from("research_positions")
    .select("*")
    .eq("id", positionId)
    .eq("user_id", user.id)
    .single();

  if (posError || !position) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  const { data: logs, error: logsError } = await supabase
    .from("weekly_logs")
    .select("*")
    .eq("position_id", positionId)
    .gte("week_start", startDate)
    .lte("week_start", endDate)
    .order("week_start", { ascending: true });

  if (logsError) {
    console.error("[research] Fetch logs error:", logsError);
    return NextResponse.json({ error: "Failed to load logs" }, { status: 500 });
  }

  // Get user info
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", user.id)
    .single();

  const studentName = profile?.name || "Student";

  // Generate email content
  const emailContent = generateEmailTemplate({
    type: emailType,
    position: {
      title: position.title,
      piName: position.pi_name,
    },
    logs: (logs ?? []).map((log) => ({
      weekStart: new Date(log.week_start),
      hoursWorked: log.hours_worked ? parseFloat(String(log.hours_worked)) : null,
      accomplishments: log.accomplishments || [],
      learnings: log.learnings || [],
      blockers: log.blockers || [],
      nextWeekPlan: log.next_week_plan || [],
    })),
    studentName,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  // Generate PDF attachment
  try {
    const pdfBuffer = await generateProgressPDF({
      position: {
        title: position.title,
        piName: position.pi_name,
        startDate: new Date(position.start_date),
      },
      logs: (logs ?? []).map((log) => ({
        weekStart: new Date(log.week_start),
        hoursWorked: log.hours_worked ? parseFloat(String(log.hours_worked)) : null,
        accomplishments: log.accomplishments || [],
        learnings: log.learnings || [],
        blockers: log.blockers || [],
        nextWeekPlan: log.next_week_plan || [],
        meetingNotes: log.meeting_notes || null,
      })),
      student: profile
        ? {
            name: profile.name,
            email: profile.email,
          }
        : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      includeDetails: true,
    });

    return NextResponse.json({
      to: position.pi_email,
      subject: emailContent.subject,
      body: emailContent.body,
      pdfBase64: pdfBuffer.toString("base64"),
      pdfFilename: `research-progress-${new Date().toISOString().split("T")[0]}.pdf`,
    });
  } catch (error) {
    console.error("[research] PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
