import { getGroq, GROQ_MODEL } from "./groq";
import type { StudentProfile } from "./resume-parser";
import type { OpportunitySummary } from "./summarize-opportunity";

export interface MatchResult {
  opportunityId: string;
  opportunityTitle: string;
  matchScore: number;
  matchReasons: string[];
  gapWarnings: string[];
  standoutTip: string;
}

const MATCH_PROMPT = `You are matching a student with research opportunities.

Given a student profile and a research opportunity, evaluate the fit.

Return JSON with:
- matchScore: 0-100 score (100 = perfect fit)
  - 80-100: Strong match - student has most requirements and clear interest
  - 60-79: Good match - student has relevant background, some gaps
  - 40-59: Moderate match - student could contribute but needs development
  - 0-39: Weak match - significant gaps or misalignment

- matchReasons: Array of 2-3 specific reasons this is a good fit (reference actual skills/experiences from resume)

- gapWarnings: Array of 0-2 things the student might be missing (be honest but not discouraging)

- standoutTip: One specific, actionable tip for how THIS student could make a strong application to THIS position (reference something specific from their background)

Be specific. Reference actual details from both the resume and the opportunity.

Return ONLY valid JSON.`;

export async function matchOpportunity(
  profile: StudentProfile,
  opportunity: OpportunitySummary & { id: string }
): Promise<MatchResult> {
  const response = await getGroq().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: MATCH_PROMPT },
      {
        role: "user",
        content: `STUDENT PROFILE:\n${JSON.stringify(profile, null, 2)}\n\nRESEARCH OPPORTUNITY:\n${JSON.stringify(opportunity, null, 2)}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Groq");

  const result = JSON.parse(content) as {
    matchScore?: number;
    matchReasons?: string[];
    gapWarnings?: string[];
    standoutTip?: string;
  };

  return {
    opportunityId: opportunity.id,
    opportunityTitle: opportunity.title,
    matchScore: typeof result.matchScore === "number" ? Math.min(100, Math.max(0, result.matchScore)) : 50,
    matchReasons: Array.isArray(result.matchReasons) ? result.matchReasons : [],
    gapWarnings: Array.isArray(result.gapWarnings) ? result.gapWarnings : [],
    standoutTip: typeof result.standoutTip === "string" ? result.standoutTip : "",
  };
}

export async function findTopMatches(
  profile: StudentProfile,
  opportunities: (OpportunitySummary & { id: string })[],
  topN: number = 10
): Promise<MatchResult[]> {
  if (opportunities.length === 0) return [];

  const skillLower = (arr: string[]) => arr.map((s) => s.toLowerCase());
  const profileSkills = skillLower(profile.technicalSkills);
  const profileInterests = skillLower(profile.researchInterests);

  const candidates = opportunities.filter((opp) => {
    const skillOverlap = opp.skills.some((skill) =>
      profileSkills.some(
        (s) => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s)
      )
    );
    const interestOverlap = profileInterests.some((interest) =>
      opp.researchArea.toLowerCase().includes(interest) ||
      interest.includes(opp.researchArea.toLowerCase())
    );
    return skillOverlap || interestOverlap;
  });

  const toEvaluate =
    candidates.length >= topN ? candidates : opportunities;
  const slice = toEvaluate.slice(0, 30);

  const results = await Promise.all(
    slice.map((opp) => matchOpportunity(profile, opp))
  );

  return results
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, topN);
}
