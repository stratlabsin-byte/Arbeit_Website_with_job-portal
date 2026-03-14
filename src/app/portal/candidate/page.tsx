"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Calendar, MapPin, Briefcase, Clock } from "lucide-react";

interface CandidateProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  currentRole: string | null;
  currentCompany: string | null;
  experienceYears: number;
  skills: string | null;
  cvVersions: any[];
  requisitions: any[];
  interviews: any[];
}

const stageLabels: Record<string, { label: string; color: string }> = {
  PIPELINE: { label: "Under Review", color: "bg-blue-100 text-blue-700" },
  SHORTLISTED: { label: "Shortlisted", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Not Selected", color: "bg-red-100 text-red-700" },
  PUSHED_TO_CLIENT: { label: "Under Client Review", color: "bg-purple-100 text-purple-700" },
  CLIENT_APPROVED: { label: "Client Approved", color: "bg-emerald-100 text-emerald-700" },
  CLIENT_REJECTED: { label: "Not Shortlisted", color: "bg-orange-100 text-orange-700" },
  SELECTED: { label: "Selected!", color: "bg-green-200 text-green-800" },
};

export default function CandidateDashboard() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/talent/candidate/profile");
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setProfile(json.data);
      setLoading(false);
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 font-medium">No candidate profile found for your account.</p>
        <p className="text-gray-400 text-sm mt-1">Please contact Arbeit if you believe this is an error.</p>
      </div>
    );
  }

  if (!profile) return null;

  const skills: string[] = profile.skills ? JSON.parse(profile.skills) : [];
  const activeApplications = profile.requisitions.filter(
    (r: any) => !["REJECTED", "CLIENT_REJECTED"].includes(r.stage)
  );
  const upcomingInterviews = profile.interviews.filter(
    (i: any) => ["SENT_TO_CANDIDATE", "BOOKED"].includes(i.status)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A102F] mb-6">Welcome, {profile.name}</h1>

      {/* Profile Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xl">
            {profile.name[0]}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#0A102F]">{profile.name}</h2>
            <p className="text-sm text-gray-500">
              {profile.currentRole} {profile.currentCompany ? `at ${profile.currentCompany}` : ""}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {profile.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" /> {profile.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-4 h-4 text-gray-400" /> {profile.experienceYears} yrs exp
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="w-4 h-4 text-gray-400" /> {profile.cvVersions.length} CV(s)
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" /> {profile.requisitions.length} application(s)
          </div>
        </div>
        {skills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{s}</span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Applications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0A102F]">Active Applications</h2>
            <Link href="/portal/candidate/applications" className="text-sm text-[#3147FF] hover:underline">
              View all
            </Link>
          </div>
          {activeApplications.length === 0 ? (
            <p className="text-sm text-gray-400">No active applications</p>
          ) : (
            <div className="space-y-3">
              {activeApplications.slice(0, 5).map((cr: any) => {
                const stage = stageLabels[cr.stage] || { label: cr.stage, color: "bg-gray-100 text-gray-600" };
                return (
                  <div key={cr.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-[#0A102F]">{cr.requisition.title}</p>
                      <p className="text-xs text-gray-500">{cr.requisition.client.name}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${stage.color}`}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0A102F]">Upcoming Interviews</h2>
            <Link href="/portal/candidate/interviews" className="text-sm text-[#3147FF] hover:underline">
              View all
            </Link>
          </div>
          {upcomingInterviews.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming interviews</p>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.slice(0, 5).map((int: any) => (
                <Link
                  key={int.id}
                  href={`/talent/candidate/interviews/${int.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <div>
                      <p className="text-sm font-medium text-[#0A102F]">
                        {int.roundName || `Round ${int.round}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {int.candidateRequisition.requisition.title}
                      </p>
                    </div>
                  </div>
                  {int.scheduledStart ? (
                    <span className="text-xs text-gray-600">
                      {new Date(int.scheduledStart).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">Book a slot</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
