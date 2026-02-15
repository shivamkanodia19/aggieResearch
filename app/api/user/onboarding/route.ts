import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { major, researchInterests, emailOptIn } = await req.json();

    const emailPreferences = {
      newOpportunities: emailOptIn !== false,
      followUpReminders: true,
      deadlineReminders: true,
      weeklyDigest: emailOptIn !== false,
      responseNotifications: true,
    };

    const { error } = await supabase
      .from("profiles")
      .update({
        major,
        interests: researchInterests || [],
        email_preferences: emailPreferences,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("[onboarding] Update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[onboarding] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("onboarding_complete, major, interests")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("[onboarding] Fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      onboardingComplete: data?.onboarding_complete ?? false,
      major: data?.major ?? null,
      researchInterests: data?.interests ?? [],
    });
  } catch (error) {
    console.error("[onboarding] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
