export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  major: string | null;
  classification: string | null;
  interests: string[] | null;
  /** Parsed resume data (JSON) for matching */
  profile_data: Record<string, unknown> | null;
  resume_file_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  leader_name: string | null;
  leader_email: string | null;
  leader_department: string | null;
  project_type: string | null;
  status: string;
  who_can_join: string[] | null;
  description: string | null;
  team_needs: string | null;
  special_opportunities: string | null;
  categories: string[] | null;
  source_url: string | null;
  /** AI-generated 1–2 sentence summary */
  ai_summary: string | null;
  /** Best-fit majors */
  relevant_majors: string[] | null;
  /** Groq-tagged technical disciplines (engineering subfields, medicine, animal science, etc.); can span multiple */
  technical_disciplines: string[] | null;
  /** Category: neuroscience, biology, cs, etc. */
  research_field: string | null;
  /** Skills/techniques student will learn */
  skills_gained: string[] | null;
  /** e.g. "10-15 hrs/week" */
  time_commitment: string | null;
  /** Full Groq-generated summary (JSON) for matching */
  opportunity_summary: Record<string, unknown> | null;
  last_synced: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationStage =
  | "Saved"
  | "First Email"
  | "Responded"
  | "Interview"
  | "Accepted"
  | "Rejected"
  | "Withdrawn";

export type Priority = "High" | "Medium" | "Low";

export interface Application {
  id: string;
  user_id: string;
  opportunity_id: string;
  stage: ApplicationStage;
  priority: Priority;
  notes: string | null;
  first_contact_date: string | null;
  last_activity_date: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchPosition {
  id: string;
  user_id: string;
  opportunity_id: string;
  title: string;
  pi_name: string;
  pi_email: string | null;
  start_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklyLog {
  id: string;
  position_id: string;
  week_start: string;
  hours_worked: number | null;
  accomplishments: string[];
  learnings: string[];
  blockers: string[];
  next_week_plan: string[];
  meeting_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  stage: string | null;
  notes: string | null;
  created_at: string;
}

export interface ApplicationWithOpportunity extends Application {
  opportunity: Opportunity | null;
}
