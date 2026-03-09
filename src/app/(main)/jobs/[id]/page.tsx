import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import JobCard from "@/components/jobs/JobCard";
import {
  MapPin,
  Building2,
  Clock,
  IndianRupee,
  BriefcaseBusiness,
  GraduationCap,
  Users,
  Globe,
  Calendar,
  Eye,
  Share2,
  Bookmark,
  ChevronRight,
  ExternalLink,
  Tag,
  Wifi,
  ArrowLeft,
  Send,
} from "lucide-react";

interface JobDetailPageProps {
  params: { id: string };
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
  ENTRY: "Entry Level (0-1 yrs)",
  JUNIOR: "Junior (1-3 yrs)",
  MID: "Mid Level (3-5 yrs)",
  SENIOR: "Senior (5-10 yrs)",
  LEAD: "Lead (10-15 yrs)",
  EXECUTIVE: "Executive (15+ yrs)",
};

function formatSalary(min?: string | null, max?: string | null): string {
  if (!min && !max) return "Not disclosed";
  const fmt = (v: string) => {
    const n = parseFloat(v);
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };
  if (min && max) return `INR ${fmt(min)} - ${fmt(max)} per annum`;
  if (min) return `INR ${fmt(min)}+ per annum`;
  return `Up to INR ${fmt(max!)} per annum`;
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const job = await prisma.job.findUnique({
    where: { slug: params.id },
    include: { company: { select: { name: true } } },
  });

  if (!job) {
    return { title: "Job Not Found | Arbeit" };
  }

  return {
    title: `${job.title} at ${job.company.name} | Arbeit`,
    description: job.description.substring(0, 160),
    openGraph: {
      title: `${job.title} at ${job.company.name}`,
      description: job.description.substring(0, 160),
      type: "website",
    },
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job = await prisma.job.findUnique({
    where: { slug: params.id },
    include: {
      company: true,
    },
  });

  if (!job || job.status !== "ACTIVE") {
    notFound();
  }

  // Increment views (fire and forget)
  prisma.job
    .update({
      where: { id: job.id },
      data: { views: { increment: 1 } },
    })
    .catch(() => {});

  // Fetch similar jobs
  const similarJobs = await prisma.job.findMany({
    where: {
      status: "ACTIVE",
      industry: job.industry,
      id: { not: job.id },
    },
    include: {
      company: {
        select: { name: true, logo: true, slug: true },
      },
    },
    take: 3,
    orderBy: { postedAt: "desc" },
  });

  const serializedSimilarJobs = similarJobs.map((j: any) => ({
    id: j.id,
    title: j.title,
    slug: j.slug,
    company: j.company,
    location: j.location,
    jobType: j.jobType,
    experienceLevel: j.experienceLevel,
    salaryMin: j.salaryMin?.toString() ?? null,
    salaryMax: j.salaryMax?.toString() ?? null,
    showSalary: j.showSalary,
    isRemote: j.isRemote,
    industry: j.industry,
    skills: j.skills,
    postedAt: j.postedAt?.toISOString() ?? null,
    featured: j.featured,
  }));

  const skills: string[] = job.skills ? JSON.parse(job.skills) : [];
  const requirements: string[] = job.requirements
    ? job.requirements
        .split("\n")
        .map((r: string) => r.trim())
        .filter(Boolean)
    : [];
  const responsibilities: string[] = job.responsibilities
    ? job.responsibilities
        .split("\n")
        .map((r: string) => r.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href="/jobs"
              className="hover:text-primary-600 transition-colors"
            >
              Jobs
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {job.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Job Header Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <div className="flex items-start gap-5">
                {/* Company Logo */}
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {job.company.logo ? (
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-14 h-14 object-contain rounded-lg"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <Link
                    href={`/companies/${job.company.slug}`}
                    className="text-lg text-primary-600 hover:text-primary-700 font-medium mt-1 inline-block"
                  >
                    {job.company.name}
                  </Link>

                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">
                      <BriefcaseBusiness className="w-4 h-4" />
                      {jobTypeLabels[job.jobType] || job.jobType}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      <GraduationCap className="w-4 h-4" />
                      {expLevelLabels[job.experienceLevel] ||
                        job.experienceLevel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    {job.isRemote && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                        <Wifi className="w-4 h-4" />
                        Remote
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Salary
                  </p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                    <IndianRupee className="w-4 h-4 text-green-600" />
                    {job.showSalary
                      ? formatSalary(
                          job.salaryMin?.toString(),
                          job.salaryMax?.toString()
                        )
                      : "Not disclosed"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Experience
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {job.experienceMin}-{job.experienceMax || "+"} years
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Vacancies
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {job.vacancies} {job.vacancies === 1 ? "position" : "positions"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Deadline
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {job.deadline ? formatDate(job.deadline) : "Open"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                <Link
                  href={`/login?redirect=/jobs/${job.slug}/apply`}
                  className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base"
                >
                  <Send className="w-5 h-5" />
                  Apply Now
                </Link>
                <button className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                  <Bookmark className="w-5 h-5" />
                  Save Job
                </button>
                <button className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Job Description
              </h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {responsibilities.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Key Responsibilities
                </h2>
                <ul className="space-y-3">
                  {responsibilities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary-600" />
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Jobs */}
            {serializedSimilarJobs.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Similar Jobs
                </h2>
                <div className="space-y-4">
                  {serializedSimilarJobs.map((j: any) => (
                    <JobCard key={j.id} job={j} compact />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-80 flex-shrink-0 space-y-6">
            {/* Company Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                About the Company
              </h3>
              <div className="flex items-center gap-3 mb-4">
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
                <div>
                  <Link
                    href={`/companies/${job.company.slug}`}
                    className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {job.company.name}
                  </Link>
                  {job.company.industry && (
                    <p className="text-sm text-gray-500">
                      {job.company.industry}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {job.company.size && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{job.company.size} employees</span>
                  </div>
                )}
                {job.company.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{job.company.location}</span>
                  </div>
                )}
                {job.company.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {job.company.founded && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Founded {job.company.founded}</span>
                  </div>
                )}
              </div>

              {job.company.description && (
                <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100 line-clamp-4">
                  {job.company.description}
                </p>
              )}

              <Link
                href={`/companies/${job.company.slug}`}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Company Profile
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Job Meta Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Job Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Posted</span>
                  <span className="font-medium text-gray-900">
                    {job.postedAt ? formatDate(job.postedAt) : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Industry</span>
                  <span className="font-medium text-gray-900">
                    {job.industry}
                  </span>
                </div>
                {job.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Department</span>
                    <span className="font-medium text-gray-900">
                      {job.department}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Applications</span>
                  <span className="font-medium text-gray-900">
                    {job.applicationCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    Views
                  </span>
                  <span className="font-medium text-gray-900">
                    {job.views}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
