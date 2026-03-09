import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import JobCard from "@/components/jobs/JobCard";
import JobSearchBar from "@/components/jobs/JobSearchBar";
import JobFilters from "@/components/jobs/JobFilters";
import {
  Briefcase,
  SearchX,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Browse Jobs | Arbeit",
  description:
    "Find your next career opportunity. Browse thousands of job listings across industries, locations, and experience levels.",
};

const ITEMS_PER_PAGE = 12;

interface JobsPageProps {
  searchParams: {
    keyword?: string;
    location?: string;
    industry?: string;
    jobType?: string;
    experienceLevel?: string;
    isRemote?: string;
    salaryMin?: string;
    salaryMax?: string;
    page?: string;
    sortBy?: string;
  };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const {
    keyword,
    location,
    industry,
    jobType,
    experienceLevel,
    isRemote,
    salaryMin,
    salaryMax,
    sortBy = "newest",
  } = searchParams;

  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  // Build the where clause
  const where: Prisma.JobWhereInput = {
    status: "ACTIVE",
  };

  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { description: { contains: keyword } },
      { skills: { contains: keyword } },
      { company: { name: { contains: keyword } } },
    ];
  }

  if (location) {
    where.location = location;
  }

  if (industry) {
    where.industry = industry;
  }

  if (jobType) {
    const types = jobType.split(",");
    if (types.length === 1) {
      where.jobType = types[0] as any;
    } else {
      where.jobType = { in: types as any[] };
    }
  }

  if (experienceLevel) {
    const levels = experienceLevel.split(",");
    if (levels.length === 1) {
      where.experienceLevel = levels[0] as any;
    } else {
      where.experienceLevel = { in: levels as any[] };
    }
  }

  if (isRemote === "true") {
    where.isRemote = true;
  }

  if (salaryMin) {
    where.salaryMax = { gte: parseFloat(salaryMin) };
  }

  if (salaryMax) {
    where.salaryMin = { lte: parseFloat(salaryMax) };
  }

  // Sort order
  let orderBy: Prisma.JobOrderByWithRelationInput = { postedAt: "desc" };
  if (sortBy === "salary") {
    orderBy = { salaryMax: "desc" };
  } else if (sortBy === "views") {
    orderBy = { views: "desc" };
  }

  // Fetch jobs and total count in parallel
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: {
          select: {
            name: true,
            logo: true,
            slug: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.job.count({ where }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const showingFrom = total === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const showingTo = Math.min(page * ITEMS_PER_PAGE, total);

  // Serialize for client components
  const serializedJobs = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    slug: job.slug,
    company: job.company,
    location: job.location,
    jobType: job.jobType,
    experienceLevel: job.experienceLevel,
    salaryMin: job.salaryMin?.toString() ?? null,
    salaryMax: job.salaryMax?.toString() ?? null,
    showSalary: job.showSalary,
    isRemote: job.isRemote,
    industry: job.industry,
    skills: job.skills,
    postedAt: job.postedAt?.toISOString() ?? null,
    featured: job.featured,
  }));

  // Build pagination URLs
  function buildPageUrl(targetPage: number) {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);
    if (industry) params.set("industry", industry);
    if (jobType) params.set("jobType", jobType);
    if (experienceLevel) params.set("experienceLevel", experienceLevel);
    if (isRemote) params.set("isRemote", isRemote);
    if (salaryMin) params.set("salaryMin", salaryMin);
    if (salaryMax) params.set("salaryMax", salaryMax);
    if (sortBy !== "newest") params.set("sortBy", sortBy);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/jobs${qs ? `?${qs}` : ""}`;
  }

  function buildSortUrl(sort: string) {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);
    if (industry) params.set("industry", industry);
    if (jobType) params.set("jobType", jobType);
    if (experienceLevel) params.set("experienceLevel", experienceLevel);
    if (isRemote) params.set("isRemote", isRemote);
    if (salaryMin) params.set("salaryMin", salaryMin);
    if (salaryMax) params.set("salaryMax", salaryMax);
    if (sort !== "newest") params.set("sortBy", sort);
    const qs = params.toString();
    return `/jobs${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-6 h-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
          </div>
          <Suspense fallback={null}>
            <JobSearchBar
              variant="compact"
              defaultValues={{ keyword, location, industry }}
            />
          </Suspense>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <Suspense fallback={null}>
            <JobFilters totalResults={total} />
          </Suspense>

          {/* Job Listings */}
          <div className="flex-1 min-w-0">
            {/* Results Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {showingFrom}-{showingTo}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">{total}</span>{" "}
                jobs
              </p>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Sort by:</span>
                <div className="flex gap-1">
                  {[
                    { value: "newest", label: "Newest" },
                    { value: "salary", label: "Salary High-Low" },
                    { value: "views", label: "Most Viewed" },
                  ].map((option) => (
                    <Link
                      key={option.value}
                      href={buildSortUrl(option.value)}
                      className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        sortBy === option.value
                          ? "bg-primary-50 text-primary-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Cards */}
            {serializedJobs.length > 0 ? (
              <div className="space-y-4">
                {serializedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <SearchX className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  We couldn&apos;t find any jobs matching your criteria. Try
                  adjusting your filters or search with different keywords.
                </p>
                <Link
                  href="/jobs"
                  className="btn-primary inline-flex items-center gap-2 px-6 py-2.5"
                >
                  Clear Filters
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-2">
                {page > 1 ? (
                  <Link
                    href={buildPageUrl(page - 1)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </span>
                )}

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (totalPages <= 7) return true;
                      if (p === 1 || p === totalPages) return true;
                      if (Math.abs(p - page) <= 1) return true;
                      return false;
                    })
                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                      if (idx > 0) {
                        const prev = arr[idx - 1];
                        if (p - prev > 1) acc.push("...");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      typeof item === "string" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 py-2 text-sm text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <Link
                          key={item}
                          href={buildPageUrl(item)}
                          className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                            item === page
                              ? "bg-primary-600 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {item}
                        </Link>
                      )
                    )}
                </div>

                {/* Mobile page indicator */}
                <span className="sm:hidden text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>

                {page < totalPages ? (
                  <Link
                    href={buildPageUrl(page + 1)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
