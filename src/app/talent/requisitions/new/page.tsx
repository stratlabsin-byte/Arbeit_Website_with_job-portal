"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { INDUSTRIES, JOB_TYPES, WORK_MODELS, REQUISITION_PRIORITIES } from "@/types";

interface ClientOption {
  id: string;
  name: string;
}

export default function NewRequisitionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("clientId") || "";

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    clientId: preselectedClient,
    title: "",
    rawJd: "",
    description: "",
    department: "",
    location: "",
    city: "",
    workModel: "ONSITE",
    jobType: "FULL_TIME",
    experienceMin: 0,
    experienceMax: "",
    ctcMin: "",
    ctcMax: "",
    ctcCurrency: "INR",
    noticePeriod: "",
    requiredSkills: [] as string[],
    vacancies: 1,
    priority: "MEDIUM",
    deadline: "",
  });

  useEffect(() => {
    fetch("/api/talent/clients?limit=100")
      .then((r) => r.json())
      .then((json) => setClients(json.data || []));
  }, []);

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addSkill() {
    const skill = skillInput.trim();
    if (skill && !form.requiredSkills.includes(skill)) {
      updateField("requiredSkills", [...form.requiredSkills, skill]);
      setSkillInput("");
    }
  }

  function removeSkill(skill: string) {
    updateField("requiredSkills", form.requiredSkills.filter((s) => s !== skill));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientId) {
      setError("Please select a client");
      return;
    }
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");

    const res = await fetch("/api/talent/requisitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        experienceMax: form.experienceMax ? parseInt(form.experienceMax as string) : null,
        ctcMin: form.ctcMin ? parseFloat(form.ctcMin as string) : null,
        ctcMax: form.ctcMax ? parseFloat(form.ctcMax as string) : null,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to create requisition");
      setSaving(false);
      return;
    }

    router.push(`/talent/requisitions/${json.data.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/talent/requisitions"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Requisitions
      </Link>

      <h1 className="text-2xl font-bold text-[#0A102F] mb-6">Create Requisition</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client & Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-[#0A102F]">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                value={form.clientId}
                onChange={(e) => updateField("clientId", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                placeholder="e.g. Senior Java Developer"
              />
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              >
                {REQUISITION_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => updateField("deadline", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
          </div>
        </div>

        {/* Raw JD / Description */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-[#0A102F]">Job Description</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raw JD from Client
            </label>
            <textarea
              value={form.rawJd}
              onChange={(e) => updateField("rawJd", e.target.value)}
              rows={5}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              placeholder="Paste the client's raw job description here. AI will polish it when you publish."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Description / Notes
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
            />
          </div>
        </div>

        {/* Location & Work Model */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-[#0A102F]">Location & Work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Model</label>
              <select
                value={form.workModel}
                onChange={(e) => updateField("workModel", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              >
                {WORK_MODELS.map((wm) => (
                  <option key={wm.value} value={wm.value}>{wm.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                placeholder="e.g. Bangalore"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select
                value={form.jobType}
                onChange={(e) => updateField("jobType", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              >
                {JOB_TYPES.map((jt) => (
                  <option key={jt.value} value={jt.value}>{jt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Experience & CTC */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-[#0A102F]">Experience & Compensation</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exp Min (yrs)</label>
              <input
                type="number"
                min={0}
                value={form.experienceMin}
                onChange={(e) => updateField("experienceMin", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exp Max (yrs)</label>
              <input
                type="number"
                min={0}
                value={form.experienceMax}
                onChange={(e) => updateField("experienceMax", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTC Min (LPA)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.ctcMin}
                onChange={(e) => updateField("ctcMin", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTC Max (LPA)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.ctcMax}
                onChange={(e) => updateField("ctcMax", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period Preference</label>
            <input
              type="text"
              value={form.noticePeriod}
              onChange={(e) => updateField("noticePeriod", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              placeholder="e.g. 30 days, Immediate"
            />
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-[#0A102F]">Required Skills</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              placeholder="Type a skill and press Enter"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Add
            </button>
          </div>
          {form.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="text-blue-400 hover:text-blue-600">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/talent/requisitions"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#3147FF] rounded-lg hover:bg-[#2a3de6] transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Requisition"}
          </button>
        </div>
      </form>
    </div>
  );
}
