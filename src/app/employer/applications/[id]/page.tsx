"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Calendar,
  User,
  ChevronDown,
  Check,
  XCircle,
  Loader2,
  Download,
  MessageSquare,
} from "lucide-react";

interface Applicant {
  id: string;
  userId: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: string;
  notes: string;
  appliedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
  };
}

interface JobInfo {
  id: string;
  title: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "APPLIED", label: "Applied" },
  { value: "VIEWED", label: "Viewed" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFERED", label: "Offered" },
  { value: "HIRED", label: "Hired" },
  { value: "REJECTED", label: "Rejected" },
];

const statusBadgeClasses: Record<string, string> = {
  APPLIED: "badge-gray",
  VIEWED: "badge-blue",
  SHORTLISTED: "badge-orange",
  INTERVIEW: "badge-purple",
  OFFERED: "badge-green",
  HIRED: "badge-green",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "badge-gray",
};

export default function JobApplicationsPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobInfo | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job info
        const jobRes = await fetch(`/api/jobs/${jobId}`);
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          setJob(jobData.data);
        }

        // Fetch applications for this job
        const appsRes = await fetch(`/api/applications?jobId=${jobId}`);
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          const apps: Applicant[] = appsData.data || [];
          setApplicants(apps);
          const notesObj: Record<string, string> = {};
          apps.forEach((a) => {
            notesObj[a.id] = a.notes || "";
          });
          setNotesState(notesObj);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplicants((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (appId: string) => {
    setSavingNotes(appId);
    try {
      await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesState[appId] }),
      });
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setSavingNotes(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === applicants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applicants.map((a) => a.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setBulkLoading(true);

    try {
      const promises = Array.from(selectedIds).map((appId) =>
        fetch(`/api/applications/${appId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: bulkAction }),
        })
      );
      await Promise.all(promises);
      setApplicants((prev) =>
        prev.map((a) =>
          selectedIds.has(a.id) ? { ...a, status: bulkAction } : a
        )
      );
      setSelectedIds(new Set());
      setBulkAction("");
    } catch (error) {
      console.error("Error performing bulk action:", error);
    } finally {
      setBulkLoading(false);
    }
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
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/employer/manage-jobs"
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="section-heading">
            Applications for: {job?.title || "Job"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {applicants.length} applicant{applicants.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="card p-4 flex items-center gap-3 bg-blue-50 border-blue-200">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.size} selected
          </span>
          <div className="relative">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="input-field text-sm py-1.5 pr-8"
            >
              <option value="">Select action</option>
              <option value="SHORTLISTED">Shortlist Selected</option>
              <option value="REJECTED">Reject Selected</option>
              <option value="INTERVIEW">Move to Interview</option>
            </select>
          </div>
          <button
            onClick={handleBulkAction}
            disabled={!bulkAction || bulkLoading}
            className="btn-primary text-sm px-4 py-1.5 disabled:opacity-50"
          >
            {bulkLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Apply"
            )}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
      )}

      {/* Applicants List */}
      {applicants.length === 0 ? (
        <div className="card p-12 text-center">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No applications yet
          </h3>
          <p className="text-gray-500">
            Applications will appear here when candidates apply.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center px-2">
            <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === applicants.length}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Select All</span>
            </label>
          </div>

          {applicants.map((applicant) => (
            <div
              key={applicant.id}
              className={`card p-5 transition-colors ${
                selectedIds.has(applicant.id) ? "ring-2 ring-blue-300" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(applicant.id)}
                    onChange={() => toggleSelect(applicant.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {applicant.user.image ? (
                    <img
                      src={applicant.user.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {applicant.user.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Mail size={12} className="mr-1" />
                          {applicant.user.email}
                        </span>
                        {applicant.user.phone && (
                          <span className="flex items-center">
                            <Phone size={12} className="mr-1" />
                            {applicant.user.phone}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          Applied{" "}
                          {new Date(applicant.appliedAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Status dropdown */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {updatingId === applicant.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-gray-400"
                        />
                      ) : (
                        <div className="relative">
                          <select
                            value={applicant.status}
                            onChange={(e) =>
                              handleStatusChange(applicant.id, e.target.value)
                            }
                            className={`text-xs px-3 py-1.5 rounded-full font-medium border-0 cursor-pointer appearance-none pr-7 ${
                              statusBadgeClasses[applicant.status] ||
                              "badge-gray"
                            }`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {applicant.resumeUrl && (
                      <a
                        href={applicant.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs px-3 py-1 flex items-center"
                      >
                        <Download size={12} className="mr-1" />
                        Resume
                      </a>
                    )}
                    <Link
                      href={`/profile/${applicant.userId}`}
                      className="btn-secondary text-xs px-3 py-1 flex items-center"
                    >
                      <User size={12} className="mr-1" />
                      View Profile
                    </Link>
                  </div>

                  {/* Notes */}
                  <div className="mt-3">
                    <label className="flex items-center text-xs font-medium text-gray-600 mb-1">
                      <MessageSquare size={12} className="mr-1" />
                      Notes
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        value={notesState[applicant.id] || ""}
                        onChange={(e) =>
                          setNotesState((prev) => ({
                            ...prev,
                            [applicant.id]: e.target.value,
                          }))
                        }
                        rows={2}
                        placeholder="Add notes about this candidate..."
                        className="input-field text-xs flex-1"
                      />
                      <button
                        onClick={() => handleSaveNotes(applicant.id)}
                        disabled={savingNotes === applicant.id}
                        className="btn-secondary text-xs px-3 self-end"
                      >
                        {savingNotes === applicant.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
