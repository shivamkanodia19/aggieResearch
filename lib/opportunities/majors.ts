/**
 * Curated list of majors for filter pills and enrichment.
 * Used so AI/keyword output stays consistent and filter labels are stable.
 */
export const MAJORS = [
  "Agriculture",
  "Biology",
  "Biomedical Sciences",
  "Chemistry",
  "Computer Science",
  "Economics",
  "Engineering",
  "Environmental Science",
  "Health Sciences",
  "Mathematics",
  "Neuroscience",
  "Physics",
  "Psychology",
  "Statistics",
  "Veterinary Medicine",
] as const;

export type Major = (typeof MAJORS)[number];

/**
 * Keyword/phrase -> major mapping for non-AI enrichment fallback.
 * Each entry: keywords (lowercase) that map to a major from MAJORS.
 * Opportunity title/description is lowercased and checked for these substrings.
 */
export const KEYWORD_MAJOR_MAPPING: { major: Major; keywords: string[] }[] = [
  { major: "Agriculture", keywords: ["agriculture", "crop", "sorghum", "plant", "soil", "livestock", "rural", "agri"] },
  { major: "Biology", keywords: ["biology", "biological", "genetics", "molecular", "ecology", "evolution", "organism"] },
  { major: "Biomedical Sciences", keywords: ["biomedical", "biomedicine", "clinical", "pathogen", "disease mechanism"] },
  { major: "Chemistry", keywords: ["chemistry", "chemical", "synthesis", "compound", "biochemistry", "organic chemistry"] },
  { major: "Computer Science", keywords: ["machine learning", "machine-learning", "software", "algorithm", "data science", "computing", "AI ", " artificial intelligence", "modeling", "computational"] },
  { major: "Economics", keywords: ["economics", "economic", "policy", "rural development"] },
  { major: "Engineering", keywords: ["engineering", "engineer", "mechanical", "electrical", "civil", "aerospace", "biomedical engineering"] },
  { major: "Environmental Science", keywords: ["environmental", "climate", "sustainability", "wildfire", "resilience", "conservation", "natural resource"] },
  { major: "Health Sciences", keywords: ["health", "pediatric", "cardiovascular", "clinical", "patient", "medical", "public health"] },
  { major: "Mathematics", keywords: ["mathematics", "math", "mathematical", "optimization", "statistical model"] },
  { major: "Neuroscience", keywords: ["neuroscience", "neural", "brain", "cognitive", "neuro"] },
  { major: "Physics", keywords: ["physics", "physical", "quantum", "optics", "matter"] },
  { major: "Psychology", keywords: ["psychology", "psychological", "behavior", "behavioral", "mental health", "cognition"] },
  { major: "Statistics", keywords: ["statistics", "statistical", "data analysis", "regression", "probability"] },
  { major: "Veterinary Medicine", keywords: ["veterinary", "animal health", "vet medicine"] },
];

/**
 * Infer relevant_majors from title, description, and optionally who_can_join using keyword matching.
 * Returns a list of major names that matched (from MAJORS).
 */
export function inferMajorsFromKeywords(
  title: string,
  description: string | null,
  whoCanJoin?: string[] | null
): string[] {
  const parts = [title, description, whoCanJoin?.join(" ")].filter(Boolean) as string[];
  const text = parts.join(" ").toLowerCase();
  const matched = new Set<string>();
  for (const { major, keywords } of KEYWORD_MAJOR_MAPPING) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.add(major);
    }
  }
  return Array.from(matched);
}
