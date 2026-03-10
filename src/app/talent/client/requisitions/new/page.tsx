"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ClientNewRequisitionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    rawJd: "",
    department: "",
    location: "",
    city: "",
    workModel: "ONSITE",
    experienceMin: 0,
    experienceMax: "",
    requiredSkills: "",
    vacancies: 1,
    priority: "MEDIUM",
  });

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Job title is required");
      return;
    }

    setSaving(true);
    setError("");

    const skills = form.requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/talent/client/requisitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        experienceMax: form.experienceMax ? parseInt(form.experienceMax as string) : null,
        requiredSkills: skills.length > 0 ? skills : null,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to submit");
      setSaving(false);
      return;
    }

    router.push("/talent/client/requisitions");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/talent/client/requisitions" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Requisitions
      </Link>

      <h1 className="text-2xl font-bold text-[#0A102F] mb-6">Submit Job Requirement</h1>
      <p className="text-sm text-gray-500 mb-6">
        Submit your requirement and our team will review, polish the JD, and find the best candidates for you.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-[#0A102F]">Job Details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description / Requirements
            </label>
            <textarea
              value={form.rawJd}
              onChange={(e) => updateField("rawJd", e.target.value)}
              rows={6}
              placeholder="Describe the role, responsibilities, and requirements. Our AI will polish this into a professional JD."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
            />
            <p className="text-xs text-gray-400 mt-1">Don&apos;t worry about formatting — our AI will handle that.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => updateField("department", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Model</label>
              <select
                value={form.workModel}
                onChange={(e) => updateField("workModel", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              >
                <option value="ONSITE">On-site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vacancies</label>
              <input
                type="number"
                min={1}
                value={form.vacancies}
                onChange={(e) => updateField("vacancies", parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience (years)</label>
              <input
                type="number"
                min={0}
                value={form.experienceMin}
                onChange={(e) => updateField("experienceMin", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Experience (years)</label>
              <input
                type="number"
                min={0}
                value={form.experienceMax}
                onChange={(e) => updateField("experienceMax", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
            <input
              type="text"
              value={form.requiredSkills}
              onChange={(e) => updateField("requiredSkills", e.target.value)}
              placeholder="Comma separated: React, Node.js, TypeScript"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/talent/client/requisitions" className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#3147FF] rounded-lg hover:bg-[#2a3de6] disabled:opacity-50"
          >
            {saving ? "Submitting..." : "Submit Requirement"}
          </button>
        </div>
      </form>
    </div>
  );
}
