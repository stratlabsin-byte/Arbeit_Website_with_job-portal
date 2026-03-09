"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkX,
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Loader2,
} from "lucide-react";

interface SavedJobItem {
  id: string;
  savedAt: string;
  job: {
    id: string;
    title: string;
    slug: string;
    jobType: string;
    location: string;
    isRemote: boolean;
    salaryMin?: number;
    salaryMax?: number;
    showSalary: boolean;
    company: {
      name: string;
      logo?: string;
    };
  };
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await fetch("/api/jobs/saved");
        if (res.ok) {
          const data = await res.json();
          setSavedJobs(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const handleRemove = async (savedJobId: string, jobId: string) => {
    setRemovingId(savedJobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/save`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSavedJobs((prev) => prev.filter((sj) => sj.id !== savedJobId));
      }
    } catch (error) {
      console.error("Error removing saved job:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const format = (n: number) => {
      if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
      if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
      return n.toString();
    };
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `${format(min)}+`;
    return `Up to ${format(max!)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="section-heading">Saved Jobs</h1>

      {savedJobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Bookmark size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No saved jobs yet
          </h3>
          <p className="text-gray-500 mb-4">
            Save jobs while browsing to easily find them later.
          </p>
          <Link
            href="/jobs"
            className="btn-primary inline-block text-sm px-6 py-2"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedJobs.map((saved) => (
            <div
              key={saved.id}
              className="card p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {saved.job.company.logo ? (
                      <img
                        src={saved.job.company.logo}
                        alt={saved.job.company.name}
                        className="w-7 h-7 object-contain"
                      />
                    ) : (
                      <Briefcase size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {saved.job.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {saved.job.company.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(saved.id, saved.job.id)}
                  disabled={removingId === saved.id}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                  title="Remove from saved"
                >
                  {removingId === saved.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <BookmarkX size={18} />
                  )}
                </button>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-gray-500 flex-1">
                <div className="flex items-center">
                  <MapPin size={12} className="mr-1.5 flex-shrink-0" />
                  <span>
                    {saved.job.location}
                    {saved.job.isRemote && " (Remote)"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock size={12} className="mr-1.5 flex-shrink-0" />
                  <span>{saved.job.jobType.replace("_", " ")}</span>
                </div>
                {saved.job.showSalary &&
                  (saved.job.salaryMin || saved.job.salaryMax) && (
                    <div className="flex items-center">
                      <IndianRupee size={12} className="mr-1.5 flex-shrink-0" />
                      <span>
                        {formatSalary(saved.job.salaryMin, saved.job.salaryMax)}{" "}
                        /year
                      </span>
                    </div>
                  )}
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/jobs/${saved.job.slug}`}
                  className="btn-primary text-sm px-4 py-1.5 flex-1 text-center"
                >
                  Apply
                </Link>
                <Link
                  href={`/jobs/${saved.job.slug}`}
                  className="btn-secondary text-sm px-4 py-1.5 flex-1 text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
