import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") ?? "/opportunities";

  if (!code) {
    console.error("[auth/callback] No code in callback URL");
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] Error exchanging code:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Check if user has completed onboarding
  const user = data.session?.user;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .single();

    // Profile is auto-created by the DB trigger, but onboarding may not be done
    if (!profile?.onboarding_complete) {
      return NextResponse.redirect(`${origin}/opportunities`);
    }
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
