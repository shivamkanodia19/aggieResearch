import { createClient } from "@/lib/supabase/client";
import type { Opportunity } from "@/lib/types/database";

export async function getOpportunities(filters?: {
  search?: string;
  field?: string;
  eligibility?: string;
}) {
  const supabase = createClient();
  let query = supabase
    .from("opportunities")
    .select("*")
    .eq("status", "Recruiting")
    .order("created_at", { ascending: false });

  if (filters?.field && filters.field !== "all") {
    query = query.eq("research_field", filters.field);
  }

  if (filters?.search?.trim()) {
    const term = filters.search.trim();
    query = query.or(
      `title.ilike.%${term}%,leader_name.ilike.%${term}%,description.ilike.%${term}%,ai_summary.ilike.%${term}%`
    );
  }

  const { data, error } = await query;
  return { data: (data ?? null) as Opportunity[] | null, error };
}

export async function trackOpportunity(userId: string, opportunityId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: userId,
      opportunity_id: opportunityId,
      stage: "Saved",
    })
    .select()
    .single();

  return { data, error };
}

export async function untrackOpportunity(userId: string, opportunityId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId);

  return { error };
}

export async function getUserApplicationIds(userId: string): Promise<Set<string>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("opportunity_id")
    .eq("user_id", userId);

  if (error) return new Set();
  return new Set((data ?? []).map((r) => r.opportunity_id));
}

export async function getUserApplications(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      opportunity:opportunities(*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
}
