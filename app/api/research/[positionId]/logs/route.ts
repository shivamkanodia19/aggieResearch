import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { startOfWeek } from "date-fns";

/**
 * GET /api/research/[positionId]/logs
 * Get logs for a position, optionally filtered by date range
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { positionId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify position belongs to user
  const { data: position } = await supabase
    .from("research_positions")
    .select("id")
    .eq("id", params.positionId)
    .eq("user_id", user.id)
    .single();

  if (!position) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let query = supabase
    .from("weekly_logs")
    .select("*")
    .eq("position_id", params.positionId)
    .order("week_start", { ascending: false });

  if (startDate && endDate) {
    query = query.gte("week_start", startDate).lte("week_start", endDate);
  }

  const { data: logs, error } = await query;

  if (error) {
    console.error("[research] Fetch logs error:", error);
    return NextResponse.json({ error: "Failed to load logs" }, { status: 500 });
  }

  return NextResponse.json(logs ?? []);
}

/**
 * POST /api/research/[positionId]/logs
 * Create or update a weekly log (upsert by week_start)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { positionId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify position belongs to user
  const { data: position } = await supabase
    .from("research_positions")
    .select("id")
    .eq("id", params.positionId)
    .eq("user_id", user.id)
    .single();

  if (!position) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  const body = await req.json();

  // Normalize weekStart to Monday
  const weekStartDate = body.weekStart
    ? new Date(body.weekStart)
    : new Date();
  const weekStart = startOfWeek(weekStartDate, { weekStartsOn: 1 });

  // Upsert log
  const { data: log, error } = await supabase
    .from("weekly_logs")
    .upsert(
      {
        position_id: params.positionId,
        week_start: weekStart.toISOString(),
        hours_worked: body.hoursWorked ? parseFloat(String(body.hoursWorked)) : null,
        accomplishments: body.accomplishments || [],
        learnings: body.learnings || [],
        blockers: body.blockers || [],
        next_week_plan: body.nextWeekPlan || [],
        meeting_notes: body.meetingNotes || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "position_id,week_start",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("[research] Upsert log error:", error);
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }

  return NextResponse.json(log);
}
