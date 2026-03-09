import { UserRole } from "@prisma/client";

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
