import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { inferDisciplinesWithGroq } from "@/lib/opportunities/enrichDisciplines";

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
 * POST /api/opportunities/disciplines-backfill
 * Tags Recruiting opportunities without technical_disciplines using Groq.
 * Requires GROQ_API_KEY. Auth: CRON_SECRET or logged-in user.
 */
export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not set. Add it in Vercel or .env.local." },
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
    const { data: rows } = await supabase
      .from("opportunities")
      .select("id, title, description, who_can_join")
      .eq("status", "Recruiting")
      .or("technical_disciplines.is.null,technical_disciplines.eq.{}")
      .limit(100);

    let tagged = 0;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (const row of rows ?? []) {
      try {
        const disciplines = await inferDisciplinesWithGroq(row);
        if (disciplines.length > 0) {
          const { error } = await supabase
            .from("opportunities")
            .update({
              technical_disciplines: disciplines,
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);
          if (!error) tagged++;
        }
        await delay(400);
      } catch (e) {
        console.error(`[disciplines-backfill] ${row.id}:`, e);
      }
    }

    return NextResponse.json({
      tagged,
      total: rows?.length ?? 0,
      message:
        tagged > 0
          ? `Tagged ${tagged} opportunities with technical disciplines. Refresh the Opportunities page to use discipline filters.`
          : rows?.length === 0
            ? "No opportunities needed tagging (all have technical disciplines)."
            : "No new tags applied. Check server logs for errors.",
    });
  } catch (error) {
    console.error("[disciplines-backfill] Error:", error);
    return NextResponse.json(
      { error: "Failed to run discipline tagging. Check server logs." },
      { status: 500 }
    );
  }
}
