"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Video, Phone, MapPin, ChevronRight } from "lucide-react";

interface InterviewItem {
  id: string;
  round: number;
  roundName: string | null;
  mode: string;
  status: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  duration: number;
  interviewerName: string | null;
  candidate: { id: string; name: string };
  candidateRequisition: {
    requisition: { id: string; title: string; client: { name: string } };
  };
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

const modeIcons: Record<string, typeof Video> = {
  VIDEO: Video,
  PHONE: Phone,
  ONSITE: MapPin,
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter]);

  async function fetchInterviews() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/talent/interviews?${params}`);
    const json = await res.json();
    setInterviews(json.data || []);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A102F]">Interviews</h1>
          <p className="text-gray-500 text-sm mt-1">{interviews.length} interviews</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
        >
          <option value="">All Status</option>
          <option value="SLOTS_PROPOSED">Slots Proposed</option>
          <option value="SENT_TO_CANDIDATE">Sent to Candidate</option>
          <option value="BOOKED">Booked</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
          <option value="PASSED">Passed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No interviews found</p>
          <p className="text-gray-400 text-sm mt-1">
            Schedule interviews from the candidate screening page
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {interviews.map((interview) => {
            const ModeIcon = modeIcons[interview.mode] || Video;
            return (
              <Link
                key={interview.id}
                href={`/talent/interviews/${interview.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex items-center gap-4"
              >
                <div className="w-11 h-11 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ModeIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#0A102F] truncate">
                      {interview.candidate.name}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {interview.roundName || `Round ${interview.round}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                    <span>{interview.candidateRequisition.requisition.title}</span>
                    <span>{interview.candidateRequisition.requisition.client.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm flex-shrink-0">
                  {interview.scheduledStart && (
                    <span className="text-gray-600">
                      {new Date(interview.scheduledStart).toLocaleDateString()}{" "}
                      {new Date(interview.scheduledStart).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      statusColors[interview.status] || "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {interview.status.replace(/_/g, " ")}
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
