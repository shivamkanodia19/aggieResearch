/**
 * Use Groq to tag opportunities with technical_disciplines from a curated list.
 * Research can span multiple disciplines (e.g. Biomedical Engineering + Medicine).
 */

import { llmComplete } from "@/lib/llm";
import { TECHNICAL_DISCIPLINES } from "./disciplines";

export interface OpportunityRowForDisciplines {
  id: string;
  title: string;
  description: string | null;
  who_can_join: string[] | null;
}

const DISCIPLINES_LIST = TECHNICAL_DISCIPLINES.join(", ");

const PROMPT = `You are tagging research opportunities with technical disciplines for student filters.

Given the opportunity below, choose ALL disciplines that apply from this exact list (use these strings only). Research often spans multiple areas (e.g. biomedical engineering and medicine).
List: ${DISCIPLINES_LIST}

Rules:
- Pick 1–5 disciplines that best match the project. Prefer specific over broad when both apply (e.g. "Biomedical Engineering" over just "Engineering").
- Include every discipline that is clearly relevant; interdisciplinary work should have multiple tags.
- Return ONLY a JSON object with one key: "technical_disciplines" (array of strings from the list above). No other keys, no markdown.`;

export async function inferDisciplinesWithGroq(
  row: OpportunityRowForDisciplines
): Promise<string[]> {
  const allowed = new Set<string>(TECHNICAL_DISCIPLINES);
  const text = [
    row.title,
    row.description ?? "",
    row.who_can_join?.join(" ") ?? "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 2000);

  const content = await llmComplete({
    systemPrompt: PROMPT,
    userPrompt: text,
    jsonMode: true,
    temperature: 0.2,
    maxTokens: 300,
  });
  if (!content) return [];

  try {
    const parsed = JSON.parse(content) as { technical_disciplines?: unknown };
    const arr = parsed.technical_disciplines;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((v): v is string => typeof v === "string")
      .map((s) => s.trim())
      .filter((s) => allowed.has(s));
  } catch {
    return [];
  }
}
