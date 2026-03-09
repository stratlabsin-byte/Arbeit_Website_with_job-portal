"use client";

import Link from "next/link";
import {
  MapPin,
  Clock,
  IndianRupee,
  Bookmark,
  BookmarkCheck,
  Building2,
  BriefcaseBusiness,
} from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    slug: string;
    company: {
      name: string;
      logo?: string | null;
      slug: string;
    };
    location: string;
    jobType: string;
    experienceLevel: string;
    salaryMin?: string | null;
    salaryMax?: string | null;
    showSalary: boolean;
    isRemote: boolean;
    industry: string;
    skills?: string | null;
    postedAt?: string | null;
    featured?: boolean;
  };
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  compact?: boolean;
}

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  TEMPORARY: "Temporary",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
};

const expLevelLabels: Record<string, string> = {
  ENTRY: "Entry Level",
  JUNIOR: "Junior",
  MID: "Mid Level",
  SENIOR: "Senior",
  LEAD: "Lead",
  EXECUTIVE: "Executive",
};

function formatSalary(min?: string | null, max?: string | null): string {
  if (!min && !max) return "";
  const fmt = (v: string) => {
    const n = parseFloat(v);
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function JobCard({
  job,
  isSaved = false,
  onToggleSave,
  compact = false,
}: JobCardProps) {
  const skills = job.skills ? JSON.parse(job.skills) : [];

  return (
    <div
      className={`card p-5 md:p-6 relative group ${
        job.featured ? "border-l-4 border-l-primary-500" : ""
      }`}
    >
      {job.featured && (
        <span className="absolute top-3 right-3 badge-blue text-xs">
          Featured
        </span>
      )}

      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          {job.company.logo ? (
            <img
              src={job.company.logo}
              alt={job.company.name}
              className="w-10 h-10 object-contain rounded-lg"
            />
          ) : (
            <Building2 className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/jobs/${job.slug}`}
            className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
          >
            {job.title}
          </Link>
          <p className="text-sm text-gray-500 mt-0.5">{job.company.name}</p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
              {job.isRemote && (
                <span className="badge-green text-xs ml-1">Remote</span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <BriefcaseBusiness className="w-4 h-4" />
              {jobTypeLabels[job.jobType] || job.jobType}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {expLevelLabels[job.experienceLevel] || job.experienceLevel}
            </span>
            {job.showSalary && (job.salaryMin || job.salaryMax) && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <IndianRupee className="w-4 h-4" />
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
            )}
          </div>

          {/* Skills */}
          {!compact && skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.slice(0, 5).map((skill: string) => (
                <span key={skill} className="badge-gray text-xs">
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="badge-gray text-xs">
                  +{skills.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Bottom Row */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-400">
              {timeAgo(job.postedAt)}
            </span>
            <div className="flex items-center gap-2">
              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(job.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label={isSaved ? "Unsave job" : "Save job"}
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-5 h-5 text-primary-600" />
                  ) : (
                    <Bookmark className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              )}
              <Link
                href={`/jobs/${job.slug}`}
                className="btn-primary text-xs px-4 py-2"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
