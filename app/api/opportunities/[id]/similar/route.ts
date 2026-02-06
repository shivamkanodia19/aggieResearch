import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const opportunityId = params.id;

    // Fetch the current opportunity
    const { data: opportunity, error: oppError } = await supabase
      .from("opportunities")
      .select("relevant_majors")
      .eq("id", opportunityId)
      .single();

    if (oppError || !opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    const majors = opportunity.relevant_majors ?? [];
    if (majors.length === 0) {
      return NextResponse.json([]);
    }

    // Find opportunities with overlapping majors, excluding current
    const { data: similar, error } = await supabase
      .from("opportunities")
      .select("id, title, leader_name, relevant_majors")
      .eq("status", "Recruiting")
      .neq("id", opportunityId)
      .overlaps("relevant_majors", majors)
      .limit(3)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[similar-opportunities] Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch similar opportunities" },
        { status: 500 }
      );
    }

    return NextResponse.json(similar ?? []);
  } catch (error) {
    console.error("[similar-opportunities] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
