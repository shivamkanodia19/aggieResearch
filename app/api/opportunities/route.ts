import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") ?? undefined;
  const major = searchParams.get("major") ?? undefined;
  const discipline = searchParams.get("discipline") ?? undefined;

  const supabase = await createClient();

  // Fetch distinct majors from relevant_majors
  const { data: majorRows } = await supabase
    .from("opportunities")
    .select("relevant_majors")
    .eq("status", "Recruiting")
    .not("relevant_majors", "is", null);
  const majorsSet = new Set<string>();
  (majorRows ?? []).forEach((r) => {
    const arr = r.relevant_majors;
    if (Array.isArray(arr)) {
      arr.forEach((m) => {
        const s = typeof m === "string" ? m.trim() : String(m).trim();
        if (s) majorsSet.add(s);
      });
    }
  });
  const majors = Array.from(majorsSet).sort();

  // Fetch distinct technical_disciplines
  const { data: discRows } = await supabase
    .from("opportunities")
    .select("technical_disciplines")
    .eq("status", "Recruiting")
    .not("technical_disciplines", "is", null);
  const disciplinesSet = new Set<string>();
  (discRows ?? []).forEach((r) => {
    const arr = r.technical_disciplines;
    if (Array.isArray(arr)) {
      arr.forEach((d) => {
        const s = typeof d === "string" ? d.trim() : String(d).trim();
        if (s) disciplinesSet.add(s);
      });
    }
  });
  const disciplines = Array.from(disciplinesSet).sort();

  // Fetch opportunities with optional filters
  let query = supabase
    .from("opportunities")
    .select("*")
    .eq("status", "Recruiting")
    .order("created_at", { ascending: false });

  if (major && major !== "all") {
    query = query.contains("relevant_majors", [major]);
  }
  if (discipline && discipline !== "all") {
    query = query.contains("technical_disciplines", [discipline]);
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

  // Exclude system/navigation cards: Contacts, Events, Participate, About
  const excludedTitles = ["Contacts", "Events", "Participate", "About Aggie Collaborate"];
  const filteredData = (data ?? []).filter(
    (opp) => !excludedTitles.includes(opp.title)
  );

  return Response.json({
    data: filteredData,
    meta: { majors, disciplines },
  });
}
