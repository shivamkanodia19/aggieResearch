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
