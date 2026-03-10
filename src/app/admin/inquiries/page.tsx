"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Mail,
  MailOpen,
  Trash2,
  ChevronDown,
  ChevronUp,
  Phone,
  Building2,
  Briefcase,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Inquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  company: string | null;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type FilterTab = "all" | "unread" | "read";
type Toast = { type: "success" | "error"; message: string } | null;

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInquiries = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
        });
        if (filter !== "all") params.set("filter", filter);

        const res = await fetch(`/api/admin/inquiries?${params}`);
        const data = await res.json();

        if (data.success) {
          setInquiries(data.data);
          setPagination(data.pagination);
          setUnreadCount(data.unreadCount);
        } else {
          showToast("error", data.error || "Failed to load inquiries");
        }
      } catch {
        showToast("error", "Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    fetchInquiries(1);
  }, [fetchInquiries]);

  const toggleRead = async (inquiry: Inquiry) => {
    setActionLoading(inquiry.id);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inquiry.id, isRead: !inquiry.isRead }),
      });
      const data = await res.json();
      if (data.success) {
        setInquiries((prev) =>
          prev.map((i) =>
            i.id === inquiry.id ? { ...i, isRead: !inquiry.isRead } : i
          )
        );
        setUnreadCount((prev) => prev + (inquiry.isRead ? 1 : -1));
        showToast(
          "success",
          `Marked as ${inquiry.isRead ? "unread" : "read"}`
        );
      } else {
        showToast("error", data.error || "Failed to update");
      }
    } catch {
      showToast("error", "Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteInquiry = async (id: string) => {
    setActionLoading(id);
    setDeleteConfirmId(null);
    try {
      const res = await fetch(`/api/admin/inquiries?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        const removed = inquiries.find((i) => i.id === id);
        setInquiries((prev) => prev.filter((i) => i.id !== id));
        if (removed && !removed.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
        showToast("success", "Inquiry deleted");
      } else {
        showToast("error", data.error || "Failed to delete");
      }
    } catch {
      showToast("error", "Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "read", label: "Read" },
  ];

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
            <Inbox className="w-7 h-7 text-primary-600" />
            Contact Inquiries
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and respond to contact form submissions.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {filter === "unread"
              ? "No unread inquiries."
              : filter === "read"
              ? "No read inquiries."
              : "No inquiries yet."}
          </p>
        </div>
      ) : (
        /* Inquiry Cards */
        <div className="space-y-3">
          {inquiries.map((inquiry) => {
            const isExpanded = expandedId === inquiry.id;
            const isDeleting = deleteConfirmId === inquiry.id;

            return (
              <div
                key={inquiry.id}
                className={`bg-white rounded-xl border overflow-hidden transition-all ${
                  inquiry.isRead
                    ? "border-gray-200"
                    : "border-l-4 border-l-blue-500 border-t-gray-200 border-r-gray-200 border-b-gray-200"
                }`}
              >
                {/* Card Header */}
                <div
                  className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : inquiry.id)
                  }
                >
                  {/* Read indicator */}
                  <div className="mt-0.5">
                    {inquiry.isRead ? (
                      <MailOpen className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Mail className="w-5 h-5 text-blue-600" />
                    )}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm ${
                          inquiry.isRead
                            ? "font-medium text-gray-700"
                            : "font-semibold text-gray-900"
                        }`}
                      >
                        {inquiry.firstName} {inquiry.lastName}
                      </h3>
                      {!inquiry.isRead && (
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                      )}
                      <span className="text-xs text-gray-400">
                        {inquiry.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {inquiry.email}
                      {inquiry.phone && ` | ${inquiry.phone}`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {inquiry.message}
                    </p>
                  </div>

                  {/* Date and expand */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(inquiry.createdAt)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="pt-4 space-y-4">
                      {/* Detail Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <DetailItem
                          icon={<User className="w-4 h-4" />}
                          label="Name"
                          value={`${inquiry.firstName} ${inquiry.lastName}`}
                        />
                        <DetailItem
                          icon={<Mail className="w-4 h-4" />}
                          label="Email"
                          value={inquiry.email}
                        />
                        {inquiry.phone && (
                          <DetailItem
                            icon={<Phone className="w-4 h-4" />}
                            label="Phone"
                            value={inquiry.phone}
                          />
                        )}
                        {inquiry.company && (
                          <DetailItem
                            icon={<Building2 className="w-4 h-4" />}
                            label="Company"
                            value={inquiry.company}
                          />
                        )}
                        {inquiry.jobTitle && (
                          <DetailItem
                            icon={<Briefcase className="w-4 h-4" />}
                            label="Job Title"
                            value={inquiry.jobTitle}
                          />
                        )}
                      </div>

                      {/* Full Message */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Message
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {inquiry.message}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRead(inquiry);
                          }}
                          disabled={actionLoading === inquiry.id}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                                     bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        >
                          {actionLoading === inquiry.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : inquiry.isRead ? (
                            <Mail className="w-4 h-4" />
                          ) : (
                            <MailOpen className="w-4 h-4" />
                          )}
                          {inquiry.isRead ? "Mark as Unread" : "Mark as Read"}
                        </button>

                        {isDeleting ? (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-sm text-red-600 font-medium">
                              Delete this inquiry?
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteInquiry(inquiry.id);
                              }}
                              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(null);
                              }}
                              className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(inquiry.id);
                            }}
                            disabled={actionLoading === inquiry.id}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                                       text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1}
            {" - "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchInquiries(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg
                         border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-600 px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchInquiries(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg
                         border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Detail item component for the expanded view
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase">
          {label}
        </p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
}
