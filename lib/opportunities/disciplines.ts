/**
 * Curated technical disciplines for filter pills and Groq tagging.
 * Research can span multiple disciplines (e.g. biomedical engineering + medicine).
 * Used so LLM output stays consistent and filter labels are stable.
 */
export const TECHNICAL_DISCIPLINES = [
  "Aerospace Engineering",
  "Agriculture",
  "Animal Science",
  "Behavioral Science",
  "Biomedical Engineering",
  "Biology",
  "Chemical Engineering",
  "Chemistry",
  "Civil Engineering",
  "Computer Science",
  "Economics",
  "Electrical Engineering",
  "Environmental Science",
  "Health Sciences",
  "Mathematics",
  "Mechanical Engineering",
  "Medicine",
  "Neuroscience",
  "Physics",
  "Psychology",
  "Statistics",
  "Veterinary Science",
] as const;

export type TechnicalDiscipline = (typeof TECHNICAL_DISCIPLINES)[number];
