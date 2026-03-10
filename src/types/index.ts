// User roles
export type UserRole = "JOB_SEEKER" | "EMPLOYER" | "ADMIN" | "RECRUITER" | "CLIENT_USER" | "CANDIDATE";

export const USER_ROLES = {
  JOB_SEEKER: "JOB_SEEKER",
  EMPLOYER: "EMPLOYER",
  ADMIN: "ADMIN",
  RECRUITER: "RECRUITER",
  CLIENT_USER: "CLIENT_USER",
  CANDIDATE: "CANDIDATE",
} as const;

// Talent portal constants
export const SCREENING_STAGES = {
  PIPELINE: "PIPELINE",
  SHORTLISTED: "SHORTLISTED",
  REJECTED: "REJECTED",
  PUSHED_TO_CLIENT: "PUSHED_TO_CLIENT",
  CLIENT_APPROVED: "CLIENT_APPROVED",
  CLIENT_REJECTED: "CLIENT_REJECTED",
  SELECTED: "SELECTED",
} as const;

export const REQUISITION_STATUSES = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
  ON_HOLD: "ON_HOLD",
  CLOSED: "CLOSED",
  FILLED: "FILLED",
} as const;

export const INTERVIEW_STATUSES = {
  SLOTS_PROPOSED: "SLOTS_PROPOSED",
  SENT_TO_CANDIDATE: "SENT_TO_CANDIDATE",
  BOOKED: "BOOKED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
  PASSED: "PASSED",
  FAILED: "FAILED",
} as const;

export const WORK_MODELS = [
  { value: "ONSITE", label: "Onsite" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "REMOTE", label: "Remote" },
] as const;

export const REQUISITION_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
] as const;

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

// Job search filters
export interface JobFilters {
  keyword?: string;
  location?: string;
  industry?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "postedAt" | "salaryMax" | "views";
  sortOrder?: "asc" | "desc";
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Constants
export const INDUSTRIES = [
  "Information Technology",
  "Banking & Financial Services",
  "AI & Data Science",
  "Agriculture & Agritech",
  "Healthcare & Pharma",
  "Manufacturing",
  "Education",
  "E-commerce & Retail",
  "Consulting",
  "Telecom",
  "Media & Entertainment",
  "Real Estate",
  "Logistics & Supply Chain",
  "Energy & Utilities",
  "Government & PSU",
] as const;

export const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "FREELANCE", label: "Freelance" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "ENTRY", label: "Entry Level (0-1 yrs)" },
  { value: "JUNIOR", label: "Junior (1-3 yrs)" },
  { value: "MID", label: "Mid Level (3-5 yrs)" },
  { value: "SENIOR", label: "Senior (5-10 yrs)" },
  { value: "LEAD", label: "Lead (10-15 yrs)" },
  { value: "EXECUTIVE", label: "Executive (15+ yrs)" },
] as const;

export const LOCATIONS = [
  "New Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Noida",
  "Gurugram",
  "Remote",
] as const;
