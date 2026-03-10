"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Video, Phone, MapPin, ChevronRight } from "lucide-react";

interface CandidateInterview {
  id: string;
  round: number;
  roundName: string | null;
  mode: string;
  status: string;
  scheduledStart: string | null;
  duration: number;
  meetingLink: string | null;
  proposedSlots: string | null;
  candidateRequisition: {
    requisition: { id: string; title: string; client: { name: string } };
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  SLOTS_PROPOSED: { label: "Pending", color: "bg-gray-100 text-gray-600" },
  SENT_TO_CANDIDATE: { label: "Book a Slot", color: "bg-amber-100 text-amber-700" },
  BOOKED: { label: "Confirmed", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Completed", color: "bg-gray-100 text-gray-600" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
  NO_SHOW: { label: "Missed", color: "bg-red-100 text-red-700" },
  PASSED: { label: "Passed!", color: "bg-emerald-100 text-emerald-700" },
  FAILED: { label: "Not Selected", color: "bg-orange-100 text-orange-700" },
};

const modeIcons: Record<string, typeof Video> = {
  VIDEO: Video,
  PHONE: Phone,
  ONSITE: MapPin,
};

export default function CandidateInterviewsPage() {
  const [interviews, setInterviews] = useState<CandidateInterview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/talent/candidate/interviews");
      const json = await res.json();
      setInterviews(json.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A102F] mb-6">My Interviews</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No interviews yet</p>
          <p className="text-gray-400 text-sm mt-1">Interviews will appear here once scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => {
            const ModeIcon = modeIcons[interview.mode] || Video;
            const status = statusLabels[interview.status] || { label: interview.status, color: "bg-gray-100" };
            const needsBooking = interview.status === "SENT_TO_CANDIDATE";

            return (
              <Link
                key={interview.id}
                href={`/talent/candidate/interviews/${interview.id}`}
                className={`bg-white rounded-xl border p-5 flex items-center gap-4 hover:shadow-md transition-shadow ${
                  needsBooking ? "border-amber-300 bg-amber-50/30" : "border-gray-200"
                }`}
              >
                <div className="w-11 h-11 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ModeIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#0A102F]">
                      {interview.roundName || `Round ${interview.round}`}
                    </h3>
                    {needsBooking && (
                      <span className="text-xs text-amber-600 font-semibold animate-pulse">
                        Action required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {interview.candidateRequisition.requisition.title} &middot;{" "}
                    {interview.candidateRequisition.requisition.client.name}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {interview.scheduledStart && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#0A102F]">
                        {new Date(interview.scheduledStart).toLocaleDateString(undefined, {
                          weekday: "short", month: "short", day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(interview.scheduledStart).toLocaleTimeString([], {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
