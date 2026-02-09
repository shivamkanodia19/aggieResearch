import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/user/export-data
 * Export current user's profile, applications, and related data as JSON.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profileRes, applicationsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("applications")
      .select("*, opportunity:opportunities(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const applications = applicationsRes.data ?? [];

  // Optional: include research positions and logs if tables exist
  let researchPositions: unknown[] = [];
  let weeklyLogs: unknown[] = [];
  try {
    const { data: positions } = await supabase
      .from("research_positions")
      .select("*")
      .eq("user_id", user.id);
    researchPositions = positions ?? [];
    if (researchPositions.length > 0) {
      const positionIds = (researchPositions as { id: string }[]).map((p) => p.id);
      const { data: logs } = await supabase
        .from("weekly_logs")
        .select("*")
        .in("position_id", positionIds);
      weeklyLogs = logs ?? [];
    }
  } catch {
    // Tables may not exist
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    userId: user.id,
    profile: profile ?? null,
    applications,
    researchPositions,
    weeklyLogs,
  };

  const filename = `tamu-research-tracker-data-${new Date().toISOString().split("T")[0]}.json`;
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
