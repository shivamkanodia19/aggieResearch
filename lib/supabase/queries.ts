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

  if (error) return { data: null, error, didEnablePipeline: false };

  // Progressive disclosure: flip the flag the first time a user saves an opportunity.
  // The extra `.eq("has_used_pipeline", false)` lets us detect "first time" without a second read.
  const { data: updatedProfile, error: profileError } = await supabase
    .from("profiles")
    .update({ has_used_pipeline: true, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .eq("has_used_pipeline", false)
    .select("has_used_pipeline")
    .maybeSingle();

  const didEnablePipeline = Boolean(updatedProfile?.has_used_pipeline) && !profileError;

  return { data, error: null, didEnablePipeline };
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
