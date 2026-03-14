"use client";

import { useEffect, useState } from "react";
import { Calendar, Video, Phone, MapPin } from "lucide-react";

interface ClientInterview {
  id: string;
  round: number;
  roundName: string | null;
  mode: string;
  status: string;
  scheduledStart: string | null;
  duration: number;
  candidate: { id: string; name: string };
  candidateRequisition: {
    requisition: { id: string; title: string };
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

export default function ClientInterviewsPage() {
  const [interviews, setInterviews] = useState<ClientInterview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/talent/client/interviews");
      const json = await res.json();
      setInterviews(json.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A102F] mb-6">Interviews</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No interviews scheduled</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {interviews.map((interview) => {
            const ModeIcon = modeIcons[interview.mode] || Video;
            return (
              <div
                key={interview.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ModeIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#0A102F]">{interview.candidate.name}</h3>
                    <span className="text-xs text-gray-400">
                      {interview.roundName || `Round ${interview.round}`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {interview.candidateRequisition.requisition.title}
                  </p>
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
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusColors[interview.status] || "bg-gray-100"}`}>
                    {interview.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
