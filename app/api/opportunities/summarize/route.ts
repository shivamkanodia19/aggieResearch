import { NextRequest, NextResponse } from "next/server";
import { summarizeOpportunity } from "@/lib/summarize-opportunity";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawPosting, opportunityId } = body as { rawPosting?: string; opportunityId?: string };

    if (!rawPosting || typeof rawPosting !== "string") {
      return NextResponse.json({ error: "Missing rawPosting" }, { status: 400 });
    }

    const summary = await summarizeOpportunity(rawPosting);

    if (opportunityId) {
      const supabase = createServiceRoleClient();
      const { error } = await supabase
        .from("opportunities")
        .update({
          opportunity_summary: summary,
          ai_summary: summary.oneLiner,
          skills_gained: summary.skills,
          time_commitment: summary.timeCommitment,
          research_field: summary.researchArea || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", opportunityId);
      if (error) {
        console.error("[summarize] DB update failed:", error);
        return NextResponse.json({ summary, error: "Saved summary but DB update failed" }, { status: 200 });
      }
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}
