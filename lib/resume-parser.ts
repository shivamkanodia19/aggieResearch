import groq, { GROQ_MODEL } from "./groq";

export interface StudentProfile {
  name: string;
  major: string;
  minor?: string | null;
  graduationYear: string;
  gpa?: string | null;
  technicalSkills: string[];
  softSkills: string[];
  researchInterests: string[];
  relevantCoursework: string[];
  experiences: {
    title: string;
    type: "research" | "work" | "project" | "volunteer";
    description: string;
    skills: string[];
  }[];
  careerGoals?: string | null;
}

const RESUME_PARSE_PROMPT = `You are analyzing a student's resume to help match them with undergraduate research opportunities.

Extract the following information in JSON format:
- name: Student's name
- major: Primary major
- minor: Minor if listed (null if none)
- graduationYear: Expected graduation year
- gpa: GPA if listed (null if not)
- technicalSkills: Array of technical skills (programming languages, tools, lab techniques, software)
- softSkills: Array of soft skills (leadership, communication, etc.)
- researchInterests: Array of research areas they seem interested in (infer from coursework, projects, stated interests)
- relevantCoursework: Array of courses that might be relevant to research
- experiences: Array of experiences, each with:
  - title: Position/project title
  - type: "research" | "work" | "project" | "volunteer"
  - description: 1-sentence summary
  - skills: Skills demonstrated
- careerGoals: Career direction if evident (null if unclear)

Be thorough but concise. Focus on what would be relevant for research matching.

Return ONLY valid JSON.`;

export async function parseResume(resumeText: string): Promise<StudentProfile> {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: RESUME_PARSE_PROMPT },
      { role: "user", content: resumeText },
    ],
    temperature: 0.2,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Groq");

  const parsed = JSON.parse(content) as StudentProfile;
  return {
    name: parsed.name ?? "",
    major: parsed.major ?? "",
    minor: parsed.minor ?? null,
    graduationYear: parsed.graduationYear ?? "",
    gpa: parsed.gpa ?? null,
    technicalSkills: Array.isArray(parsed.technicalSkills) ? parsed.technicalSkills : [],
    softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills : [],
    researchInterests: Array.isArray(parsed.researchInterests) ? parsed.researchInterests : [],
    relevantCoursework: Array.isArray(parsed.relevantCoursework) ? parsed.relevantCoursework : [],
    experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
    careerGoals: parsed.careerGoals ?? null,
  };
}
