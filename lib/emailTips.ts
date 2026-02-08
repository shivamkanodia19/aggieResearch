export interface EmailTip {
  title: string;
  description: string;
}

/** Tips for emailing contacts on Aggie Collaborate (active postings, labs actively hiring). */
export const AGGIE_COLLABORATE_TIPS: EmailTip[] = [
  {
    title: "Always attach your resume",
    description: "These labs are actively hiring and expect it",
  },
  {
    title: "Email within 2-3 days",
    description: "Popular opportunities fill fast, reach out quickly",
  },
  {
    title: "Reference the specific project",
    description: "Mention the exact research described in the posting by name",
  },
  {
    title: "Highlight relevant skills",
    description:
      "If they list requirements (e.g., 'Python,' 'lab experience'), explicitly state you have them",
  },
  {
    title: "Be clear about availability",
    description:
      "Mention when you can start and your time commitment (e.g., 'available 10 hrs/week starting next week')",
  },
];

/** General cold email tips (non-Aggie Collaborate, e.g. manual or department site). */
export const GENERAL_COLD_EMAIL_TIPS: EmailTip[] = [
  {
    title: "Keep it short",
    description: "3-4 sentences max, professors are busy",
  },
  {
    title: "Be specific",
    description: "Mention their recent work and why it interests you",
  },
  {
    title: "Show relevance",
    description: "Briefly mention one skill or experience that relates to their research",
  },
  {
    title: "Clear ask",
    description: "End with 'Would you have 15 minutes to discuss this opportunity?'",
  },
  {
    title: "Don't attach resume upfront",
    description: "Mention you have one available if they're interested",
  },
];
