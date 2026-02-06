import type { SupabaseClient } from "@supabase/supabase-js";
import { summarizeOpportunity } from "./summarize-opportunity";

const BATCH_SIZE = 5;
const DELAY_MS = 1500;

export async function summarizeNewOpportunities(supabase: SupabaseClient): Promise<{ summarized: number; failed: number }> {
  const { data: rows } = await supabase
    .from("opportunities")
    .select("id, title, description")
    .eq("status", "Recruiting")
    .is("opportunity_summary", null)
    .not("description", "is", null)
    .limit(50);

  if (!rows?.length) return { summarized: 0, failed: 0 };

  let summarized = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (row) => {
        const rawPosting = [row.title, row.description].filter(Boolean).join("\n\n");
        if (!rawPosting) return;
        try {
          const summary = await summarizeOpportunity(rawPosting);
          const { error } = await supabase
            .from("opportunities")
            .update({
              opportunity_summary: summary,
              ai_summary: summary.oneLiner,
              skills_gained: summary.skills,
              time_commitment: summary.timeCommitment,
              research_field: summary.researchArea || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);
          if (error) throw error;
          summarized++;
        } catch (err) {
          console.error(`[batch-summarize] Failed ${row.id}:`, err);
          failed++;
        }
      })
    );
    if (i + BATCH_SIZE < rows.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  return { summarized, failed };
}
