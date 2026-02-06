import { NextRequest, NextResponse } from "next/server";
import { findTopMatches } from "@/lib/match-opportunities";
import type { OpportunitySummary } from "@/lib/summarize-opportunity";
import type { StudentProfile } from "@/lib/resume-parser";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, topN = 10 } = body as {
      profile?: StudentProfile;
      topN?: number;
    };

    if (!profile || typeof profile !== "object") {
      return NextResponse.json(
        { error: "Missing profile" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from("opportunities")
      .select("id, title, description, who_can_join, opportunity_summary")
      .eq("status", "Recruiting")
      .order("created_at", { ascending: false })
      .limit(80);

    if (error) {
      console.error("Recommendations fetch error:", error);
      return NextResponse.json(
        { error: "Failed to load opportunities" },
        { status: 500 }
      );
    }

    // Prefer summarized opportunities; fall back to raw title+description so resume advice always works
    const opportunities: (OpportunitySummary & { id: string })[] = [];
    const rawFallbacks: { id: string; title: string; rawPosting: string }[] = [];

    for (const r of rows ?? []) {
      const summary = r.opportunity_summary;
      if (summary && typeof summary === "object" && "researchArea" in summary) {
        opportunities.push({
          id: r.id,
          ...(summary as OpportunitySummary),
        });
      } else {
        const rawPosting = [r.title, r.description, r.who_can_join?.join?.(". ")]
          .filter(Boolean)
          .join("\n\n");
        if (rawPosting.trim()) {
          rawFallbacks.push({ id: r.id, title: r.title ?? "", rawPosting: rawPosting.slice(0, 4000) });
        }
      }
    }

    const n = Math.min(Math.max(1, Number(topN) || 10), 20);
    const matches = await findTopMatches(profile, opportunities, rawFallbacks, n);
    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Matching error:", error);
    return NextResponse.json(
      { error: "Failed to find matches" },
      { status: 500 }
    );
  }
}
