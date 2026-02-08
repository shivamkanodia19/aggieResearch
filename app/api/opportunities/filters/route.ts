import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select("relevant_majors, who_can_join, source")
    .eq("status", "Recruiting");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = opportunities ?? [];

  const majorCounts: Record<string, number> = {};
  const eligibilityCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};

  rows.forEach((row) => {
    (row.relevant_majors ?? []).forEach((m: unknown) => {
      const s = typeof m === "string" ? m.trim() : String(m).trim();
      if (s) majorCounts[s] = (majorCounts[s] ?? 0) + 1;
    });
    (row.who_can_join ?? []).forEach((e: unknown) => {
      const s = typeof e === "string" ? e.trim() : String(e).trim();
      if (s) eligibilityCounts[s] = (eligibilityCounts[s] ?? 0) + 1;
    });
    const src = (row as { source?: string }).source ?? "aggie_collaborate";
    const key = String(src).trim() || "aggie_collaborate";
    sourceCounts[key] = (sourceCounts[key] ?? 0) + 1;
  });

  const sortByCount = (obj: Record<string, number>) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

  const sourceLabels: Record<string, string> = {
    aggie_collaborate: "Aggie Collaborate",
    manual: "Manually Added",
    department_website: "Department Website",
  };
  const sourceOptions = ["aggie_collaborate", "manual", "department_website"]
    .filter((s) => (sourceCounts[s] ?? 0) > 0)
    .map((name) => ({ name, label: sourceLabels[name] ?? name, count: sourceCounts[name] ?? 0 }));

  return NextResponse.json({
    majors: sortByCount(majorCounts),
    eligibility: sortByCount(eligibilityCounts),
    sources: sourceOptions,
    total: rows.length,
  });
}
