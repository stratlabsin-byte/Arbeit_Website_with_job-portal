"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Briefcase,
  Search,
  Star,
  Trash2,
  Pencil,
  Eye,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Filter,
} from "lucide-react";

// ==================== Types ====================

interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

interface Job {
  id: string;
  companyId: string;
  title: string;
  slug: string;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  skills: string | null;
  jobType: string;
  experienceLevel: string;
  experienceMin: number;
  experienceMax: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  showSalary: boolean;
  location: string;
  isRemote: boolean;
  industry: string;
  department: string | null;
  vacancies: number;
  status: string;
  featured: boolean;
  views: number;
  applicationCount: number;
  deadline: string | null;
  postedAt: string | null;
  createdAt: string;
  updatedAt: string;
  company: Company;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type Toast = { type: "success" | "error"; message: string } | null;

// ==================== Constants ====================

const STATUS_TABS = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Draft", value: "DRAFT" },
  { label: "Paused", value: "PAUSED" },
  { label: "Closed", value: "CLOSED" },
];

const STATUS_OPTIONS = ["DRAFT", "ACTIVE", "PAUSED", "CLOSED", "EXPIRED"];

const JOB_TYPE_OPTIONS = [
  { label: "Full Time", value: "FULL_TIME" },
  { label: "Part Time", value: "PART_TIME" },
  { label: "Contract", value: "CONTRACT" },
  { label: "Temporary", value: "TEMPORARY" },
  { label: "Internship", value: "INTERNSHIP" },
  { label: "Freelance", value: "FREELANCE" },
];

const EXPERIENCE_LEVEL_OPTIONS = [
  { label: "Entry", value: "ENTRY" },
  { label: "Junior", value: "JUNIOR" },
  { label: "Mid", value: "MID" },
  { label: "Senior", value: "SENIOR" },
  { label: "Lead", value: "LEAD" },
  { label: "Executive", value: "EXECUTIVE" },
];

const STATUS_BADGE_CLASSES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  PAUSED: "bg-amber-100 text-amber-700",
  CLOSED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  TEMPORARY: "Temporary",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
};

