"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle2,
  Sparkles,
  X,
  FileText,
  AlertCircle,
  Users,
  UserPlus,
} from "lucide-react";

interface BulkFile {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  candidateName?: string;
  candidateId?: string;
  error?: string;
}

export default function NewCandidatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requisitionId = searchParams.get("requisitionId") || "";

  // Tab: "single" or "bulk"
  const [mode, setMode] = useState<"single" | "bulk">("single");

  // --- Single candidate state ---
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    currentCompany: "",
    currentRole: "",
    experienceYears: 0,
    currentCtc: "",
    expectedCtc: "",
    noticePeriod: "",
    linkedinUrl: "",
    source: "UPLOAD",
  });

  // --- Bulk upload state ---
  const [bulkFiles, setBulkFiles] = useState<BulkFile[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // --- Single file handler ---
  async function handleFileSelect(file: File | null) {
    if (!file) return;
    setCvFile(file);
    setParsed(false);
    setParsing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/talent/ai/parse-cv-quick", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to parse CV");

      const data = json.data;

      setForm((prev) => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        location: data.location || prev.location,
        currentCompany: data.currentCompany || prev.currentCompany,
        currentRole: data.currentRole || prev.currentRole,
        experienceYears: data.experienceYears || prev.experienceYears,
      }));
      setSkills(data.skills || []);
      setParsed(true);
    } catch (err: any) {
      setError(
        `CV uploaded but auto-fill failed: ${err.message}. You can fill the form manually.`
      );
    } finally {
      setParsing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError("");

    const res = await fetch("/api/talent/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        skills: skills.length > 0 ? skills : undefined,
        requisitionId: requisitionId || undefined,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to create candidate");
      setSaving(false);
      return;
    }

    const candidateId = json.data.id;

    if (cvFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", cvFile);
      formData.append("candidateId", candidateId);

      const uploadRes = await fetch("/api/talent/upload/cv", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const uploadJson = await uploadRes.json();
        setError(
          `Candidate created but CV upload failed: ${uploadJson.error}`
        );
        setSaving(false);
        setUploading(false);
        router.push(`/talent/candidates/${candidateId}`);
        return;
      }
      setUploading(false);
    }

    router.push(`/talent/candidates/${candidateId}`);
  }

  // --- Bulk upload handlers ---
  const addFiles = useCallback((files: FileList | File[]) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const newFiles: BulkFile[] = [];

    for (const file of Array.from(files)) {
      if (!validTypes.includes(file.type)) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      // Avoid duplicates
      newFiles.push({ file, status: "pending" });
    }

    setBulkFiles((prev) => [...prev, ...newFiles]);
  }, []);

  function removeBulkFile(index: number) {
    setBulkFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      if (mode === "bulk") {
        addFiles(e.dataTransfer.files);
      } else {
        // Single mode - take first file
        handleFileSelect(e.dataTransfer.files[0]);
      }
    }
  }

  async function processBulkUpload() {
    if (bulkFiles.length === 0) return;
    setBulkProcessing(true);

    for (let i = 0; i < bulkFiles.length; i++) {
      if (bulkFiles[i].status === "done") continue;

      setBulkFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading" } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append("file", bulkFiles[i].file);
        if (requisitionId) {
          formData.append("requisitionId", requisitionId);
        }

        const res = await fetch("/api/talent/candidates/bulk-upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Upload failed");

        setBulkFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: "done",
                  candidateName: json.data.candidate.name,
                  candidateId: json.data.candidate.id,
                }
              : f
          )
        );
      } catch (err: any) {
        setBulkFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", error: err.message } : f
          )
        );
      }
    }

    setBulkProcessing(false);
  }

  const doneCount = bulkFiles.filter((f) => f.status === "done").length;
  const errorCount = bulkFiles.filter((f) => f.status === "error").length;
  const pendingCount = bulkFiles.filter(
    (f) => f.status === "pending" || f.status === "uploading"
  ).length;

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/talent/candidates"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Candidates
      </Link>

      <h1 className="text-2xl font-bold text-[#0A102F] mb-6">
        Add New Candidate
      </h1>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("single")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "single"
              ? "bg-[#3147FF] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Single Candidate
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "bulk"
              ? "bg-[#3147FF] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Users className="w-4 h-4" />
          Bulk CV Upload
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* ======================== BULK UPLOAD MODE ======================== */}
      {mode === "bulk" && (
        <div className="space-y-6">
          {/* Drop zone */}
          <div
            className={`bg-white rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragOver
                ? "border-[#3147FF] bg-indigo-50/50"
                : "border-gray-300 hover:border-[#3147FF]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => bulkInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">
              Drag & drop multiple CVs here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              or click to browse — PDF and DOCX files accepted (max 10MB each)
            </p>
            <input
              ref={bulkInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {/* File list */}
          {bulkFiles.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0A102F]">
                  {bulkFiles.length} file{bulkFiles.length !== 1 ? "s" : ""}{" "}
                  selected
                </span>
                {doneCount > 0 && (
                  <span className="text-xs text-green-600 font-medium">
                    {doneCount} processed
                    {errorCount > 0 && `, ${errorCount} failed`}
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {bulkFiles.map((bf, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50"
                  >
                    <FileText
                      className={`w-5 h-5 flex-shrink-0 ${
                        bf.status === "done"
                          ? "text-green-500"
                          : bf.status === "error"
                          ? "text-red-500"
                          : bf.status === "uploading"
                          ? "text-[#3147FF]"
                          : "text-gray-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">
                        {bf.file.name}
                      </p>
                      {bf.status === "uploading" && (
                        <p className="text-xs text-[#3147FF] flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Parsing & creating candidate...
                        </p>
                      )}
                      {bf.status === "done" && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Created: {bf.candidateName}
                        </p>
                      )}
                      {bf.status === "error" && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {bf.error}
                        </p>
                      )}
                      {bf.status === "pending" && (
                        <p className="text-xs text-gray-400">
                          {(bf.file.size / 1024).toFixed(0)} KB — ready
                        </p>
                      )}
                    </div>
                    {bf.status === "done" && bf.candidateId ? (
                      <Link
                        href={`/talent/candidates/${bf.candidateId}`}
                        className="text-xs text-[#3147FF] hover:underline flex-shrink-0"
                      >
                        View
                      </Link>
                    ) : bf.status !== "uploading" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBulkFile(i);
                        }}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bulk actions */}
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400">
              AI will parse each CV and auto-create candidates with extracted
              info
            </p>
            <div className="flex gap-3">
              {bulkFiles.length > 0 && !bulkProcessing && doneCount < bulkFiles.length && (
                <button
                  onClick={() => setBulkFiles([])}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Clear All
                </button>
              )}
              {doneCount === bulkFiles.length && bulkFiles.length > 0 ? (
                <button
                  onClick={() => router.push("/talent/candidates")}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Done — View Candidates
                </button>
              ) : (
                <button
                  onClick={processBulkUpload}
                  disabled={
                    bulkProcessing || bulkFiles.length === 0 || pendingCount === 0
                  }
                  className="px-6 py-2.5 text-sm font-medium text-white bg-[#3147FF] rounded-lg hover:bg-[#2a3de6] disabled:opacity-50 flex items-center gap-2"
                >
                  {bulkProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Upload & Parse All
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================== SINGLE CANDIDATE MODE ======================== */}
      {mode === "single" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CV Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#0A102F]">Upload CV</h3>
              {parsing && (
                <span className="flex items-center gap-1.5 text-sm text-[#3147FF]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI is reading CV...
                </span>
              )}
              {parsed && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Form auto-filled from CV
                </span>
              )}
            </div>
            <div
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                dragOver
                  ? "border-[#3147FF] bg-indigo-50/50"
                  : parsing
                  ? "border-[#3147FF] bg-indigo-50/50"
                  : cvFile
                  ? "border-green-300 bg-green-50/30"
                  : "border-gray-300 hover:border-[#3147FF]"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => singleInputRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                {parsing ? (
                  <>
                    <Sparkles className="w-8 h-8 text-[#3147FF] mb-2 animate-pulse" />
                    <p className="text-sm text-[#3147FF] font-medium">
                      Extracting candidate info...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      This may take 10-15 seconds
                    </p>
                  </>
                ) : cvFile ? (
                  <>
                    <Upload className="w-8 h-8 text-green-500 mb-2" />
                    <p className="text-sm text-green-700 font-medium">
                      {cvFile.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click or drag to change file
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Drag & drop or click to upload PDF / DOCX
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      AI will auto-fill the form from CV
                    </p>
                  </>
                )}
              </div>
              <input
                ref={singleInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                disabled={parsing}
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-[#0A102F]">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={form.linkedinUrl}
                  onChange={(e) => updateField("linkedinUrl", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-[#0A102F]">
              Professional Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Role
                </label>
                <input
                  type="text"
                  value={form.currentRole}
                  onChange={(e) => updateField("currentRole", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Company
                </label>
                <input
                  type="text"
                  value={form.currentCompany}
                  onChange={(e) =>
                    updateField("currentCompany", e.target.value)
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (years)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.experienceYears}
                  onChange={(e) =>
                    updateField(
                      "experienceYears",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notice Period
                </label>
                <input
                  type="text"
                  value={form.noticePeriod}
                  onChange={(e) => updateField("noticePeriod", e.target.value)}
                  placeholder="e.g. 30 days, Immediate"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current CTC
                </label>
                <input
                  type="text"
                  value={form.currentCtc}
                  onChange={(e) => updateField("currentCtc", e.target.value)}
                  placeholder="e.g. 12 LPA"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected CTC
                </label>
                <input
                  type="text"
                  value={form.expectedCtc}
                  onChange={(e) => updateField("expectedCtc", e.target.value)}
                  placeholder="e.g. 18 LPA"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  value={form.source}
                  onChange={(e) => updateField("source", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                >
                  <option value="UPLOAD">CV Upload</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="PORTAL">Job Portal Application</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills (from CV parse) */}
          {skills.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#0A102F] mb-3">
                Skills (extracted from CV)
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Link
              href="/talent/candidates"
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || parsing}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#3147FF] rounded-lg hover:bg-[#2a3de6] disabled:opacity-50"
            >
              {uploading
                ? "Uploading CV..."
                : saving
                ? "Creating..."
                : "Create Candidate"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
