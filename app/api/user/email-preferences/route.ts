import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_EMAIL_PREFERENCES } from "@/lib/types/database";
import type { EmailPreferences } from "@/lib/types/database";

/**
 * GET /api/user/email-preferences
 * Get current user's email notification preferences.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("email_preferences")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[user/email-preferences] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }

  const prefs = (data?.email_preferences as EmailPreferences | null) ?? DEFAULT_EMAIL_PREFERENCES;
  return NextResponse.json({
    ...DEFAULT_EMAIL_PREFERENCES,
    ...prefs,
  });
}

/**
 * PUT /api/user/email-preferences
 * Update current user's email notification preferences.
 */
export async function PUT(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Partial<EmailPreferences>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const allowed: (keyof EmailPreferences)[] = [
    "newOpportunities",
    "followUpReminders",
    "deadlineReminders",
    "weeklyDigest",
    "responseNotifications",
  ];
  const updates: Partial<EmailPreferences> = {};
  for (const key of allowed) {
    if (typeof body[key] === "boolean") {
      updates[key] = body[key];
    }
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("email_preferences")
    .eq("id", user.id)
    .single();

  const current = (existing?.email_preferences as EmailPreferences | null) ?? DEFAULT_EMAIL_PREFERENCES;
  const email_preferences = { ...current, ...updates };

  const { error } = await supabase
    .from("profiles")
    .update({
      email_preferences,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[user/email-preferences] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }

  return NextResponse.json(email_preferences);
}
