import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * DELETE /api/user/delete-pipeline
 * Delete all applications (pipeline data) for the current user.
 */
export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error("[user/delete-pipeline] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete pipeline data" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
