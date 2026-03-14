"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Video, Phone, MapPin, Clock, CheckCircle2,
} from "lucide-react";

interface InterviewDetail {
  id: string;
  round: number;
  roundName: string | null;
  mode: string;
  status: string;
  proposedSlots: string | null;
  bookedSlotId: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  duration: number;
  meetingLink: string | null;
  location: string | null;
  interviewerName: string | null;
  instructions: string | null;
  candidateRequisition: {
    requisition: { id: string; title: string; client: { name: string } };
  };
}

export default function CandidateInterviewDetailPage() {
  const { interviewId } = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<InterviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchInterview();
  }, [interviewId]);

  async function fetchInterview() {
    const res = await fetch(`/api/talent/candidate/interviews`);
    const json = await res.json();
    const found = (json.data || []).find((i: any) => i.id === interviewId);
    if (!found) {
      router.push("/portal/candidate/interviews");
      return;
    }
    setInterview(found);
    setLoading(false);
  }

  async function bookSlot(slotId: string) {
    setBooking(true);
    const res = await fetch(`/api/talent/candidate/interviews/${interviewId}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId }),
    });
    if (res.ok) {
      await fetchInterview();
    } else {
      const json = await res.json();
      alert(json.error || "Failed to book slot");
    }
    setBooking(false);
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
  const canBook = interview.status === "SENT_TO_CANDIDATE";
  const isBooked = interview.status === "BOOKED";

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/portal/candidate/interviews"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Interviews
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h1 className="text-xl font-bold text-[#0A102F] mb-1">
          {interview.roundName || `Round ${interview.round}`}
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          {req.title} &middot; {req.client.name}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            {interview.mode === "VIDEO" && <Video className="w-4 h-4 text-gray-400" />}
            {interview.mode === "PHONE" && <Phone className="w-4 h-4 text-gray-400" />}
            {interview.mode === "ONSITE" && <MapPin className="w-4 h-4 text-gray-400" />}
            {interview.mode === "VIDEO" ? "Video Call" : interview.mode === "PHONE" ? "Phone Call" : "On-site"}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" /> {interview.duration} minutes
          </div>
          {interview.interviewerName && (
            <div className="text-gray-600">Interviewer: {interview.interviewerName}</div>
          )}
        </div>

        {/* Meeting link (only visible after booking) */}
        {isBooked && interview.meetingLink && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Meeting Link</p>
            <a
              href={interview.meetingLink}
              target="_blank"
              className="text-[#3147FF] hover:underline text-sm break-all"
            >
              {interview.meetingLink}
            </a>
          </div>
        )}

        {isBooked && interview.location && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Location</p>
            <p className="text-sm text-[#0A102F]">{interview.location}</p>
          </div>
        )}
      </div>

      {/* Time Slots */}
      {slots.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-[#0A102F] mb-4">
            {canBook
              ? "Select a Time Slot"
              : isBooked
              ? "Your Booked Slot"
              : "Proposed Time Slots"}
          </h2>

          {canBook && (
            <p className="text-sm text-amber-600 mb-4">
              Please select one of the available time slots below to confirm your interview.
            </p>
          )}

          <div className="space-y-2">
            {slots.map((slot: any, i: number) => {
              const slotBooked = slot.slotId === interview.bookedSlotId;
              return (
                <div
                  key={slot.slotId || i}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    slotBooked
                      ? "bg-green-50 border-2 border-green-300"
                      : canBook
                      ? "bg-gray-50 hover:bg-blue-50 border border-gray-200 cursor-pointer"
                      : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-5 h-5 ${slotBooked ? "text-green-500" : "text-gray-400"}`} />
                    <div>
                      <p className="text-sm font-medium text-[#0A102F]">
                        {new Date(slot.startTime).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" - "}
                        {new Date(slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  {slotBooked ? (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Confirmed</span>
                    </div>
                  ) : canBook ? (
                    <button
                      onClick={() => bookSlot(slot.slotId)}
                      disabled={booking}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#3147FF] rounded-lg hover:bg-[#2a3de6] disabled:opacity-50"
                    >
                      {booking ? "Booking..." : "Book This Slot"}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
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
  );
}
