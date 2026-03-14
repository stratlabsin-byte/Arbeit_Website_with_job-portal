"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  User,
  Calendar,
  Briefcase,
  ChevronDown,
  Loader2,
  Mail,
  Search,
} from "lucide-react";

interface ApplicationItem {
  id: string;
  status: string;
  appliedAt: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  job: {
    id: string;
    title: string;
  };
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "APPLIED", label: "Applied" },
  { value: "VIEWED", label: "Viewed" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFERED", label: "Offered" },
  { value: "HIRED", label: "Hired" },
  { value: "REJECTED", label: "Rejected" },
];

const statusBadgeClasses: Record<string, string> = {
  APPLIED: "bg-gray-100 text-gray-700",
  VIEWED: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-orange-100 text-orange-700",
  INTERVIEW: "bg-purple-100 text-purple-700",
  OFFERED: "bg-green-100 text-green-700",
  HIRED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-600",
};

export default function AllApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filtered = applications.filter((app) => {
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      app.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Group by status for summary
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Applications</h1>
        <p className="text-sm text-gray-500 mt-1">
          {applications.length} total application{applications.length !== 1 ? "s" : ""} across all jobs
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {STATUS_OPTIONS.filter((s) => s.value).map((status) => (
          <button
            key={status.value}
            onClick={() => setStatusFilter(statusFilter === status.value ? "" : status.value)}
            className={`bg-white rounded-xl border p-3 text-center transition-all hover:shadow-md ${
              statusFilter === status.value
                ? "border-primary-400 ring-2 ring-primary-100"
                : "border-gray-200"
            }`}
          >
            <p className="text-xl font-bold text-gray-900">
              {statusCounts[status.value] || 0}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{status.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 py-2 text-sm w-full"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field pr-8 py-2 text-sm appearance-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Applications List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {applications.length === 0 ? "No applications yet" : "No matching applications"}
          </h3>
          <p className="text-gray-500">
            {applications.length === 0
              ? "Applications will appear here when candidates apply to your jobs."
              : "Try adjusting your search or filter."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Job Position
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-semibold flex-shrink-0">
                          {app.user.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{app.user.name}</p>
                          <p className="text-xs text-gray-500">{app.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{app.job.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                          statusBadgeClasses[app.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/employer/applications/${app.job.id}`}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((app) => (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
                      {app.user.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{app.user.name}</p>
                      <p className="text-xs text-gray-500">{app.user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      statusBadgeClasses[app.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} />
                    {app.job.title}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <Link
                  href={`/employer/applications/${app.job.id}`}
                  className="mt-3 block text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
