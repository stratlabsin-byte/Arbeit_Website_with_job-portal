"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, Clock,
  FileText, Upload, MessageSquare, Send, Sparkles, BarChart3, Calendar,
  Trash2, Plus, X, AlertTriangle, LinkedinIcon, GraduationCap, Download,
  Building2,
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
  const [activeTab, setActiveTab] = useState<"profile" | "cv" | "pipeline">("profile");

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Assign requisition state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allRequisitions, setAllRequisitions] = useState<any[]>([]);
  const [reqSearch, setReqSearch] = useState("");
  const [assigning, setAssigning] = useState(false);

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

  async function calculateFitScoreAction(_crId: string, reqId: string) {
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

  async function deleteCandidate() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/talent/candidates/${candidateId}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Delete failed");
        setDeleting(false);
        return;
      }
      router.push("/talent/candidates");
    } catch {
      alert("Delete failed");
      setDeleting(false);
    }
  }

  async function fetchRequisitions() {
    const res = await fetch("/api/talent/requisitions?limit=100");
    if (res.ok) {
      const json = await res.json();
      setAllRequisitions(json.data || []);
    }
  }

  async function assignToRequisition(requisitionId: string) {
    setAssigning(true);
    try {
      const res = await fetch(`/api/talent/requisitions/${requisitionId}/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Assignment failed");
      } else {
        setShowAssignModal(false);
        setReqSearch("");
        await fetchCandidate();
      }
    } catch {
      alert("Assignment failed");
    }
    setAssigning(false);
  }

  function openAssignModal() {
    setShowAssignModal(true);
    fetchRequisitions();
  }

  if (loading || !candidate) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  const skills: string[] = candidate.skills ? JSON.parse(candidate.skills) : [];
  const selectedCr = candidate.requisitions.find((r: any) => r.id === selectedReq);
  const activeCv = candidate.cvVersions.find((cv: any) => cv.isActive);
  const parsedData = activeCv?.parsedData ? JSON.parse(activeCv.parsedData) : null;

  // Filter requisitions for assign modal
  const assignedReqIds = new Set(candidate.requisitions.map((r: any) => r.requisitionId));
  const filteredRequisitions = allRequisitions.filter(
    (r) =>
      !assignedReqIds.has(r.id) &&
      (r.title.toLowerCase().includes(reqSearch.toLowerCase()) ||
        r.client?.name?.toLowerCase().includes(reqSearch.toLowerCase()))
  );

  return (
    <div>
      {/* Back + Actions bar */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/talent/candidates" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to Candidates
        </Link>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      {/* ========== HEADER CARD ========== */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-[#3147FF] to-indigo-400 rounded-xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {candidate.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#0A102F]">{candidate.name}</h1>
              {candidate.linkedinUrl && (
                <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                  <LinkedinIcon className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Quick stats row like Resdex */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-gray-400" /> {candidate.experienceYears}y
              </span>
              {candidate.currentCtc && (
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-gray-400" /> {candidate.currentCtc}
                </span>
              )}
              {candidate.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" /> {candidate.location}
                </span>
              )}
              {candidate.noticePeriod && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" /> {candidate.noticePeriod}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-sm text-gray-500">
              {candidate.currentRole && (
                <span>
                  <span className="text-gray-400">Previous: </span>
                  {candidate.currentRole}{candidate.currentCompany ? ` at ${candidate.currentCompany}` : ""}
                </span>
              )}
              {parsedData?.education?.[0] && (
                <span>
                  <span className="text-gray-400">Highest degree: </span>
                  {parsedData.education[0].degree} {parsedData.education[0].institution ? `— ${parsedData.education[0].institution}` : ""}
                </span>
              )}
            </div>

            {/* Contact row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-sm">
              {candidate.phone && (
                <span className="flex items-center gap-1.5 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" /> {candidate.phone}
                </span>
              )}
              {candidate.email && (
                <span className="flex items-center gap-1.5 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" /> {candidate.email}
                </span>
              )}
            </div>
          </div>

          {/* Right side quick stats */}
          <div className="hidden md:flex flex-col gap-2 text-right text-sm flex-shrink-0">
            <div>
              <span className="text-gray-400 text-xs">Source</span>
              <p className="font-medium text-[#0A102F]">{candidate.source || "Unknown"}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Added</span>
              <p className="font-medium text-[#0A102F]">{new Date(candidate.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========== MAIN COLUMN ========== */}
        <div className="lg:col-span-2 space-y-0">

          {/* Tab bar */}
          <div className="bg-white rounded-t-xl border border-gray-200 border-b-0">
            <div className="flex">
              {[
                { key: "profile" as const, label: "Profile Detail" },
                { key: "cv" as const, label: "Attached CV" },
                { key: "pipeline" as const, label: `Pipeline (${candidate.requisitions.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-[#3147FF] text-[#3147FF]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-b-xl border border-gray-200 border-t-0">

            {/* ---- PROFILE DETAIL TAB ---- */}
            {activeTab === "profile" && (
              <div className="p-6 space-y-8">
                {/* Headline / Summary */}
                {parsedData?.summary && (
                  <div>
                    <div className="border-l-4 border-[#3147FF] pl-4 py-2 bg-gray-50 rounded-r-lg">
                      <p className="text-sm text-gray-700 leading-relaxed">{parsedData.summary}</p>
                    </div>
                  </div>
                )}

                {/* Key Skills */}
                {skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[#0A102F] mb-3">Key skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <span key={s} className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg text-sm border border-gray-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Summary (if different from summary) */}
                {!parsedData?.summary && !skills.length && (
                  <p className="text-sm text-gray-400">No parsed profile data yet. Upload and parse a CV to see detailed profile.</p>
                )}

                {/* Work Experience */}
                {parsedData?.experience?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[#0A102F] mb-4">Work experience</h3>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200" />

                      <div className="space-y-6">
                        {parsedData.experience.map((exp: any, i: number) => (
                          <div key={i} className="flex gap-4 relative">
                            <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 z-10">
                              <Building2 className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[#0A102F]">
                                {exp.role} {exp.company ? `at ${exp.company}` : ""}
                              </p>
                              {exp.duration && (
                                <p className="text-sm text-gray-500 mt-0.5">{exp.duration}</p>
                              )}
                              {exp.description && (
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-line">{exp.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Education */}
                {parsedData?.education?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[#0A102F] mb-4">Education</h3>
                    <div className="space-y-3">
                      {parsedData.education.map((edu: any, i: number) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#0A102F]">
                              {edu.degree}
                              {edu.year ? `, ${edu.year}` : ""}
                            </p>
                            {edu.institution && (
                              <p className="text-sm text-gray-500">{edu.institution}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other details */}
                <div>
                  <h3 className="text-lg font-bold text-[#0A102F] mb-3">Other details</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    {candidate.expectedCtc && (
                      <>
                        <span className="text-gray-400">Expected CTC</span>
                        <span className="text-[#0A102F] font-medium">{candidate.expectedCtc}</span>
                      </>
                    )}
                    {candidate.currentCtc && (
                      <>
                        <span className="text-gray-400">Current CTC</span>
                        <span className="text-[#0A102F] font-medium">{candidate.currentCtc}</span>
                      </>
                    )}
                    {candidate.noticePeriod && (
                      <>
                        <span className="text-gray-400">Notice Period</span>
                        <span className="text-[#0A102F] font-medium">{candidate.noticePeriod}</span>
                      </>
                    )}
                    <span className="text-gray-400">Source</span>
                    <span className="text-[#0A102F] font-medium">{candidate.source || "Unknown"}</span>
                    <span className="text-gray-400">Added on</span>
                    <span className="text-[#0A102F] font-medium">{new Date(candidate.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ---- ATTACHED CV TAB ---- */}
            {activeTab === "cv" && (
              <div className="p-6">
                {candidate.cvVersions.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No CV uploaded yet</p>
                ) : (
                  <div className="space-y-4">
                    {candidate.cvVersions.map((cv: any) => (
                      <div key={cv.id} className={`rounded-lg border ${cv.isActive ? "border-blue-200 bg-blue-50/30" : "border-gray-200"}`}>
                        <div className="flex items-center justify-between p-4">
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
                                onClick={() => parseCv(cv.id)}
                                disabled={parsing}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50"
                              >
                                <Sparkles className="w-3 h-3" />
                                {parsing ? "Parsing..." : "AI Parse"}
                              </button>
                            )}
                            {cv.parseStatus === "PARSED" && (
                              <span className="text-xs text-green-600 font-medium">Parsed</span>
                            )}
                            {cv.parseStatus === "FAILED" && (
                              <button onClick={() => parseCv(cv.id)} disabled={parsing} className="text-xs text-red-600 font-medium hover:underline">
                                Retry Parse
                              </button>
                            )}
                            {cv.isActive && <span className="text-xs text-blue-600 font-medium">Active</span>}
                            <a href={cv.fileUrl} target="_blank" className="flex items-center gap-1 text-xs text-[#3147FF] hover:underline">
                              <Download className="w-3 h-3" /> Download
                            </a>
                          </div>
                        </div>

                        {/* CV Preview - show rendered PDF if active */}
                        {cv.isActive && cv.fileType === "PDF" && (
                          <div className="border-t border-gray-200">
                            <iframe
                              src={cv.fileUrl}
                              className="w-full rounded-b-lg"
                              style={{ height: "600px" }}
                              title="CV Preview"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center justify-center gap-2 mt-4 px-4 py-3 text-sm text-[#3147FF] font-medium cursor-pointer hover:bg-blue-50 rounded-lg transition-colors border-2 border-dashed border-gray-300 hover:border-[#3147FF]">
                  <Upload className="w-4 h-4" /> Upload New CV
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
            )}

            {/* ---- PIPELINE TAB ---- */}
            {activeTab === "pipeline" && (
              <div className="p-6">
                {candidate.requisitions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 mb-3">Not assigned to any requisition yet</p>
                    <button
                      onClick={openAssignModal}
                      className="px-4 py-2 text-sm font-medium text-[#3147FF] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                    >
                      <Plus className="w-4 h-4 inline mr-1" /> Assign to Requisition
                    </button>
                  </div>
                ) : (
                  <div>
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
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          <span className="text-sm text-gray-500">Stage:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[selectedCr.stage] || "bg-gray-100"}`}>
                            {selectedCr.stage.replace(/_/g, " ")}
                          </span>
                          {selectedCr.fitScore !== null && (
                            <span className={`text-sm font-bold ${
                              selectedCr.fitScore >= 75 ? "text-green-600" :
                              selectedCr.fitScore >= 50 ? "text-amber-600" : "text-red-600"
                            }`}>
                              Fit Score: {selectedCr.fitScore}%
                            </span>
                          )}
                          <button
                            onClick={() => calculateFitScoreAction(selectedCr.id, selectedCr.requisitionId)}
                            disabled={scoring}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50 ml-auto"
                          >
                            <BarChart3 className="w-3 h-3" />
                            {scoring ? "Scoring..." : selectedCr.fitScore !== null ? "Re-score" : "AI Fit Score"}
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {selectedCr.stage !== "SHORTLISTED" && selectedCr.stage !== "SELECTED" && (
                            <button onClick={() => changeStage(selectedCr.id, "SHORTLISTED", selectedCr.requisitionId)}
                              className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
                              Shortlist
                            </button>
                          )}
                          {selectedCr.stage !== "PIPELINE" && selectedCr.stage !== "SELECTED" && (
                            <button onClick={() => changeStage(selectedCr.id, "PIPELINE", selectedCr.requisitionId)}
                              className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
                              Move to Pipeline
                            </button>
                          )}
                          {selectedCr.stage !== "REJECTED" && selectedCr.stage !== "SELECTED" && (
                            <button onClick={() => changeStage(selectedCr.id, "REJECTED", selectedCr.requisitionId)}
                              className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                              Reject
                            </button>
                          )}
                          {selectedCr.stage === "SHORTLISTED" && (
                            <button onClick={() => changeStage(selectedCr.id, "PUSHED_TO_CLIENT", selectedCr.requisitionId)}
                              className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100">
                              Push to Client
                            </button>
                          )}
                          {selectedCr.stage === "CLIENT_APPROVED" && (
                            <button onClick={() => changeStage(selectedCr.id, "SELECTED", selectedCr.requisitionId)}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                              Mark as Selected
                            </button>
                          )}
                          {!["REJECTED", "CLIENT_REJECTED", "SELECTED"].includes(selectedCr.stage) && (
                            <Link href={`/talent/interviews/schedule?crId=${selectedCr.id}&candidateId=${candidate.id}&requisitionId=${selectedCr.requisitionId}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100">
                              <Calendar className="w-4 h-4" /> Schedule Interview
                            </Link>
                          )}
                        </div>

                        {/* Comments */}
                        <div className="border-t border-gray-100 pt-4">
                          <h3 className="text-sm font-semibold text-[#0A102F] mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Activity & Comments
                          </h3>
                          <div className="flex gap-2 mb-4">
                            <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
                              placeholder="Add a comment..."
                              onKeyDown={(e) => { if (e.key === "Enter") addComment(selectedCr.id, selectedCr.requisitionId); }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20" />
                            <button onClick={() => addComment(selectedCr.id, selectedCr.requisitionId)}
                              disabled={sendingComment || !comment.trim()}
                              className="px-3 py-2 bg-[#3147FF] text-white rounded-lg hover:bg-[#2a3de6] disabled:opacity-50">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
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
                                    <span className="text-xs text-gray-400">{new Date(rc.createdAt).toLocaleDateString()}</span>
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
            )}
          </div>
        </div>

        {/* ========== SIDEBAR ========== */}
        <div className="space-y-6">
          {/* Summary card */}
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
              {/* Fit scores overview */}
              {candidate.requisitions.some((r: any) => r.fitScore !== null) && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Fit Scores</p>
                  {candidate.requisitions.filter((r: any) => r.fitScore !== null).map((cr: any) => (
                    <div key={cr.id} className="flex justify-between items-center mb-1">
                      <span className="text-gray-600 truncate mr-2">{cr.requisition.title}</span>
                      <span className={`font-bold text-sm ${
                        cr.fitScore >= 75 ? "text-green-600" :
                        cr.fitScore >= 50 ? "text-amber-600" : "text-red-600"
                      }`}>
                        {cr.fitScore}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Linked requisitions + Assign button */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0A102F]">Requisitions</h2>
              <button onClick={openAssignModal}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#3147FF] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
                <Plus className="w-3 h-3" /> Assign
              </button>
            </div>
            {candidate.requisitions.length === 0 ? (
              <p className="text-sm text-gray-400">Not assigned to any requisition</p>
            ) : (
              <div className="space-y-2">
                {candidate.requisitions.map((cr: any) => (
                  <Link key={cr.id} href={`/talent/requisitions/${cr.requisitionId}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                    <p className="text-sm font-medium text-[#0A102F]">{cr.requisition.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{cr.requisition.client.name}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${stageColors[cr.stage] || "bg-gray-100"}`}>
                        {cr.stage.replace(/_/g, " ")}
                      </span>
                      {cr.fitScore !== null && (
                        <span className={`text-xs font-bold ${
                          cr.fitScore >= 75 ? "text-green-600" :
                          cr.fitScore >= 50 ? "text-amber-600" : "text-red-600"
                        }`}>{cr.fitScore}%</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Interviews */}
          {candidate.interviews.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-[#0A102F] mb-4">Interviews</h2>
              <div className="space-y-2">
                {candidate.interviews.map((iv: any) => (
                  <div key={iv.id} className="p-3 rounded-lg bg-gray-50 text-sm">
                    <p className="font-medium text-[#0A102F]">Round {iv.round}</p>
                    <p className="text-xs text-gray-500">{iv.status} &middot; {new Date(iv.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0A102F]">Delete Candidate</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{candidate.name}</strong>? This will remove all their CVs,
              requisition assignments, comments, and interview records.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={deleteCandidate} disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete Candidate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== ASSIGN REQUISITION MODAL ========== */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAssignModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0A102F] text-lg">Assign to Requisition</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input type="text" placeholder="Search requisitions..." value={reqSearch}
              onChange={(e) => setReqSearch(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              autoFocus />
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {filteredRequisitions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  {allRequisitions.length === 0 ? "Loading requisitions..." : "No unassigned requisitions found"}
                </p>
              ) : (
                filteredRequisitions.map((req) => (
                  <button key={req.id} onClick={() => assignToRequisition(req.id)} disabled={assigning}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-[#3147FF] hover:bg-blue-50/30 transition-colors disabled:opacity-50">
                    <p className="text-sm font-medium text-[#0A102F]">{req.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{req.client?.name}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        req.status === "OPEN" ? "bg-green-100 text-green-700" :
                        req.status === "PUBLISHED" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{req.status}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              AI Fit Score will be auto-calculated after assignment if the candidate has a parsed CV.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
