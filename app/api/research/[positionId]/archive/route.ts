import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/research/[positionId]/archive
 * Archive or unarchive a research position.
 * Body: { unarchive?: boolean }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { positionId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify position belongs to user
  const { data: position } = await supabase
    .from("research_positions")
    .select("id, is_archived")
    .eq("id", params.positionId)
    .eq("user_id", user.id)
    .single();

  if (!position) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const shouldUnarchive = body.unarchive === true;

  if (shouldUnarchive) {
    // Unarchive
    const { data: updated, error } = await supabase
      .from("research_positions")
      .update({
        is_archived: false,
        archived_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.positionId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[research] Unarchive error:", error);
      return NextResponse.json({ error: "Failed to unarchive" }, { status: 500 });
    }

    return NextResponse.json({ success: true, position: updated });
  } else {
    // Archive
    const { data: updated, error } = await supabase
      .from("research_positions")
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.positionId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[research] Archive error:", error);
      return NextResponse.json({ error: "Failed to archive" }, { status: 500 });
    }

    return NextResponse.json({ success: true, position: updated });
  }
}
