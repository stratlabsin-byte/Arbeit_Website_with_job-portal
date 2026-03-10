"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Video, Phone, MapPin, Clock, User,
  CheckCircle2, XCircle, Star, Send,
} from "lucide-react";

interface InterviewDetail {
  id: string;
  round: number;
  roundName: string | null;
  mode: string;
  status: string;
  proposedSlots: string | null;
  bookedSlotId: string | null;
  bookedAt: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  duration: number;
  meetingLink: string | null;
  location: string | null;
  interviewerName: string | null;
  interviewerEmail: string | null;
  instructions: string | null;
  feedback: string | null;
  rating: number | null;
  moreRoundsNeeded: boolean | null;
  noShowBy: string | null;
  createdAt: string;
  candidate: { id: string; name: string; email: string | null; phone: string | null; currentRole: string | null };
  candidateRequisition: {
    requisition: { id: string; title: string; client: { id: string; name: string } };
  };
  createdBy: { name: string; email: string };
}

const statusColors: Record<string, string> = {
  SLOTS_PROPOSED: "bg-amber-100 text-amber-700",
  SENT_TO_CANDIDATE: "bg-blue-100 text-blue-700",
  BOOKED: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-red-100 text-red-700",
  PASSED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-orange-100 text-orange-700",
};

export default function InterviewDetailPage() {
  const { interviewId } = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<InterviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [ratingValue, setRatingValue] = useState(0);
  const [moreRounds, setMoreRounds] = useState(false);

  useEffect(() => {
    fetchInterview();
  }, [interviewId]);

  async function fetchInterview() {
    const res = await fetch(`/api/talent/interviews/${interviewId}`);
    if (!res.ok) { router.push("/talent/interviews"); return; }
    const json = await res.json();
    setInterview(json.data);
    if (json.data.feedback) setFeedbackText(json.data.feedback);
    if (json.data.rating) setRatingValue(json.data.rating);
    if (json.data.moreRoundsNeeded) setMoreRounds(json.data.moreRoundsNeeded);
    setLoading(false);
  }

  async function updateInterview(body: any) {
    setUpdating(true);
    await fetch(`/api/talent/interviews/${interviewId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await fetchInterview();
    setUpdating(false);
  }

  if (loading || !interview) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  const slots: any[] = interview.proposedSlots ? JSON.parse(interview.proposedSlots) : [];
  const req = interview.candidateRequisition.requisition;

  return (
    <div>
      <Link href="/talent/interviews" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Interviews
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-[#0A102F]">
              {interview.roundName || `Round ${interview.round}`}
            </h1>
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusColors[interview.status] || "bg-gray-100"}`}>
              {interview.status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            {interview.candidate.name} &middot; {req.title} &middot; {req.client.name}
          </p>
        </div>

        {/* Status Actions */}
        <div className="flex gap-2">
          {interview.status === "SLOTS_PROPOSED" && (
            <button
              onClick={() => updateInterview({ status: "SENT_TO_CANDIDATE" })}
              disabled={updating}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#3147FF] rounded-lg hover:bg-[#2a3de6] disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Send to Candidate
            </button>
          )}
          {interview.status === "BOOKED" && (
            <>
              <button
                onClick={() => updateInterview({ status: "COMPLETED" })}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Mark Completed
              </button>
              <button
                onClick={() => updateInterview({ noShowBy: "CANDIDATE" })}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
              >
                No Show
              </button>
            </>
          )}
          {interview.status === "COMPLETED" && !interview.feedback && (
            <span className="text-sm text-amber-600 font-medium">Awaiting feedback</span>
          )}
          {(interview.status === "COMPLETED" || interview.status === "PASSED" || interview.status === "FAILED") && interview.feedback && (
            <>
              {interview.status === "COMPLETED" && (
                <>
                  <button
                    onClick={() => updateInterview({ status: "PASSED" })}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Pass
                  </button>
                  <button
                    onClick={() => updateInterview({ status: "FAILED" })}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Fail
                  </button>
                </>
              )}
            </>
          )}
          {!["CANCELLED", "NO_SHOW", "COMPLETED", "PASSED", "FAILED"].includes(interview.status) && (
            <button
              onClick={() => updateInterview({ status: "CANCELLED" })}
              disabled={updating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Proposed Slots */}
          {slots.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-[#0A102F] mb-4">
                {interview.bookedSlotId ? "Time Slots (Booked)" : "Proposed Time Slots"}
              </h2>
              <div className="space-y-2">
                {slots.map((slot: any, i: number) => {
                  const isBooked = slot.slotId === interview.bookedSlotId;
                  return (
                    <div
                      key={slot.slotId || i}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isBooked
                          ? "bg-green-50 border border-green-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div className="text-sm">
                          <span className="font-medium text-[#0A102F]">
                            {new Date(slot.startTime).toLocaleDateString(undefined, {
                              weekday: "short", month: "short", day: "numeric",
                            })}
                          </span>
                          <span className="text-gray-500 ml-2">
                            {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {" - "}
                            {new Date(slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      {isBooked ? (
                        <span className="text-xs text-green-600 font-medium">Booked</span>
                      ) : (
                        interview.status === "SENT_TO_CANDIDATE" && (
                          <button
                            onClick={() => updateInterview({ bookSlotId: slot.slotId })}
                            disabled={updating}
                            className="text-xs text-[#3147FF] font-medium hover:underline disabled:opacity-50"
                          >
                            Book this slot
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {["COMPLETED", "PASSED", "FAILED"].includes(interview.status) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-[#0A102F] mb-4">Interview Feedback</h2>
              {interview.feedback ? (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {interview.rating && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= interview.rating!
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    {interview.moreRoundsNeeded && (
                      <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                        More rounds needed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{interview.feedback}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRatingValue(star)}
                          className="p-0.5"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= ratingValue
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300 hover:text-amber-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={4}
                      placeholder="Share your assessment of the candidate..."
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={moreRounds}
                      onChange={(e) => setMoreRounds(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    More interview rounds needed
                  </label>
                  <button
                    onClick={() => updateInterview({
                      feedback: feedbackText,
                      rating: ratingValue || undefined,
                      moreRoundsNeeded: moreRounds,
                    })}
                    disabled={updating || !feedbackText.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#3147FF] rounded-lg hover:bg-[#2a3de6] disabled:opacity-50"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {interview.instructions && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-[#0A102F] mb-3">Instructions</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{interview.instructions}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A102F] mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Mode</span>
                <span className="font-medium flex items-center gap-1.5">
                  {interview.mode === "VIDEO" && <Video className="w-3.5 h-3.5" />}
                  {interview.mode === "PHONE" && <Phone className="w-3.5 h-3.5" />}
                  {interview.mode === "ONSITE" && <MapPin className="w-3.5 h-3.5" />}
                  {interview.mode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{interview.duration} min</span>
              </div>
              {interview.interviewerName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Interviewer</span>
                  <span className="font-medium">{interview.interviewerName}</span>
                </div>
              )}
              {interview.meetingLink && (
                <div>
                  <span className="text-gray-500 block mb-1">Meeting Link</span>
                  <a href={interview.meetingLink} target="_blank" className="text-[#3147FF] hover:underline text-xs break-all">
                    {interview.meetingLink}
                  </a>
                </div>
              )}
              {interview.location && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium">{interview.location}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created by</span>
                <span>{interview.createdBy.name}</span>
              </div>
            </div>
          </div>

          {/* Candidate Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A102F] mb-4">Candidate</h2>
            <Link href={`/talent/candidates/${interview.candidate.id}`} className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                  {interview.candidate.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0A102F]">{interview.candidate.name}</p>
                  <p className="text-xs text-gray-500">{interview.candidate.currentRole}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Requisition Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A102F] mb-4">Requisition</h2>
            <Link href={`/talent/requisitions/${req.id}`} className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg">
              <p className="text-sm font-medium text-[#0A102F]">{req.title}</p>
              <p className="text-xs text-gray-500">{req.client.name}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
