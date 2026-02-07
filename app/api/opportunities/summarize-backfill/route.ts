import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { hasAnyLLMKey } from "@/lib/llm";
import { summarizeNewOpportunities } from "@/lib/batch-summarize";

function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const headerSecret = request.headers.get("x-cron-secret");
  const url = request.nextUrl ?? new URL(request.url);
  const querySecret = url.searchParams.get("secret") ?? url.searchParams.get("cron_secret");
  return bearer === secret || headerSecret === secret || querySecret === secret;
}

/**
 * POST /api/opportunities/summarize-backfill
 * Runs Groq summarization for all Recruiting opportunities that don't have a summary yet.
 * Requires GROQ_API_KEY. Auth: CRON_SECRET (Bearer/header/query) or logged-in user.
 */
export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error: "GROQ_API_KEY is not set. Add it in Vercel (Settings → Environment Variables) or in .env.local for local runs.",
      },
      { status: 400 }
    );
  }

  const cronAuth = isCronAuthorized(request);
  if (!cronAuth) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = createServiceRoleClient();
    const { summarized, failed } = await summarizeNewOpportunities(supabase);
    return NextResponse.json({
      summarized,
      failed,
      message: summarized > 0
        ? `Summarized ${summarized} opportunities. Refresh the Opportunities page to see AI summaries.`
        : failed > 0
          ? `No new summaries; ${failed} failed. Check server logs.`
          : "No opportunities needed summarization (all Recruiting posts already have summaries or no description).",
    });
  } catch (error) {
    console.error("[summarize-backfill] Error:", error);
    return NextResponse.json(
      { error: "Failed to run summarization. Check server logs." },
      { status: 500 }
    );
  }
}
