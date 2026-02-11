import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWeekStart, getWeekEnd, computeWeekNumber } from "@/lib/utils/weekCalculations";

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

  // Verify position belongs to user and get start_date for week number calc
  const { data: position } = await supabase
    .from("research_positions")
    .select("id, start_date")
    .eq("id", params.positionId)
    .eq("user_id", user.id)
    .single();

  if (!position) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  const body = await req.json();

  // Determine weekStart for the upsert.
  // If the client sends `useExact: true` it means the value came straight from
  // an existing DB row (existingWeekStart) and must be used as-is so the
  // upsert's conflict key (position_id, week_start) matches the stored row.
  // Otherwise normalise to Sunday-at-midnight-UTC so new logs always get a
  // clean boundary.
  let weekStart: Date;
  let weekEnd: Date;

  if (body.weekStart && body.useExact) {
    // Existing DB value – use verbatim
    weekStart = new Date(body.weekStart);
    weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);
  } else {
    const weekStartDate = body.weekStart ? new Date(body.weekStart) : new Date();
    weekStart = getWeekStart(weekStartDate);
    weekEnd = getWeekEnd(weekStartDate);
  }

  const weekNumber = body.weekNumber ?? computeWeekNumber(weekStart, position.start_date);

  // Upsert log
  const { data: log, error } = await supabase
    .from("weekly_logs")
    .upsert(
      {
        position_id: params.positionId,
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
        week_number: weekNumber,
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

/**
 * DELETE /api/research/[positionId]/logs?logId=xxx
 * Delete a specific weekly log
 */
export async function DELETE(
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
  const logId = searchParams.get("logId");

  if (!logId) {
    return NextResponse.json({ error: "logId is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("weekly_logs")
    .delete()
    .eq("id", logId)
    .eq("position_id", params.positionId);

  if (error) {
    console.error("[research] Delete log error:", error);
    return NextResponse.json({ error: "Failed to delete log" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
