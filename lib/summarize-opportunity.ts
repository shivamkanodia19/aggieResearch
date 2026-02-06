import { getGroq, GROQ_MODEL } from "./groq";

export interface OpportunitySummary {
  title: string;
  oneLiner: string;
  researchArea: string;
  skills: string[];
  timeCommitment: string;
  compensation: string;
  requirements: string[];
  idealFor: string[];
  applicationTip: string;
}

const SUMMARIZE_PROMPT = `You are summarizing Aggie Collaborate research postings for undergraduate students. Be concise; students scan quickly.

Given a research posting, extract the following in JSON format:
- title: The project title (keep original)
- oneLiner: ONE short sentence (max 20 words) explaining what this research is about in plain English. No jargon. Example: "Study how plants respond to drought using genetics and field experiments."
- researchArea: Broad field (e.g., "Machine Learning", "Public Health", "Agricultural Science")
- skills: Array of 3–6 specific skills mentioned or implied (languages, lab techniques, tools)
- timeCommitment: Hours per week if mentioned, else "Not specified"
- compensation: Pay, credit, or "Unpaid" / "Not specified"
- requirements: Array of key prerequisites (GPA, courses, year)—max 4 items
- idealFor: Array of 2–3 short phrases for who fits (e.g., "sophomores interested in biology")
- applicationTip: One short sentence of advice for applying to this position

Keep oneLiner, applicationTip, and array items brief. Return ONLY valid JSON, no markdown.`;

export async function summarizeOpportunity(rawPosting: string): Promise<OpportunitySummary> {
  const response = await getGroq().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SUMMARIZE_PROMPT },
      { role: "user", content: rawPosting },
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Groq");

  const parsed = JSON.parse(content) as OpportunitySummary;
  return {
    title: parsed.title ?? "",
    oneLiner: parsed.oneLiner ?? "",
    researchArea: parsed.researchArea ?? "",
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    timeCommitment: parsed.timeCommitment ?? "Not specified",
    compensation: parsed.compensation ?? "Not specified",
    requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
    idealFor: Array.isArray(parsed.idealFor) ? parsed.idealFor : [],
    applicationTip: parsed.applicationTip ?? "",
  };
}
