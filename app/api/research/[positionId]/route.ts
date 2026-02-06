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
