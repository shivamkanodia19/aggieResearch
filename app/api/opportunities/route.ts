import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EXCLUDED_TITLES = [
  "Contacts",
  "Events",
  "Participate",
  "About Aggie Collaborate",
];

function parseListParam(param: string | null | undefined): string[] {
  if (!param?.trim()) return [];
  return param
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") ?? undefined;
  const major = searchParams.get("major") ?? undefined;
  const discipline = searchParams.get("discipline") ?? undefined;
  const majorsParam = searchParams.get("majors") ?? undefined;
  const disciplinesParam = searchParams.get("disciplines") ?? undefined;
  const whoCanJoinParam = searchParams.get("whoCanJoin") ?? undefined;
  const timeCommitmentParam = searchParams.get("timeCommitment") ?? undefined;
  const sourceFromUrl = searchParams.getAll("source").filter(Boolean);

  const supabase = await createClient();

  const { data: allRows } = await supabase
    .from("opportunities")
    .select("relevant_majors, technical_disciplines, who_can_join, time_commitment, source")
    .eq("status", "Recruiting");

  const majorsSet = new Set<string>();
  const disciplinesSet = new Set<string>();
  const whoCanJoinSet = new Set<string>();
  const timeCommitmentsSet = new Set<string>();

  (allRows ?? []).forEach((r) => {
    (r.relevant_majors ?? []).forEach((m: unknown) => {
      const s = typeof m === "string" ? m.trim() : String(m).trim();
      if (s) majorsSet.add(s);
    });
    (r.technical_disciplines ?? []).forEach((d: unknown) => {
      const s = typeof d === "string" ? d.trim() : String(d).trim();
      if (s) disciplinesSet.add(s);
    });
    (r.who_can_join ?? []).forEach((w: unknown) => {
      const s = typeof w === "string" ? w.trim() : String(w).trim();
      if (s) whoCanJoinSet.add(s);
    });
    if (r.time_commitment?.trim()) {
      timeCommitmentsSet.add(String(r.time_commitment).trim());
    }
  });

  const majors = Array.from(majorsSet).sort();
  const disciplines = Array.from(disciplinesSet).sort();
  const whoCanJoin = Array.from(whoCanJoinSet).sort();
  const timeCommitments = Array.from(timeCommitmentsSet).sort();
  const sourceCounts: Record<string, number> = {};
  (allRows ?? []).forEach((r) => {
    const s = (r as { source?: string }).source ?? "aggie_collaborate";
    const key = String(s).trim() || "aggie_collaborate";
    sourceCounts[key] = (sourceCounts[key] ?? 0) + 1;
  });
  const sources = Array.from(new Set((allRows ?? []).map((r) => (r as { source?: string }).source ?? "aggie_collaborate"))).sort();

  // Build filter arrays: URL multi (major, eligibility) takes precedence, then legacy params
  const majorFromUrl = searchParams.getAll("major").filter(Boolean);
  const eligibilityFromUrl = searchParams.getAll("eligibility").filter(Boolean);

  const majorsFilter: string[] =
    majorFromUrl.length > 0
      ? majorFromUrl
      : majorsParam !== undefined
        ? parseListParam(majorsParam)
        : major && major !== "all"
          ? [major]
          : [];
  const disciplinesFilter: string[] =
    disciplinesParam !== undefined
      ? parseListParam(disciplinesParam)
      : discipline && discipline !== "all"
        ? [discipline]
        : [];
  const whoCanJoinFilter: string[] =
    eligibilityFromUrl.length > 0
      ? eligibilityFromUrl
      : parseListParam(whoCanJoinParam ?? null);
  const timeCommitmentsParam = searchParams.get("timeCommitments") ?? timeCommitmentParam ?? null;
  const timeCommitmentFilter = parseListParam(timeCommitmentsParam);

  let query = supabase
    .from("opportunities")
    .select("*")
    .eq("status", "Recruiting")
    .order("created_at", { ascending: false });

  if (majorsFilter.length > 0) {
    query = query.overlaps("relevant_majors", majorsFilter);
  }
  if (disciplinesFilter.length > 0) {
    query = query.overlaps("technical_disciplines", disciplinesFilter);
  }
  if (whoCanJoinFilter.length > 0) {
    query = query.overlaps("who_can_join", whoCanJoinFilter);
  }
  if (timeCommitmentFilter.length > 0) {
    query = query.in("time_commitment", timeCommitmentFilter);
  }
  if (sourceFromUrl.length > 0) {
    query = query.in("source", sourceFromUrl);
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

  const filteredData = (data ?? []).filter(
    (opp) => !EXCLUDED_TITLES.includes(opp.title)
  );

  return Response.json({
    data: filteredData,
    meta: { majors, disciplines, whoCanJoin, timeCommitments, sources, sourceCounts },
  });
}
