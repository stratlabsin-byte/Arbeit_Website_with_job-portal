"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

interface Application {
  id: string;
  stage: string;
  fitScore: number | null;
  submittedAt: string;
  requisition: {
    id: string;
    title: string;
    location: string | null;
    workModel: string;
    status: string;
    client: { name: string };
  };
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

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/talent/candidate/applications");
      const json = await res.json();
      setApplications(json.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A102F] mb-6">My Applications</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No applications yet</p>
          <p className="text-gray-400 text-sm mt-1">Your applications will appear here once you&apos;re added to a requisition</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const stage = stageLabels[app.stage] || { label: app.stage, color: "bg-gray-100 text-gray-600" };
            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#0A102F]">{app.requisition.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                    <span>{app.requisition.client.name}</span>
                    {app.requisition.location && <span>{app.requisition.location}</span>}
                    <span>{app.requisition.workModel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {app.fitScore !== null && (
                    <span className={`text-sm font-bold ${
                      app.fitScore >= 70 ? "text-green-600" : app.fitScore >= 40 ? "text-amber-600" : "text-red-600"
                    }`}>
                      {app.fitScore}%
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${stage.color}`}>
                    {stage.label}
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
