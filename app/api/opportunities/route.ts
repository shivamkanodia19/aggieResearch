import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") ?? undefined;
  const major = searchParams.get("major") ?? undefined;

  const supabase = await createClient();

  // Fetch distinct majors from relevant_majors (self-sustaining: from actual data)
  const { data: rows } = await supabase
    .from("opportunities")
    .select("relevant_majors")
    .eq("status", "Recruiting")
    .not("relevant_majors", "is", null);

  const majorsSet = new Set<string>();
  (rows ?? []).forEach((r) => {
    const arr = r.relevant_majors;
    if (Array.isArray(arr)) {
      arr.forEach((m) => {
        const s = typeof m === "string" ? m.trim() : String(m).trim();
        if (s) majorsSet.add(s);
      });
    }
  });
  const majors = Array.from(majorsSet).sort();

  // Fetch opportunities with optional filters
  let query = supabase
    .from("opportunities")
    .select("*")
    .eq("status", "Recruiting")
    .order("created_at", { ascending: false });

  if (major && major !== "all") {
    query = query.contains("relevant_majors", [major]);
  }

  if (search?.trim()) {
    const term = search.trim();
    query = query.or(
      `title.ilike.%${term}%,leader_name.ilike.%${term}%,description.ilike.%${term}%,ai_summary.ilike.%${term}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    data: data ?? [],
    meta: { majors },
  });
}
