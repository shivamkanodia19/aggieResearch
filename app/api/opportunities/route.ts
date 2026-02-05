import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") ?? undefined;
  const field = searchParams.get("field") ?? undefined;

  const supabase = await createClient();
  let query = supabase
    .from("opportunities")
    .select("*")
    .eq("status", "Recruiting")
    .order("created_at", { ascending: false });

  if (field && field !== "all") {
    query = query.eq("research_field", field);
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
  return Response.json(data ?? []);
}
