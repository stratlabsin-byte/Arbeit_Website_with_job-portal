"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Filter,
  ArrowUpDown,
  Briefcase,
  Calendar,
  ChevronDown,
} from "lucide-react";

interface ApplicationItem {
  id: string;
  job: {
    id: string;
    title: string;
    slug: string;
    company: { name: string; logo?: string };
    location: string;
  };
  status: string;
  appliedAt: string;
  coverLetter?: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "APPLIED", label: "Applied" },
  { value: "VIEWED", label: "Viewed" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFERED", label: "Offered" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

const statusBadgeClasses: Record<string, string> = {
  APPLIED: "badge-gray",
  VIEWED: "badge-blue",
  SHORTLISTED: "badge-orange",
  INTERVIEW: "badge-purple",
  OFFERED: "badge-green",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "badge-gray",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch("/api/applications");
        if (res.ok) {
          const data = await res.json();
          setApplications(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApplications = applications
    .filter((app) => !statusFilter || app.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.appliedAt).getTime();
      const dateB = new Date(b.appliedAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="section-heading">My Applications</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field pl-9 pr-8 py-2 text-sm appearance-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="btn-secondary text-sm px-4 py-2 flex items-center"
        >
          <ArrowUpDown size={16} className="mr-2" />
          Date: {sortOrder === "desc" ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {statusFilter ? "No applications match this filter" : "No applications yet"}
          </h3>
          <p className="text-gray-500 mb-4">
            {statusFilter
              ? "Try changing the filter to see more results."
              : "Start applying to jobs to track your progress here."}
          </p>
          {!statusFilter && (
            <Link href="/jobs" className="btn-primary inline-block text-sm px-6 py-2">
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/jobs/${app.job.slug}`}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {app.job.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {app.job.location}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {app.job.company.logo ? (
                            <img
                              src={app.job.company.logo}
                              alt=""
                              className="w-5 h-5 object-contain"
                            />
                          ) : (
                            <Briefcase size={14} className="text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700">
                          {app.job.company.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-1.5" />
                        {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                          statusBadgeClasses[app.status] || "badge-gray"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredApplications.map((app) => (
              <div key={app.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {app.job.company.logo ? (
                        <img
                          src={app.job.company.logo}
                          alt=""
                          className="w-7 h-7 object-contain"
                        />
                      ) : (
                        <Briefcase size={18} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/jobs/${app.job.slug}`}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {app.job.title}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {app.job.company.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {app.job.location}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      statusBadgeClasses[app.status] || "badge-gray"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-400 flex items-center">
                  <Calendar size={12} className="mr-1" />
                  Applied{" "}
                  {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
