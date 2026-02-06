import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") ?? undefined;
  const department = searchParams.get("department") ?? undefined;

  const supabase = await createClient();

  // Fetch distinct departments (self-sustaining: from actual data)
  const { data: deptRows } = await supabase
    .from("opportunities")
    .select("leader_department")
    .eq("status", "Recruiting")
    .not("leader_department", "is", null);

  const departments = Array.from(
    new Set(
      (deptRows ?? [])
        .map((r) => r.leader_department?.trim())
        .filter(Boolean)
    )
  ).sort();

  // Fetch opportunities with optional filters
  let query = supabase
    .from("opportunities")
    .select("*")
    .eq("status", "Recruiting")
    .order("created_at", { ascending: false });

  if (department && department !== "all") {
    if (department === "__other__") {
      query = query.is("leader_department", null);
    } else {
      query = query.eq("leader_department", department);
    }
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
    meta: { departments },
  });
}
