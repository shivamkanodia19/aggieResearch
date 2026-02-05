import { syncOpportunitiesToDatabase } from "@/lib/scraper/syncAggieCollaborate";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

async function handleSync(request: NextRequest) {
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
    const result = await syncOpportunitiesToDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync opportunities" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleSync(request);
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}
