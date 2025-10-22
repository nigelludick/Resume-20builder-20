/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export type ResumeTemplate = "modern" | "classic" | "minimal" | "elegant";

export interface ResumeFormData {
  name: string;
  title: string;
  email: string;
  phone: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
}

export interface ResumeExperienceItem {
  company?: string;
  role?: string;
  period?: string;
  details?: string;
}

export interface ResumeEducationItem {
  school: string;
}

export interface GeneratedResumeData {
  header?: { name: string; title: string; contact: string };
  summary?: string;
  experience?: ResumeExperienceItem[];
  education?: ResumeEducationItem[];
  skills?: string[] | string;
  raw?: string;
}

export interface GenerateResumePayload {
  persona: string;
  data: ResumeFormData;
  template: ResumeTemplate;
}

export interface GenerateResumeResponse {
  ok: boolean;
  openai?: GeneratedResumeData;
  error?: string;
}
