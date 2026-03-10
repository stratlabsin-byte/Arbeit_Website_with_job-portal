"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  Sparkles,
} from "lucide-react";

interface RequisitionDetail {
  id: string;
  title: string;
  rawJd: string | null;
  polishedJd: string | null;
  description: string | null;
  department: string | null;
  location: string | null;
  city: string | null;
  workModel: string;
  jobType: string;
  experienceMin: number;
  experienceMax: number | null;
  ctcMin: number | null;
  ctcMax: number | null;
  ctcCurrency: string;
  noticePeriod: string | null;
  requiredSkills: string | null;
  preferredSkills: string | null;
  vacancies: number;
  priority: string;
  status: string;
  deadline: string | null;
  publishedAt: string | null;
  createdAt: string;
  client: { id: string; name: string; slug: string; industry: string | null };
  assignments: any[];
  candidates: any[];
  job: { id: string; slug: string; status: string } | null;
  _count: { candidates: number };
}

const statusActions: Record<string, { label: string; next: string; color: string }[]> = {
  PENDING_APPROVAL: [
    { label: "Approve", next: "APPROVED", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Reject / Close", next: "CLOSED", color: "bg-red-600 hover:bg-red-700" },
  ],
  APPROVED: [
    { label: "Publish to Job Board", next: "PUBLISHED", color: "bg-green-600 hover:bg-green-700" },
    { label: "Put On Hold", next: "ON_HOLD", color: "bg-gray-600 hover:bg-gray-700" },
  ],
  PUBLISHED: [
    { label: "Put On Hold", next: "ON_HOLD", color: "bg-gray-600 hover:bg-gray-700" },
    { label: "Mark Filled", next: "FILLED", color: "bg-emerald-600 hover:bg-emerald-700" },
    { label: "Close", next: "CLOSED", color: "bg-red-600 hover:bg-red-700" },
  ],
  ON_HOLD: [
    { label: "Resume", next: "APPROVED", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Close", next: "CLOSED", color: "bg-red-600 hover:bg-red-700" },
  ],
};

const stageColors: Record<string, string> = {
  PIPELINE: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  PUSHED_TO_CLIENT: "bg-purple-100 text-purple-700",
  CLIENT_APPROVED: "bg-emerald-100 text-emerald-700",
  CLIENT_REJECTED: "bg-orange-100 text-orange-700",
  SELECTED: "bg-green-200 text-green-800",
};

export default function RequisitionDetailPage() {
  const { requisitionId } = useParams();
  const router = useRouter();
  const [req, setReq] = useState<RequisitionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [polishing, setPolishing] = useState(false);

  useEffect(() => {
    fetchRequisition();
  }, [requisitionId]);

  async function fetchRequisition() {
    const res = await fetch(`/api/talent/requisitions/${requisitionId}`);
    if (!res.ok) {
      router.push("/talent/requisitions");
      return;
    }
    const json = await res.json();
    setReq(json.data);
    setLoading(false);
  }

  async function polishJd() {
    if (!req?.rawJd) return;
    setPolishing(true);
    try {
      const res = await fetch("/api/talent/ai/polish-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requisitionId, rawJd: req.rawJd, title: req.title }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "JD polishing failed");
      }
      await fetchRequisition();
    } catch {
      alert("JD polishing failed");
    }
    setPolishing(false);
  }

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    await fetch(`/api/talent/requisitions/${requisitionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await fetchRequisition();
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!req) return null;

  const skills: string[] = req.requiredSkills ? JSON.parse(req.requiredSkills) : [];
  const actions = statusActions[req.status] || [];

  return (
    <div>
      <Link
        href="/talent/requisitions"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Requisitions
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#0A102F]">{req.title}</h1>
            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                req.status === "PUBLISHED"
                  ? "bg-green-100 text-green-700"
                  : req.status === "PENDING_APPROVAL"
                  ? "bg-amber-100 text-amber-700"
                  : req.status === "FILLED"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {req.status.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {req.client.name}
            </span>
            {req.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {req.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {req.jobType.replace(/_/g, " ")} &middot; {req.workModel}
            </span>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex gap-2">
          {actions.map((action) => (
            <button
              key={action.next}
              onClick={() => updateStatus(action.next)}
              disabled={updating}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${action.color}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A102F] mb-4">Requirements</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Experience</p>
                <p className="font-medium text-[#0A102F]">
                  {req.experienceMin}{req.experienceMax ? `-${req.experienceMax}` : "+"} years
                </p>
              </div>
              {(req.ctcMin || req.ctcMax) && (
                <div>
                  <p className="text-gray-500">CTC Range</p>
                  <p className="font-medium text-[#0A102F]">
                    {req.ctcMin ? `${req.ctcMin}` : "0"} - {req.ctcMax ? `${req.ctcMax}` : "Open"} LPA
                  </p>
                </div>
              )}
              {req.noticePeriod && (
                <div>
                  <p className="text-gray-500">Notice Period</p>
                  <p className="font-medium text-[#0A102F]">{req.noticePeriod}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Vacancies</p>
                <p className="font-medium text-[#0A102F]">{req.vacancies}</p>
              </div>
            </div>

            {skills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* JD */}
          {(req.polishedJd || req.rawJd || req.description) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#0A102F]">Job Description</h2>
                {req.rawJd && (
                  <button
                    onClick={polishJd}
                    disabled={polishing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    {polishing ? "Polishing..." : req.polishedJd ? "Re-polish with AI" : "Polish with AI"}
                  </button>
                )}
              </div>
              {req.polishedJd ? (
                <div>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: req.polishedJd }}
                  />
                  {req.rawJd && (
                    <details className="mt-4 pt-4 border-t border-gray-100">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                        View original JD from client
                      </summary>
                      <div className="text-sm text-gray-500 whitespace-pre-wrap mt-2">
                        {req.rawJd}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {req.rawJd || req.description}
                </div>
              )}
            </div>
          )}

          {/* Candidates Pipeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0A102F]">
                Candidates ({req._count.candidates})
              </h2>
              <Link
                href={`/talent/candidates/new?requisitionId=${req.id}`}
                className="text-sm text-[#3147FF] font-medium hover:underline"
              >
                + Add Candidate
              </Link>
            </div>
            {req.candidates.length === 0 ? (
              <p className="text-sm text-gray-400">No candidates yet. Upload CVs or wait for applications.</p>
            ) : (
              <div className="space-y-2">
                {req.candidates.map((cr: any) => (
                  <div
                    key={cr.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                        {cr.candidate.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0A102F]">{cr.candidate.name}</p>
                        <p className="text-xs text-gray-500">
                          {cr.candidate.currentRole} {cr.candidate.currentCompany ? `at ${cr.candidate.currentCompany}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {cr.fitScore !== null && (
                        <span className="text-sm font-medium text-[#0A102F]">{cr.fitScore}%</span>
                      )}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${stageColors[cr.stage] || "bg-gray-100 text-gray-500"}`}>
                        {cr.stage.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A102F] mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Priority</span>
                <span className={`font-medium ${
                  req.priority === "URGENT" ? "text-red-600" :
                  req.priority === "HIGH" ? "text-orange-600" :
                  req.priority === "MEDIUM" ? "text-blue-600" : "text-gray-500"
                }`}>
                  {req.priority}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Candidates</span>
                <span className="font-medium text-[#0A102F]">{req._count.candidates}</span>
              </div>
              {req.deadline && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Deadline</span>
                  <span className="text-[#0A102F]">{new Date(req.deadline).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-[#0A102F]">{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
              {req.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Published</span>
                  <span className="text-[#0A102F]">{new Date(req.publishedAt).toLocaleDateString()}</span>
                </div>
              )}
              {req.job && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Job Board</span>
                  <Link href={`/jobs/${req.job.slug}`} className="text-[#3147FF] hover:underline">
                    View Listing
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Recruiters */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A102F] mb-4">Assigned Recruiters</h2>
            {req.assignments.length === 0 ? (
              <p className="text-sm text-gray-400">Not assigned yet</p>
            ) : (
              <div className="space-y-2">
                {req.assignments.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                      {a.recruiter.user.name?.[0] || "R"}
                    </div>
                    <span className="text-[#0A102F]">{a.recruiter.user.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
