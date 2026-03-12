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
  Pencil,
  Globe,
  Save,
  X,
  RefreshCw,
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
  sourceUrl: string | null;
  job: { id: string; slug: string; status: string } | null;
  _count: { candidates: number };
}

interface EditForm {
  title: string;
  rawJd: string;
  description: string;
  department: string;
  location: string;
  city: string;
  workModel: string;
  jobType: string;
  experienceMin: number;
  experienceMax: number | null;
  ctcMin: number | null;
  ctcMax: number | null;
  noticePeriod: string;
  requiredSkills: string[];
  vacancies: number;
  priority: string;
  sourceUrl: string;
}

const statusActions: Record<string, { label: string; next: string; color: string }[]> = {
  OPEN: [
    { label: "Publish to Job Board", next: "PUBLISHED", color: "bg-green-600 hover:bg-green-700" },
    { label: "Put On Hold", next: "ON_HOLD", color: "bg-gray-600 hover:bg-gray-700" },
    { label: "Close", next: "CLOSED", color: "bg-red-600 hover:bg-red-700" },
  ],
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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [scoringAll, setScoringAll] = useState(false);
  const [scoringProgress, setScoringProgress] = useState("");

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

  async function scoreAllCandidates(reparseFirst = false) {
    if (!req) return;
    setScoringAll(true);
    const total = req.candidates.length;

    for (let i = 0; i < total; i++) {
      const cr = req.candidates[i];
      const candidateName = cr.candidate.name || `Candidate ${i + 1}`;

      // Step 1: Re-parse CV if requested
      const activeCvId = cr.candidate.cvVersions?.[0]?.id || cr.cvVersionId;
      if (reparseFirst && activeCvId) {
        setScoringProgress(`Re-parsing ${candidateName} (${i + 1}/${total})...`);
        try {
          const parseRes = await fetch("/api/talent/ai/parse-cv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cvVersionId: activeCvId, forceUpdate: true }),
          });
          if (!parseRes.ok) {
            const err = await parseRes.json().catch(() => ({}));
            console.error(`Parse failed for ${candidateName}:`, err.error || parseRes.status);
          }
        } catch (e: any) {
          console.error(`Parse error for ${candidateName}:`, e.message);
        }
      }

      // Step 2: Score
      setScoringProgress(`Scoring ${candidateName} (${i + 1}/${total})...`);
      try {
        const scoreRes = await fetch("/api/talent/ai/fit-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId: cr.candidate.id, requisitionId }),
        });
        if (!scoreRes.ok) {
          const err = await scoreRes.json().catch(() => ({}));
          console.error(`Score failed for ${candidateName}:`, err.error || scoreRes.status);
        }
      } catch (e: any) {
        console.error(`Score error for ${candidateName}:`, e.message);
      }
    }

    setScoringProgress("");
    await fetchRequisition();
    setScoringAll(false);
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

  function startEditing() {
    if (!req) return;
    const skills: string[] = req.requiredSkills ? JSON.parse(req.requiredSkills) : [];
    setEditForm({
      title: req.title,
      rawJd: req.rawJd || "",
      description: req.description || "",
      department: req.department || "",
      location: req.location || "",
      city: req.city || "",
      workModel: req.workModel,
      jobType: req.jobType,
      experienceMin: req.experienceMin,
      experienceMax: req.experienceMax,
      ctcMin: req.ctcMin,
      ctcMax: req.ctcMax,
      noticePeriod: req.noticePeriod || "",
      requiredSkills: skills,
      vacancies: req.vacancies,
      priority: req.priority,
      sourceUrl: req.sourceUrl || "",
    });
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setEditForm(null);
  }

  async function saveEdits() {
    if (!editForm) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/talent/requisitions/${requisitionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          rawJd: editForm.rawJd || null,
          description: editForm.description || null,
          department: editForm.department || null,
          location: editForm.location || null,
          city: editForm.city || null,
          workModel: editForm.workModel,
          jobType: editForm.jobType,
          experienceMin: editForm.experienceMin,
          experienceMax: editForm.experienceMax,
          ctcMin: editForm.ctcMin,
          ctcMax: editForm.ctcMax,
          noticePeriod: editForm.noticePeriod || null,
          requiredSkills: editForm.requiredSkills,
          vacancies: editForm.vacancies,
          priority: editForm.priority,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to save");
      } else {
        setEditing(false);
        setEditForm(null);
        await fetchRequisition();
      }
    } catch {
      alert("Failed to save changes");
    }
    setSaving(false);
  }

  async function refetchFromWebsite() {
    const url = editForm?.sourceUrl || req?.sourceUrl;
    if (!url) {
      alert("No source URL available. Enter a URL first.");
      return;
    }
    setRefetching(true);
    try {
      const res = await fetch("/api/talent/ai/refetch-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requisitionId, url }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to refetch");
        setRefetching(false);
        return;
      }
      const job = json.data.matchedJob;
      if (!job) {
        alert("No matching job found on the page");
        setRefetching(false);
        return;
      }
      // If in edit mode, update the form; otherwise enter edit mode with new data
      const newForm: EditForm = {
        title: job.title || editForm?.title || req?.title || "",
        rawJd: job.description || editForm?.rawJd || "",
        description: job.description || editForm?.description || "",
        department: job.department || editForm?.department || "",
        location: job.location || editForm?.location || "",
        city: editForm?.city || req?.city || "",
        workModel: mapWorkModelLocal(job.workModel) || editForm?.workModel || "ONSITE",
        jobType: mapJobTypeLocal(job.jobType) || editForm?.jobType || "FULL_TIME",
        experienceMin: job.experienceMin ?? editForm?.experienceMin ?? 0,
        experienceMax: job.experienceMax ?? editForm?.experienceMax ?? null,
        ctcMin: editForm?.ctcMin ?? null,
        ctcMax: editForm?.ctcMax ?? null,
        noticePeriod: editForm?.noticePeriod || "",
        requiredSkills: job.skills?.length ? job.skills : editForm?.requiredSkills || [],
        vacancies: editForm?.vacancies ?? 1,
        priority: editForm?.priority || "MEDIUM",
        sourceUrl: url,
      };
      setEditForm(newForm);
      setEditing(true);
    } catch {
      alert("Failed to refetch from website");
    }
    setRefetching(false);
  }

  function mapWorkModelLocal(v: string | null): string {
    if (!v) return "ONSITE";
    const u = v.toUpperCase();
    if (u.includes("REMOTE")) return "REMOTE";
    if (u.includes("HYBRID")) return "HYBRID";
    return "ONSITE";
  }

  function mapJobTypeLocal(v: string | null): string {
    if (!v) return "FULL_TIME";
    const u = v.toUpperCase();
    if (u.includes("PART")) return "PART_TIME";
    if (u.includes("CONTRACT")) return "CONTRACT";
    if (u.includes("INTERN")) return "INTERNSHIP";
    return "FULL_TIME";
  }

  function updateFormField(field: keyof EditForm, value: any) {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  }

  function addSkill(skill: string) {
    if (!editForm || !skill.trim()) return;
    if (!editForm.requiredSkills.includes(skill.trim())) {
      setEditForm({ ...editForm, requiredSkills: [...editForm.requiredSkills, skill.trim()] });
    }
  }

  function removeSkill(skill: string) {
    if (!editForm) return;
    setEditForm({ ...editForm, requiredSkills: editForm.requiredSkills.filter((s) => s !== skill) });
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
            {editing ? (
              <input
                type="text"
                value={editForm?.title || ""}
                onChange={(e) => updateFormField("title", e.target.value)}
                className="text-2xl font-bold text-[#0A102F] border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none"
              />
            ) : (
              <h1 className="text-2xl font-bold text-[#0A102F]">{req.title}</h1>
            )}
            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                req.status === "PUBLISHED"
                  ? "bg-green-100 text-green-700"
                  : req.status === "OPEN"
                  ? "bg-blue-100 text-blue-700"
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={saveEdits}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#3147FF] rounded-lg hover:bg-[#2a3de6] disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={cancelEditing}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#3147FF] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              {(req.sourceUrl) && (
                <button
                  onClick={refetchFromWebsite}
                  disabled={refetching}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${refetching ? "animate-spin" : ""}`} />
                  {refetching ? "Refetching..." : "Refetch from Website"}
                </button>
              )}
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
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A102F] mb-4">Requirements</h2>
            {editing && editForm ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Department</label>
                    <input type="text" value={editForm.department} onChange={(e) => updateFormField("department", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Location</label>
                    <input type="text" value={editForm.location} onChange={(e) => updateFormField("location", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Work Model</label>
                    <select value={editForm.workModel} onChange={(e) => updateFormField("workModel", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none">
                      <option value="ONSITE">Onsite</option>
                      <option value="REMOTE">Remote</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Job Type</label>
                    <select value={editForm.jobType} onChange={(e) => updateFormField("jobType", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none">
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Experience Min (years)</label>
                    <input type="number" value={editForm.experienceMin} onChange={(e) => updateFormField("experienceMin", parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Experience Max (years)</label>
                    <input type="number" value={editForm.experienceMax ?? ""} onChange={(e) => updateFormField("experienceMax", e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">CTC Min (LPA)</label>
                    <input type="number" value={editForm.ctcMin ?? ""} onChange={(e) => updateFormField("ctcMin", e.target.value ? parseFloat(e.target.value) : null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">CTC Max (LPA)</label>
                    <input type="number" value={editForm.ctcMax ?? ""} onChange={(e) => updateFormField("ctcMax", e.target.value ? parseFloat(e.target.value) : null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Notice Period</label>
                    <input type="text" value={editForm.noticePeriod} onChange={(e) => updateFormField("noticePeriod", e.target.value)} placeholder="e.g. 30 days" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Vacancies</label>
                    <input type="number" value={editForm.vacancies} onChange={(e) => updateFormField("vacancies", parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Priority</label>
                    <select value={editForm.priority} onChange={(e) => updateFormField("priority", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>
                {/* Skills editor */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Required Skills</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editForm.requiredSkills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="text-blue-400 hover:text-blue-600"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                </div>
                {/* Source URL */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Source URL (Client Website)</label>
                  <div className="flex gap-2">
                    <input type="url" value={editForm.sourceUrl} onChange={(e) => updateFormField("sourceUrl", e.target.value)} placeholder="https://example.com/careers" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none" />
                    <button
                      onClick={refetchFromWebsite}
                      disabled={refetching || !editForm.sourceUrl}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                    >
                      <Globe className={`w-4 h-4 ${refetching ? "animate-spin" : ""}`} />
                      {refetching ? "Fetching..." : "Refetch"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
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

                {req.sourceUrl && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Source</p>
                    <a href={req.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-[#3147FF] hover:underline">
                      <Globe className="w-3.5 h-3.5" />
                      {new URL(req.sourceUrl).hostname}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          {/* JD */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0A102F]">Job Description</h2>
              {!editing && req.rawJd && (
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
            {editing && editForm ? (
              <textarea
                value={editForm.rawJd}
                onChange={(e) => updateFormField("rawJd", e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#3147FF] focus:border-transparent outline-none resize-y"
                placeholder="Paste the full job description here..."
              />
            ) : req.polishedJd ? (
              <div>
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: (req.polishedJd || "").replace(/^```(?:html)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim() }}
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
            ) : (req.rawJd || req.description) ? (
              <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {req.rawJd || req.description}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No job description available. Click Edit to add one.</p>
            )}
          </div>

          {/* Candidates Pipeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0A102F]">
                Candidates ({req._count.candidates})
              </h2>
              <div className="flex items-center gap-3">
                {req.candidates.length > 0 && (
                  <>
                    <button
                      onClick={() => scoreAllCandidates(true)}
                      disabled={scoringAll}
                      className="text-sm text-purple-700 font-medium bg-purple-50 border border-purple-200 px-3 py-1 rounded-lg hover:bg-purple-100 disabled:opacity-50"
                    >
                      {scoringAll ? scoringProgress || "Processing..." : "Re-parse & Score All"}
                    </button>
                    <button
                      onClick={() => scoreAllCandidates(false)}
                      disabled={scoringAll}
                      className="text-sm text-amber-700 font-medium bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg hover:bg-amber-100 disabled:opacity-50"
                    >
                      {scoringAll ? "..." : "Score Only"}
                    </button>
                  </>
                )}
                <Link
                  href={`/talent/candidates/new?requisitionId=${req.id}`}
                  className="text-sm text-[#3147FF] font-medium hover:underline"
                >
                  + Add Candidate
                </Link>
              </div>
            </div>
            {req.candidates.length === 0 ? (
              <p className="text-sm text-gray-400">No candidates yet. Upload CVs or wait for applications.</p>
            ) : (
              <div className="space-y-2">
                {req.candidates.map((cr: any) => (
                  <Link
                    key={cr.id}
                    href={`/talent/candidates/${cr.candidate.id}`}
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
                        <span className={`text-sm font-bold ${
                          cr.fitScore >= 75 ? "text-green-600" :
                          cr.fitScore >= 50 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {cr.fitScore}%
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${stageColors[cr.stage] || "bg-gray-100 text-gray-500"}`}>
                        {cr.stage.replace(/_/g, " ")}
                      </span>
                      <span className="text-gray-300">&rsaquo;</span>
                    </div>
                  </Link>
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
