import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/user/stats
 * Application statistics for the current user (saved, contacted, responded, pipeline breakdown).
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const { data: applications, error: listError } = await supabase
    .from("applications")
    .select("stage")
    .eq("user_id", userId);

  if (listError) {
    console.error("[user/stats] Error:", listError);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }

  const stages = (applications ?? []).map((a) => a.stage as string);
  const count = (s: string) => stages.filter((st) => st === s).length;

  const saved = count("Saved");
  const contacted = count("First Email");
  const responded = count("Responded");
  const interview = count("Interview");
  const accepted = count("Accepted");
  const rejected = count("Rejected");
  const withdrawn = count("Withdrawn");

  const totalSaved = stages.length;
  const totalContacted = totalSaved - saved; // any stage beyond Saved
  const totalResponded = responded + interview + accepted + rejected;

  const responseRate =
    totalContacted > 0 ? ((totalResponded / totalContacted) * 100).toFixed(1) : "0";

  return NextResponse.json({
    totalSaved,
    totalContacted,
    totalResponded,
    saved,
    contacted,
    responded,
    interview,
    accepted,
    rejected,
    withdrawn,
    responseRate: String(responseRate),
  });
}
