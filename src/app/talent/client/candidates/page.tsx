"use client";

import { useEffect, useState } from "react";
import { Users, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";

interface CandidateForReview {
  id: string;
  stage: string;
  fitScore: number | null;
  candidate: {
    id: string;
    name: string;
    location: string | null;
    currentRole: string | null;
    currentCompany: string | null;
    experienceYears: number;
    cvVersions: {
      id: string;
      cvTextRedacted: string | null;
      parsedData: string | null;
      fileUrl: string;
    }[];
  };
  requisition: { id: string; title: string };
}

const stageColors: Record<string, string> = {
  PUSHED_TO_CLIENT: "bg-purple-100 text-purple-700",
  CLIENT_APPROVED: "bg-emerald-100 text-emerald-700",
  CLIENT_REJECTED: "bg-orange-100 text-orange-700",
  SELECTED: "bg-green-200 text-green-800",
};

export default function ClientCandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateForReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [acting, setActing] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    setLoading(true);
    const res = await fetch("/api/talent/client/candidates");
    const json = await res.json();
    setCandidates(json.data || []);
    setLoading(false);
  }

  async function handleAction(crId: string, action: "APPROVE" | "REJECT") {
    setActing(true);
    await fetch(`/api/talent/client/candidates/${crId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, comment: comment || undefined }),
    });
    setComment("");
    setExpandedId(null);
    await fetchCandidates();
    setActing(false);
  }

  const pendingReview = candidates.filter((c) => c.stage === "PUSHED_TO_CLIENT");
  const reviewed = candidates.filter((c) => c.stage !== "PUSHED_TO_CLIENT");

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A102F] mb-6">Candidate Review</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No candidates for review</p>
          <p className="text-gray-400 text-sm mt-1">Candidates will appear here once shortlisted by Arbeit&apos;s team</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Review */}
          {pendingReview.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[#0A102F] mb-4">
                Pending Review ({pendingReview.length})
              </h2>
              <div className="space-y-3">
                {pendingReview.map((cr) => {
                  const isExpanded = expandedId === cr.id;
                  const cv = cr.candidate.cvVersions[0];
                  const parsed = cv?.parsedData ? JSON.parse(cv.parsedData) : null;

                  return (
                    <div key={cr.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : cr.id)}
                        className="w-full p-5 flex items-center gap-4 text-left hover:bg-gray-50"
                      >
                        <div className="w-11 h-11 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">
                          {cr.candidate.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#0A102F]">{cr.candidate.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                            {cr.candidate.currentRole && <span>{cr.candidate.currentRole}</span>}
                            {cr.candidate.currentCompany && <span>at {cr.candidate.currentCompany}</span>}
                            <span>{cr.candidate.experienceYears} yrs</span>
                            {cr.candidate.location && <span>{cr.candidate.location}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {cr.fitScore !== null && (
                            <span className={`text-sm font-bold ${
                              cr.fitScore >= 70 ? "text-green-600" : cr.fitScore >= 40 ? "text-amber-600" : "text-red-600"
                            }`}>
                              {cr.fitScore}% fit
                            </span>
                          )}
                          <span className="text-xs text-gray-500">{cr.requisition.title}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-gray-100">
                          {/* Parsed CV Summary */}
                          {parsed && (
                            <div className="mt-4 space-y-3">
                              {parsed.summary && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Summary</h4>
                                  <p className="text-sm text-gray-700">{parsed.summary}</p>
                                </div>
                              )}
                              {parsed.skills?.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Skills</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {parsed.skills.map((s: string) => (
                                      <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{s}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {parsed.experience?.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Experience</h4>
                                  <div className="space-y-2">
                                    {parsed.experience.slice(0, 3).map((exp: any, i: number) => (
                                      <div key={i} className="text-sm">
                                        <span className="font-medium text-[#0A102F]">{exp.role}</span>
                                        <span className="text-gray-500"> at {exp.company}</span>
                                        {exp.duration && <span className="text-gray-400 text-xs ml-2">{exp.duration}</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Redacted CV text */}
                          {cv?.cvTextRedacted && (
                            <details className="mt-4">
                              <summary className="text-xs text-[#3147FF] cursor-pointer hover:underline">
                                View full CV (redacted)
                              </summary>
                              <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg max-h-60 overflow-y-auto">
                                {cv.cvTextRedacted}
                              </pre>
                            </details>
                          )}

                          {/* Action buttons */}
                          <div className="mt-5 pt-4 border-t border-gray-100">
                            <div className="mb-3">
                              <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Optional comment..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleAction(cr.id, "APPROVE")}
                                disabled={acting}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Approve
                              </button>
                              <button
                                onClick={() => handleAction(cr.id, "REJECT")}
                                disabled={acting}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" /> Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Already Reviewed */}
          {reviewed.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[#0A102F] mb-4">
                Reviewed ({reviewed.length})
              </h2>
              <div className="space-y-2">
                {reviewed.map((cr) => (
                  <div key={cr.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                      {cr.candidate.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#0A102F]">{cr.candidate.name}</h3>
                      <p className="text-xs text-gray-500">{cr.requisition.title}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${stageColors[cr.stage] || "bg-gray-100"}`}>
                      {cr.stage.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
