import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/research/[positionId]
 * Get a single research position
 */
export async function GET(
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

  const { data: position, error } = await supabase
    .from("research_positions")
    .select("*")
    .eq("id", params.positionId)
    .eq("user_id", user.id)
    .single();

  if (error || !position) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  return NextResponse.json(position);
}

/**
 * DELETE /api/research/[positionId]
 * Permanently delete a research position and all its weekly logs (cascade)
 */
export async function DELETE(
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
    .select("id")
    .eq("id", params.positionId)
    .eq("user_id", user.id)
    .single();

  if (!position) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  // Delete position (cascade will delete all logs via FK constraint)
  const { error } = await supabase
    .from("research_positions")
    .delete()
    .eq("id", params.positionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[research] Delete position error:", error);
    return NextResponse.json({ error: "Failed to delete position" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
