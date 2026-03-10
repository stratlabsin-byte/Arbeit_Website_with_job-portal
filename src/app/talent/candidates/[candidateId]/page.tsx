"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Mail, Phone, MapPin, Briefcase, Building2, Clock,
  FileText, Upload, MessageSquare, Send, Sparkles, BarChart3, Calendar,
} from "lucide-react";

interface CandidateDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  currentCompany: string | null;
  currentRole: string | null;
  experienceYears: number;
  currentCtc: string | null;
  expectedCtc: string | null;
  noticePeriod: string | null;
  skills: string | null;
  linkedinUrl: string | null;
  source: string | null;
  createdAt: string;
  cvVersions: any[];
  requisitions: any[];
  interviews: any[];
}

const stageColors: Record<string, string> = {
  PIPELINE: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  PUSHED_TO_CLIENT: "bg-purple-100 text-purple-700",
  CLIENT_APPROVED: "bg-emerald-100 text-emerald-700",
  CLIENT_REJECTED: "bg-orange-100 text-orange-700",
  SELECTED: "bg-green-200 text-green-800",
};

const actionColors: Record<string, string> = {
  SHORTLIST: "text-green-600",
  PIPELINE: "text-blue-600",
  REJECT: "text-red-600",
  PUSH_TO_CLIENT: "text-purple-600",
  COMMENT: "text-gray-600",
  CLIENT_APPROVE: "text-emerald-600",
  CLIENT_REJECT: "text-orange-600",
};