// ==================== Component ====================

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast] = useState<Toast>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== Fetch Jobs ====================

  const fetchJobs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
        });
        if (search) params.set("search", search);
        if (statusFilter && statusFilter !== "ALL")
          params.set("status", statusFilter);

        const res = await fetch(`/api/admin/jobs?${params}`);
        const data = await res.json();
        if (data.success) {
          setJobs(data.data);
          setPagination(data.pagination);
        } else {
          showToast("error", data.error || "Failed to fetch jobs");
        }
      } catch {
        showToast("error", "Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter]
  );

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  // ==================== Actions ====================

  const updateJob = async (id: string, updates: Record<string, any>) => {
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        setJobs((prev) =>
          prev.map((j) => (j.id === id ? { ...j, ...data.data } : j))
        );
        showToast("success", "Job updated successfully");
        return true;
      } else {
        showToast("error", data.error || "Failed to update job");
        return false;
      }
    } catch {
      showToast("error", "Network error");
      return false;
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/jobs?id=${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setJobs((prev) => prev.filter((j) => j.id !== deleteId));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
        showToast("success", "Job deleted successfully");
      } else {
        showToast("error", data.error || "Failed to delete job");
      }
    } catch {
      showToast("error", "Network error");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const toggleFeatured = (job: Job) => {
    updateJob(job.id, { featured: !job.featured });
  };

  const changeStatus = (job: Job, newStatus: string) => {
    updateJob(job.id, { status: newStatus });
  };

  // ==================== Edit Modal ====================

  const openEditModal = (job: Job) => {
    setEditJob(job);
    setEditForm({
      title: job.title,
      description: job.description,
      status: job.status,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin ?? "",
      salaryMax: job.salaryMax ?? "",
      location: job.location,
      isRemote: job.isRemote,
      featured: job.featured,
      vacancies: job.vacancies,
    });
  };

  const handleEditSave = async () => {
    if (!editJob) return;
    setSaving(true);

    const payload: Record<string, any> = { ...editForm };
    // Convert numeric fields
    if (payload.salaryMin !== "") payload.salaryMin = Number(payload.salaryMin);
    else payload.salaryMin = null;
    if (payload.salaryMax !== "") payload.salaryMax = Number(payload.salaryMax);
    else payload.salaryMax = null;
    payload.vacancies = Number(payload.vacancies) || 1;

    const success = await updateJob(editJob.id, payload);
    if (success) {
      setEditJob(null);
    }
    setSaving(false);
  };

  // ==================== Helpers ====================

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ==================== Render ====================

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-primary-600" />
            Jobs Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all job listings across the platform. Filter, edit, or remove
            jobs.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {pagination.total} total job{pagination.total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === tab.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchJobs(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading jobs...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No jobs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    <Eye className="w-3.5 h-3.5 inline" />
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 inline" />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Posted
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Title */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFeatured(job)}
                          title={
                            job.featured
                              ? "Remove from featured"
                              : "Mark as featured"
                          }
                          className="shrink-0"
                        >
                          <Star
                            className={`w-4 h-4 transition-colors ${
                              job.featured
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300 hover:text-amber-300"
                            }`}
                          />
                        </button>
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">
                          {job.title}
                        </span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]">
                      {job.company?.name || "-"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <select
                        value={job.status}
                        onChange={(e) => changeStatus(job, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer
                                    focus:outline-none focus:ring-2 focus:ring-primary-500
                                    ${STATUS_BADGE_CLASSES[job.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[120px]">
                          {job.location}
                        </span>
                        {job.isRemote && (
                          <span className="ml-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded">
                            Remote
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3 text-center text-gray-500">
                      {job.views}
                    </td>

                    {/* Applications */}
                    <td className="px-4 py-3 text-center text-gray-500">
                      {job.applicationCount}
                    </td>

                    {/* Posted */}
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(job.postedAt || job.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(job)}
                          title="Edit job"
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(job.id)}
                          title="Delete job"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )}{" "}
              of {pagination.total} jobs
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchJobs(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from(
                { length: Math.min(pagination.totalPages, 5) },
                (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchJobs(pageNum)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                        pagination.page === pageNum
                          ? "bg-primary-600 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
              <button
                onClick={() => fetchJobs(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Job
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this job? This action cannot be
              undone. All associated applications will also be removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal / Drawer */}
      {editJob && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">Edit Job</h3>
              <button
                onClick={() => setEditJob(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={editForm.title || ""}
                  onChange={(e) =>
                    setEditForm((f: Record<string, any>) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm((f: Record<string, any>) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Status & Job Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status || "DRAFT"}
                    onChange={(e) =>
                      setEditForm((f: Record<string, any>) => ({
                        ...f,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Job Type
                  </label>
                  <select
                    value={editForm.jobType || "FULL_TIME"}
                    onChange={(e) =>
                      setEditForm((f: Record<string, any>) => ({
                        ...f,
                        jobType: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {JOB_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Experience Level
                </label>
                <select
                  value={editForm.experienceLevel || "ENTRY"}
                  onChange={(e) =>
                    setEditForm((f: Record<string, any>) => ({
                      ...f,
                      experienceLevel: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {EXPERIENCE_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Salary Min
                  </label>
                  <input
                    type="number"
                    value={editForm.salaryMin ?? ""}
                    onChange={(e) =>
                      setEditForm((f: Record<string, any>) => ({
                        ...f,
                        salaryMin: e.target.value,
                      }))
                    }
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Salary Max
                  </label>
                  <input
                    type="number"
                    value={editForm.salaryMax ?? ""}
                    onChange={(e) =>
                      setEditForm((f: Record<string, any>) => ({
                        ...f,
                        salaryMax: e.target.value,
                      }))
                    }
                    placeholder="e.g. 1200000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location || ""}
                  onChange={(e) =>
                    setEditForm((f: Record<string, any>) => ({
                      ...f,
                      location: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Remote & Featured toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isRemote || false}
                    onChange={(e) =>
                      setEditForm((f: Record<string, any>) => ({
                        ...f,
                        isRemote: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Remote</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.featured || false}
                    onChange={(e) =>
                      setEditForm((f: Record<string, any>) => ({
                        ...f,
                        featured: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
              </div>

              {/* Vacancies */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Vacancies
                </label>
                <input
                  type="number"
                  min={1}
                  value={editForm.vacancies || 1}
                  onChange={(e) =>
                    setEditForm((f: Record<string, any>) => ({
                      ...f,
                      vacancies: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditJob(null)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
