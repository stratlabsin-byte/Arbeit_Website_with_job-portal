"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  ShieldX,
  Trash2,
  Pencil,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Briefcase,
  MapPin,
  Factory,
  Mail,
} from "lucide-react";

type Company = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  size: string | null;
  founded: string | null;
  location: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  isVerified: boolean;
  createdAt: string;
  user: { email: string };
  _count: { jobs: number };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type Toast = { type: "success" | "error"; message: string } | null;

const ITEMS_PER_PAGE = 10;

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [toast, setToast] = useState<Toast>(null);

  // Edit modal state
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    industry: "",
    location: "",
    website: "",
    description: "",
    isVerified: false,
  });
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCompanies = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(ITEMS_PER_PAGE),
        });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (verifiedFilter !== "all") params.set("verified", verifiedFilter);

        const res = await fetch(`/api/admin/companies?${params}`);
        const data = await res.json();

        if (data.success) {
          setCompanies(data.data);
          setPagination(data.pagination);
        } else {
          showToast("error", data.error || "Failed to load companies");
        }
      } catch {
        showToast("error", "Network error loading companies");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, verifiedFilter]
  );

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchCompanies(1);
  }, [fetchCompanies]);

  // Toggle verified status
  const toggleVerified = async (company: Company) => {
    try {
      const res = await fetch("/api/admin/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: company.id, isVerified: !company.isVerified }),
      });
      const data = await res.json();
      if (data.success) {
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === company.id ? { ...c, isVerified: !c.isVerified } : c
          )
        );
        showToast(
          "success",
          `${company.name} ${!company.isVerified ? "verified" : "unverified"}`
        );
      } else {
        showToast("error", data.error || "Failed to update");
      }
    } catch {
      showToast("error", "Network error");
    }
  };

  // Delete company
  const deleteCompany = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/companies?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Company deleted");
        setConfirmDeleteId(null);
        fetchCompanies(pagination.page);
      } else {
        showToast("error", data.error || "Failed to delete");
      }
    } catch {
      showToast("error", "Network error");
    } finally {
      setDeletingId(null);
    }
  };

  // Open edit modal
  const openEdit = (company: Company) => {
    setEditingCompany(company);
    setEditForm({
      name: company.name || "",
      industry: company.industry || "",
      location: company.location || "",
      website: company.website || "",
      description: company.description || "",
      isVerified: company.isVerified,
    });
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingCompany) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCompany.id, ...editForm }),
      });
      const data = await res.json();
      if (data.success) {
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === editingCompany.id
              ? { ...c, ...editForm }
              : c
          )
        );
        showToast("success", "Company updated successfully");
        setEditingCompany(null);
      } else {
        showToast("error", data.error || "Update failed");
      }
    } catch {
      showToast("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton
  if (loading && companies.length === 0) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-10 bg-gray-200 rounded w-full max-w-md" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in-down ${
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
            <Building2 className="w-7 h-7 text-primary-600" />
            Companies
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage registered companies, verify profiles, and review details.
          </p>
        </div>
        <span className="text-sm text-gray-400 font-medium">
          {pagination.total} total
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Verified filter */}
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          <option value="all">All Companies</option>
          <option value="true">Verified Only</option>
          <option value="false">Unverified Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">
                  Company
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">
                  Industry
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden lg:table-cell">
                  Location
                </th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600">
                  Jobs
                </th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600">
                  Verified
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden xl:table-cell">
                  Owner
                </th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    No companies found.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Company Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover"
                            />
                          ) : (
                            <Building2 className="w-4 h-4 text-primary-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {company.name}
                          </p>
                          {company.website && (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-500 hover:underline flex items-center gap-1"
                            >
                              {company.website.replace(/^https?:\/\//, "").slice(0, 30)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-gray-600">
                        <Factory className="w-3.5 h-3.5 text-gray-400" />
                        {company.industry || "—"}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {company.location || "—"}
                      </span>
                    </td>

                    {/* Jobs Count */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        <Briefcase className="w-3 h-3" />
                        {company._count.jobs}
                      </span>
                    </td>

                    {/* Verified */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleVerified(company)}
                        title={company.isVerified ? "Click to unverify" : "Click to verify"}
                        className="inline-flex items-center justify-center"
                      >
                        {company.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                            <ShieldX className="w-3.5 h-3.5" />
                            Unverified
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Owner */}
                    <td className="px-5 py-4 hidden xl:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs">
                        <Mail className="w-3 h-3" />
                        {company.user.email}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(company)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit company"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {confirmDeleteId === company.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deleteCompany(company.id)}
                              disabled={deletingId === company.id}
                              className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {deletingId === company.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Confirm"
                              )}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(company.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete company"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1}
              {" - "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}
              {" of "}
              {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchCompanies(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  const current = pagination.page;
                  return p === 1 || p === pagination.totalPages || Math.abs(p - current) <= 1;
                })
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                    acc.push("...");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  typeof item === "string" ? (
                    <span key={`dot-${idx}`} className="px-1 text-gray-400 text-xs">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => fetchCompanies(item)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        item === pagination.page
                          ? "bg-primary-600 text-white"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => fetchCompanies(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditingCompany(null)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Company
              </h2>
              <button
                onClick={() => setEditingCompany(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={editForm.industry}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, industry: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, location: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, website: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 resize-y
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Verified Toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Verified Status
                  </p>
                  <p className="text-xs text-gray-400">
                    Verified companies display a badge on their profile
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditForm((f) => ({ ...f, isVerified: !f.isVerified }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editForm.isVerified ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editForm.isVerified ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setEditingCompany(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving || !editForm.name.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg
                           hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