export default function CandidateDetailPage() {
  const { candidateId } = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  async function fetchCandidate() {
    const res = await fetch(`/api/talent/candidates/${candidateId}`);
    if (!res.ok) { router.push("/talent/candidates"); return; }
    const json = await res.json();
    setCandidate(json.data);
    if (json.data.requisitions.length > 0 && !selectedReq) {
      setSelectedReq(json.data.requisitions[0].id);
    }
    setLoading(false);
  }

  async function changeStage(crId: string, stage: string, reqId: string) {
    await fetch(`/api/talent/requisitions/${reqId}/candidates/${crId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    await fetchCandidate();
  }

  async function parseCv(cvVersionId: string) {
    setParsing(true);
    try {
      const res = await fetch("/api/talent/ai/parse-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvVersionId }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "CV parsing failed");
      }
      await fetchCandidate();
    } catch {
      alert("CV parsing failed");
    }
    setParsing(false);
  }

  async function calculateFitScore(crId: string, reqId: string) {
    setScoring(true);
    try {
      const res = await fetch("/api/talent/ai/fit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, requisitionId: reqId }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Fit scoring failed");
      }
      await fetchCandidate();
    } catch {
      alert("Fit scoring failed");
    }
    setScoring(false);
  }

  async function addComment(crId: string, reqId: string) {
    if (!comment.trim()) return;
    setSendingComment(true);
    await fetch(`/api/talent/requisitions/${reqId}/candidates/${crId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment, action: "COMMENT" }),
    });
    setComment("");
    setSendingComment(false);
    await fetchCandidate();
  }

  if (loading || !candidate) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  const skills: string[] = candidate.skills ? JSON.parse(candidate.skills) : [];
  const activeCv = candidate.cvVersions.find((cv: any) => cv.isActive);
  const selectedCr = candidate.requisitions.find((r: any) => r.id === selectedReq);

  return (
    <div>
      <Link href="/talent/candidates" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Candidates
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xl">
          {candidate.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0A102F]">{candidate.name}</h1>
          <p className="text-gray-500 text-sm">
            {candidate.currentRole} {candidate.currentCompany ? `at ${candidate.currentCompany}` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Grid */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A102F] mb-4">Profile</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {candidate.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" /> {candidate.email}
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" /> {candidate.phone}
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" /> {candidate.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-4 h-4 text-gray-400" /> {candidate.experienceYears} years experience
              </div>
              {candidate.noticePeriod && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" /> Notice: {candidate.noticePeriod}
                </div>
              )}
              {candidate.currentCtc && <div className="text-gray-600">Current CTC: {candidate.currentCtc}</div>}
              {candidate.expectedCtc && <div className="text-gray-600">Expected CTC: {candidate.expectedCtc}</div>}
            </div>
            {skills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CV */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0A102F]">CV / Resume</h2>
              <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#3147FF] font-medium cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                <Upload className="w-4 h-4" /> Upload New
                <input type="file" className="hidden" accept=".pdf,.docx" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("candidateId", candidate.id);
                  await fetch("/api/talent/upload/cv", { method: "POST", body: formData });
                  await fetchCandidate();
                }} />
              </label>
            </div>
            {candidate.cvVersions.length === 0 ? (
              <p className="text-sm text-gray-400">No CV uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {candidate.cvVersions.map((cv: any) => (
                  <div key={cv.id} className={`flex items-center justify-between p-3 rounded-lg ${cv.isActive ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-[#0A102F]">{cv.fileName}</p>
                        <p className="text-xs text-gray-500">
                          v{cv.version} &middot; {cv.fileType} &middot; {(cv.fileSize / 1024).toFixed(0)}KB
                          &middot; {cv.parseStatus}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cv.parseStatus === "PENDING" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); parseCv(cv.id); }}
                          disabled={parsing}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          {parsing ? "Parsing..." : "AI Parse"}
                        </button>
                      )}
                      {cv.parseStatus === "PARSING" && (
                        <span className="text-xs text-amber-600 font-medium">Parsing...</span>
                      )}
                      {cv.parseStatus === "PARSED" && (
                        <span className="text-xs text-green-600 font-medium">Parsed</span>
                      )}
                      {cv.parseStatus === "FAILED" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); parseCv(cv.id); }}
                          disabled={parsing}
                          className="text-xs text-red-600 font-medium hover:underline"
                        >
                          Retry Parse
                        </button>
                      )}
                      {cv.isActive && <span className="text-xs text-blue-600 font-medium">Active</span>}
                      <a href={cv.fileUrl} target="_blank" className="text-xs text-[#3147FF] hover:underline">View</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Screening per requisition */}
          {candidate.requisitions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-[#0A102F] mb-4">Screening Pipeline</h2>

              {/* Requisition tabs */}
              {candidate.requisitions.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {candidate.requisitions.map((cr: any) => (
                    <button
                      key={cr.id}
                      onClick={() => setSelectedReq(cr.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedReq === cr.id ? "bg-[#3147FF] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cr.requisition.title}
                    </button>
                  ))}
                </div>
              )}

              {selectedCr && (
                <div>
                  {/* Current stage + actions */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-gray-500">Stage:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[selectedCr.stage] || "bg-gray-100"}`}>
                      {selectedCr.stage.replace(/_/g, " ")}
                    </span>
                    {selectedCr.fitScore !== null && (
                      <span className="text-sm font-medium text-[#0A102F]">Fit: {selectedCr.fitScore}%</span>
                    )}
                    <button
                      onClick={() => calculateFitScore(selectedCr.id, selectedCr.requisitionId)}
                      disabled={scoring}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50 ml-auto"
                    >
                      <BarChart3 className="w-3 h-3" />
                      {scoring ? "Scoring..." : selectedCr.fitScore !== null ? "Re-score" : "AI Fit Score"}
                    </button>
                  </div>

                  {/* Stage change buttons */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedCr.stage !== "SHORTLISTED" && selectedCr.stage !== "SELECTED" && (
                      <button
                        onClick={() => changeStage(selectedCr.id, "SHORTLISTED", selectedCr.requisitionId)}
                        className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                      >
                        Shortlist
                      </button>
                    )}
                    {selectedCr.stage !== "PIPELINE" && selectedCr.stage !== "SELECTED" && (
                      <button
                        onClick={() => changeStage(selectedCr.id, "PIPELINE", selectedCr.requisitionId)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                      >
                        Move to Pipeline
                      </button>
                    )}
                    {selectedCr.stage !== "REJECTED" && selectedCr.stage !== "SELECTED" && (
                      <button
                        onClick={() => changeStage(selectedCr.id, "REJECTED", selectedCr.requisitionId)}
                        className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                      >
                        Reject
                      </button>
                    )}
                    {(selectedCr.stage === "SHORTLISTED") && (
                      <button
                        onClick={() => changeStage(selectedCr.id, "PUSHED_TO_CLIENT", selectedCr.requisitionId)}
                        className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
                      >
                        Push to Client
                      </button>
                    )}
                    {selectedCr.stage === "CLIENT_APPROVED" && (
                      <button
                        onClick={() => changeStage(selectedCr.id, "SELECTED", selectedCr.requisitionId)}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        Mark as Selected
                      </button>
                    )}
                    {!["REJECTED", "CLIENT_REJECTED", "SELECTED"].includes(selectedCr.stage) && (
                      <Link
                        href={`/talent/interviews/schedule?crId=${selectedCr.id}&candidateId=${candidate.id}&requisitionId=${selectedCr.requisitionId}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule Interview
                      </Link>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-semibold text-[#0A102F] mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Activity & Comments
                    </h3>

                    {/* Add comment */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        onKeyDown={(e) => { if (e.key === "Enter") addComment(selectedCr.id, selectedCr.requisitionId); }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                      />
                      <button
                        onClick={() => addComment(selectedCr.id, selectedCr.requisitionId)}
                        disabled={sendingComment || !comment.trim()}
                        className="px-3 py-2 bg-[#3147FF] text-white rounded-lg hover:bg-[#2a3de6] disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Comment list */}
                    <div className="space-y-3">
                      {selectedCr.reviewComments.map((rc: any) => (
                        <div key={rc.id} className="flex gap-3">
                          <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 mt-0.5">
                            {rc.author.name?.[0] || "?"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#0A102F]">{rc.author.name}</span>
                              <span className={`text-xs font-medium ${actionColors[rc.action] || "text-gray-500"}`}>
                                {rc.action.replace(/_/g, " ")}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(rc.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {rc.comment && <p className="text-sm text-gray-600 mt-0.5">{rc.comment}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A102F] mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Requisitions</span>
                <span className="font-medium">{candidate.requisitions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Interviews</span>
                <span className="font-medium">{candidate.interviews.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CV Versions</span>
                <span className="font-medium">{candidate.cvVersions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Source</span>
                <span className="font-medium">{candidate.source || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Added</span>
                <span>{new Date(candidate.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Linked requisitions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A102F] mb-4">Requisitions</h2>
            {candidate.requisitions.length === 0 ? (
              <p className="text-sm text-gray-400">Not assigned to any requisition</p>
            ) : (
              <div className="space-y-2">
                {candidate.requisitions.map((cr: any) => (
                  <Link
                    key={cr.id}
                    href={`/talent/requisitions/${cr.requisitionId}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-[#0A102F]">{cr.requisition.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{cr.requisition.client.name}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${stageColors[cr.stage] || "bg-gray-100"}`}>
                        {cr.stage.replace(/_/g, " ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
