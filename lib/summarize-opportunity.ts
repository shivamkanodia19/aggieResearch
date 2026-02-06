import groq, { GROQ_MODEL } from "./groq";

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

const SUMMARIZE_PROMPT = `You are helping undergraduate students understand research opportunities.

Given a research posting, extract the following information in JSON format:
- title: The project title (keep original)
- oneLiner: A single sentence explaining what this research is about in plain English. Avoid jargon. A freshman should understand it.
- researchArea: The broad field (e.g., "Machine Learning", "Public Health", "Agricultural Science")
- skills: Array of specific skills mentioned or implied (programming languages, lab techniques, etc.)
- timeCommitment: Hours per week if mentioned, otherwise "Not specified"
- compensation: Pay rate, credit, or "Unpaid" / "Not specified"
- requirements: Array of prerequisites (GPA, courses, year standing, etc.)
- idealFor: Array describing what type of student would be a good fit
- applicationTip: One sentence of advice on what would make an applicant stand out for THIS specific position

Be concise. Students are scanning quickly.

Return ONLY valid JSON, no markdown formatting.`;

export async function summarizeOpportunity(rawPosting: string): Promise<OpportunitySummary> {
  const response = await groq.chat.completions.create({
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
