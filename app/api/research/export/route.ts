import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProgressPDF } from "@/lib/pdf-generator";

/**
 * POST /api/research/export
 * Generate PDF export for a position's logs
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { positionId, startDate, endDate, includeDetails } = await req.json();

  if (!positionId || !startDate || !endDate) {
    return NextResponse.json(
      { error: "Missing positionId, startDate, or endDate" },
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

  // Generate PDF
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
      includeDetails: includeDetails ?? true,
    });

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="research-progress-${position.title.slice(0, 30).replace(/[^a-z0-9]/gi, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[research] PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
