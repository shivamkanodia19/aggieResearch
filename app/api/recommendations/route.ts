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
      .select("id, title, opportunity_summary")
      .eq("status", "Recruiting")
      .not("opportunity_summary", "is", null);

    if (error) {
      console.error("Recommendations fetch error:", error);
      return NextResponse.json(
        { error: "Failed to load opportunities" },
        { status: 500 }
      );
    }

    const opportunities: (OpportunitySummary & { id: string })[] = (
      rows ?? []
    )
      .filter((r) => r.opportunity_summary && typeof r.opportunity_summary === "object")
      .map((r) => ({
        id: r.id,
        ...(r.opportunity_summary as OpportunitySummary),
      }));

    if (opportunities.length === 0) {
      return NextResponse.json({
        matches: [],
        message:
          "No summarized opportunities yet. Summaries are added during sync when GROQ_API_KEY is set.",
      });
    }

    const n = Math.min(Math.max(1, Number(topN) || 10), 20);
    const matches = await findTopMatches(profile, opportunities, n);
    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Matching error:", error);
    return NextResponse.json(
      { error: "Failed to find matches" },
      { status: 500 }
    );
  }
}
