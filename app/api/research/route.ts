import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ResearchPosition } from "@/lib/types/database";

const RESEARCH_SETUP_MESSAGE =
  "Research tracking is not set up yet. Please ask your administrator to run the latest database migrations.";

function isMissingTableError(err: { message?: string; code?: string }): boolean {
  const msg = (err.message ?? "").toLowerCase();
  return msg.includes("schema cache") || msg.includes("research_positions") || err.code === "42P01";
}

/**
 * GET /api/research
 * Get all research positions for current user with stats
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get positions with logs count
  const { data: positions, error: posError } = await supabase
    .from("research_positions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (posError) {
    console.error("[research] Fetch positions error:", posError);
    const message = isMissingTableError(posError) ? RESEARCH_SETUP_MESSAGE : "Failed to load positions";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Get logs for each position (last 4 weeks for preview)
  const positionsWithStats = await Promise.all(
    (positions ?? []).map(async (pos) => {
      const { data: logs } = await supabase
        .from("weekly_logs")
        .select("*")
        .eq("position_id", pos.id)
        .order("week_start", { ascending: false })
        .limit(4);

      const { count: totalLogs } = await supabase
        .from("weekly_logs")
        .select("*", { count: "exact", head: true })
        .eq("position_id", pos.id);

      const totalHours = (logs ?? []).reduce(
        (sum, log) => sum + (log.hours_worked ? parseFloat(String(log.hours_worked)) : 0),
        0
      );
      const totalWeeks = totalLogs ?? 0;
      const avgHoursPerWeek = totalWeeks > 0 ? (totalHours / totalWeeks).toFixed(1) : "0";

      return {
        ...pos,
        stats: {
          totalHours: Math.round(totalHours * 10) / 10,
          totalWeeks,
          avgHoursPerWeek,
        },
        logs: logs ?? [],
      };
    })
  );

  return NextResponse.json(positionsWithStats);
}

/**
 * POST /api/research
 * Create a new research position from an accepted opportunity
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { opportunityId } = await req.json();

  if (!opportunityId) {
    return NextResponse.json({ error: "Missing opportunityId" }, { status: 400 });
  }

  // Get opportunity details
  const { data: opportunity, error: oppError } = await supabase
    .from("opportunities")
    .select("id, title, leader_name, leader_email")
    .eq("id", opportunityId)
    .single();

  if (oppError || !opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  // Check if position already exists
  const { data: existing, error: existingError } = await supabase
    .from("research_positions")
    .select("id")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .maybeSingle();

  if (existingError && isMissingTableError(existingError)) {
    return NextResponse.json({ error: RESEARCH_SETUP_MESSAGE }, { status: 503 });
  }
  if (existing) {
    return NextResponse.json({ error: "Position already exists" }, { status: 409 });
  }

  // Create research position (use snake_case for DB columns)
  const insertRow = {
    user_id: user.id,
    opportunity_id: opportunityId,
    title: opportunity.title ?? "Research Position",
    pi_name: opportunity.leader_name ?? "Unknown",
    pi_email: opportunity.leader_email ?? null,
    start_date: new Date().toISOString(),
    is_active: true,
  };

  const { data: position, error: createError } = await supabase
    .from("research_positions")
    .insert(insertRow)
    .select()
    .single();

  if (createError) {
    console.error("[research] Create position error:", createError);
    const message = isMissingTableError(createError)
      ? RESEARCH_SETUP_MESSAGE
      : createError.code === "23503"
        ? "Opportunity or profile not found."
        : createError.code === "23505"
          ? "Position already exists."
          : createError.message ?? "Failed to create position";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json(position);
}
