/**
 * Enrich opportunities with relevant_majors (and optionally ai_summary).
 * - Keyword fallback: always runs, uses keyword→major mapping.
 * - AI enrichment: runs when OPENAI_API_KEY is set; uses LLM to infer majors (and summary).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { MAJORS, inferMajorsFromKeywords, type Major } from "./majors";

export interface OpportunityRow {
  id: string;
  title: string;
  description: string | null;
  who_can_join: string[] | null;
  relevant_majors: string[] | null;
  ai_summary: string | null;
}

/**
 * Update opportunity with keyword-inferred relevant_majors only.
 */
export async function enrichWithKeywords(
  supabase: SupabaseClient,
  row: OpportunityRow
): Promise<string[]> {
  const majors = inferMajorsFromKeywords(row.title, row.description, row.who_can_join);
  if (majors.length === 0) return [];

  const { error } = await supabase
    .from("opportunities")
    .update({
      relevant_majors: majors,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (error) {
    console.error(`[enrich] Keyword update failed for ${row.id}:`, error);
    return [];
  }
  return majors;
}

/**
 * Call OpenAI to infer relevant_majors (and optionally ai_summary). Uses MAJORS list in prompt.
 * Returns { relevant_majors, ai_summary } or null on error/missing key.
 */
export async function enrichWithAI(
  row: OpportunityRow
): Promise<{ relevant_majors: string[]; ai_summary: string | null } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const majorsList = MAJORS.join(", ");
  const prompt = `You are helping tag research opportunities for students. Given the following opportunity, return a JSON object with two keys:
- "relevant_majors": an array of 1-4 majors from this exact list (use these strings only): ${majorsList}
- "ai_summary": a single sentence (max 25 words) summarizing the opportunity for undergraduates.

Opportunity title: ${row.title}
${row.description ? `Description: ${row.description.slice(0, 1500)}` : ""}
${row.who_can_join?.length ? `Who can join: ${row.who_can_join.join(", ")}` : ""}

Return only valid JSON, no markdown or explanation.`;

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as {
      relevant_majors?: string[];
      ai_summary?: string | null;
    };
    const allowed = new Set(MAJORS);
    const relevant_majors = Array.isArray(parsed.relevant_majors)
      ? parsed.relevant_majors.filter((m) => typeof m === "string" && allowed.has(m as Major))
      : [];
    const ai_summary =
      typeof parsed.ai_summary === "string" && parsed.ai_summary.trim()
        ? parsed.ai_summary.trim()
        : null;
    return { relevant_majors, ai_summary };
  } catch (err) {
    console.error(`[enrich] OpenAI failed for ${row.id}:`, err);
    return null;
  }
}

/**
 * Enrich one opportunity: keyword fallback always; AI if OPENAI_API_KEY is set.
 * Updates the opportunity row in DB.
 */
export async function enrichOpportunity(
  supabase: SupabaseClient,
  row: OpportunityRow
): Promise<void> {
  const useAI = !!process.env.OPENAI_API_KEY;

  if (useAI) {
    const result = await enrichWithAI(row);
    if (result) {
      const { error } = await supabase
        .from("opportunities")
        .update({
          relevant_majors: result.relevant_majors,
          ai_summary: result.ai_summary ?? row.ai_summary,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (error) console.error(`[enrich] AI update failed for ${row.id}:`, error);
      return;
    }
  }

  await enrichWithKeywords(supabase, row);
}
