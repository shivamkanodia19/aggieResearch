import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select("relevant_majors, who_can_join")
    .eq("status", "Recruiting");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = opportunities ?? [];

  const majorCounts: Record<string, number> = {};
  const eligibilityCounts: Record<string, number> = {};

  rows.forEach((row) => {
    (row.relevant_majors ?? []).forEach((m: unknown) => {
      const s = typeof m === "string" ? m.trim() : String(m).trim();
      if (s) majorCounts[s] = (majorCounts[s] ?? 0) + 1;
    });
    (row.who_can_join ?? []).forEach((e: unknown) => {
      const s = typeof e === "string" ? e.trim() : String(e).trim();
      if (s) eligibilityCounts[s] = (eligibilityCounts[s] ?? 0) + 1;
    });
  });

  const sortByCount = (obj: Record<string, number>) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

  return NextResponse.json({
    majors: sortByCount(majorCounts),
    eligibility: sortByCount(eligibilityCounts),
    total: rows.length,
  });
}
