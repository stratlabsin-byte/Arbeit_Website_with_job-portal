"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Filter,
  ChevronDown,
  MoreVertical,
  Eye,
  Pause,
  Play,
  XCircle,
  Trash2,
  Edit,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";

interface JobItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  applicationCount: number;
  views: number;
  postedAt: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "CLOSED", label: "Closed" },
  { value: "EXPIRED", label: "Expired" },
];

const statusBadgeClasses: Record<string, string> = {
  DRAFT: "badge-gray",
  ACTIVE: "badge-green",
  PAUSED: "badge-orange",
  CLOSED: "bg-red-100 text-red-800",
  EXPIRED: "badge-gray",
};

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/employers/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    jobId: string,
    action: "pause" | "activate" | "close" | "delete"
  ) => {
    setActionLoading(jobId);
    setActionMenuId(null);

    try {
      if (action === "delete") {
        const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
        if (res.ok) {
          setJobs((prev) => prev.filter((j) => j.id !== jobId));
        }
      } else {
        const statusMap = {
          pause: "PAUSED",
          activate: "ACTIVE",
          close: "CLOSED",
        };
        const res = await fetch(`/api/jobs/${jobId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusMap[action] }),
        });
        if (res.ok) {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === jobId ? { ...j, status: statusMap[action] } : j
            )
          );
        }
      }
    } catch (error) {
      console.error("Error performing action:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter(
    (job) => !statusFilter || job.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-heading">Manage Jobs</h1>
        <Link
          href="/employer/post-job"
          className="btn-primary text-sm px-5 py-2"
        >
          Post New Job
        </Link>
      </div>

      {/* Filter */}
      <div className="relative inline-block">
        <Filter
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
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
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {filteredJobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {statusFilter
              ? "No jobs match this filter"
              : "No job listings yet"}
          </h3>
          <p className="text-gray-500 mb-4">
            {statusFilter
              ? "Try changing the filter."
              : "Start by posting your first job."}
          </p>
          {!statusFilter && (
            <Link
              href="/employer/post-job"
              className="btn-primary inline-block text-sm px-6 py-2"
            >
              Post a Job
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
                    Title
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Posted Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                          statusBadgeClasses[job.status] || "badge-gray"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/employer/applications/${job.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {job.applicationCount}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {job.views}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {job.postedAt
                        ? new Date(job.postedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Not posted"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        {actionLoading === job.id ? (
                          <Loader2
                            size={18}
                            className="animate-spin text-gray-400"
                          />
                        ) : (
                          <button
                            onClick={() =>
                              setActionMenuId(
                                actionMenuId === job.id ? null : job.id
                              )
                            }
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical size={18} />
                          </button>
                        )}
                        {actionMenuId === job.id && (
                          <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40">
                            <Link
                              href={`/employer/post-job?edit=${job.id}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setActionMenuId(null)}
                            >
                              <Edit size={14} className="mr-2" />
                              Edit
                            </Link>
                            {job.status === "ACTIVE" ? (
                              <button
                                onClick={() => handleAction(job.id, "pause")}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                              >
                                <Pause size={14} className="mr-2" />
                                Pause
                              </button>
                            ) : job.status !== "CLOSED" ? (
                              <button
                                onClick={() => handleAction(job.id, "activate")}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                              >
                                <Play size={14} className="mr-2" />
                                Activate
                              </button>
                            ) : null}
                            {job.status !== "CLOSED" && (
                              <button
                                onClick={() => handleAction(job.id, "close")}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                              >
                                <XCircle size={14} className="mr-2" />
                                Close
                              </button>
                            )}
                            <button
                              onClick={() => handleAction(job.id, "delete")}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredJobs.map((job) => (
              <div key={job.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {job.title}
                    </Link>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ml-2 ${
                        statusBadgeClasses[job.status] || "badge-gray"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    <FileText size={12} className="mr-1" />
                    {job.applicationCount} apps
                  </span>
                  <span className="flex items-center">
                    <Eye size={12} className="mr-1" />
                    {job.views} views
                  </span>
                  <span className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {job.postedAt
                      ? new Date(job.postedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "Draft"}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/employer/applications/${job.id}`}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    View Apps
                  </Link>
                  <Link
                    href={`/employer/post-job?edit=${job.id}`}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
