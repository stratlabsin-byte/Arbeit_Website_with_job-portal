"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Calendar } from "lucide-react";

interface Slot {
  slotId: string;
  startTime: string;
  endTime: string;
}

export default function ScheduleInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const crId = searchParams.get("crId") || "";
  const candidateId = searchParams.get("candidateId") || "";
  const requisitionId = searchParams.get("requisitionId") || "";

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<Slot[]>([
    { slotId: "slot-1", startTime: "", endTime: "" },
  ]);
  const [form, setForm] = useState({
    roundName: "",
    mode: "VIDEO",
    duration: 60,
    interviewerName: "",
    interviewerEmail: "",
    meetingLink: "",
    location: "",
    instructions: "",
  });

  function addSlot() {
    if (slots.length >= 5) return;
    setSlots([...slots, { slotId: `slot-${slots.length + 1}`, startTime: "", endTime: "" }]);
  }

  function removeSlot(index: number) {
    if (slots.length <= 1) return;
    setSlots(slots.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, field: "startTime" | "endTime", value: string) {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    // Auto-calculate end time based on duration
    if (field === "startTime" && value) {
      const start = new Date(value);
      start.setMinutes(start.getMinutes() + form.duration);
      updated[index].endTime = start.toISOString().slice(0, 16);
    }
    setSlots(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validSlots = slots.filter((s) => s.startTime && s.endTime);
    if (validSlots.length === 0) {
      setError("At least one time slot is required");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/talent/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateRequisitionId: crId,
        candidateId,
        roundName: form.roundName || undefined,
        mode: form.mode,
        duration: form.duration,
        proposedSlots: validSlots,
        interviewerName: form.interviewerName || undefined,
        interviewerEmail: form.interviewerEmail || undefined,
        meetingLink: form.meetingLink || undefined,
        location: form.location || undefined,
        instructions: form.instructions || undefined,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to schedule interview");
      setSaving(false);
      return;
    }

    router.push(`/talent/interviews/${json.data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={candidateId ? `/talent/candidates/${candidateId}` : "/talent/interviews"}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <h1 className="text-2xl font-bold text-[#0A102F] mb-6">Schedule Interview</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Interview Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-[#0A102F]">Interview Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Round Name</label>
              <input
                type="text"
                value={form.roundName}
                onChange={(e) => setForm({ ...form, roundName: e.target.value })}
                placeholder="e.g. Technical Round, HR Round"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              >
                <option value="VIDEO">Video Call</option>
                <option value="PHONE">Phone Call</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min={15}
                max={240}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 60 })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
          </div>
        </div>

        {/* Interviewer */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-[#0A102F]">Interviewer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.interviewerName}
                onChange={(e) => setForm({ ...form, interviewerName: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.interviewerEmail}
                onChange={(e) => setForm({ ...form, interviewerEmail: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
          </div>
          {form.mode === "VIDEO" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
              <input
                type="url"
                value={form.meetingLink}
                onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
          )}
          {form.mode === "ONSITE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
              />
            </div>
          )}
        </div>

        {/* Proposed Time Slots */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#0A102F]">Proposed Time Slots (max 5)</h3>
            {slots.length < 5 && (
              <button
                type="button"
                onClick={addSlot}
                className="flex items-center gap-1 text-sm text-[#3147FF] font-medium hover:underline"
              >
                <Plus className="w-4 h-4" /> Add Slot
              </button>
            )}
          </div>
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div key={slot.slotId} className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start</label>
                    <input
                      type="datetime-local"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End</label>
                    <input
                      type="datetime-local"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                    />
                  </div>
                </div>
                {slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-[#0A102F] mb-3">Instructions for Candidate</h3>
          <textarea
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            rows={3}
            placeholder="Any preparation notes or instructions..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href={candidateId ? `/talent/candidates/${candidateId}` : "/talent/interviews"}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#3147FF] rounded-lg hover:bg-[#2a3de6] disabled:opacity-50"
          >
            {saving ? "Scheduling..." : "Schedule Interview"}
          </button>
        </div>
      </form>
    </div>
  );
}
