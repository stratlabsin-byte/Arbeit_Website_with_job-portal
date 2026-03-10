"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Building2, FileText, Users, Calendar, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  clients: number;
  totalRequisitions: number;
  pendingApproval: number;
  publishedRequisitions: number;
  totalCandidates: number;
  totalInterviews: number;
  placements: number;
  pipeline: Record<string, number>;
  recentCandidates: { id: string; name: string; currentRole: string | null; createdAt: string }[];
  upcomingInterviews: any[];
}

const pipelineStageLabels: Record<string, { label: string; color: string }> = {
  PIPELINE: { label: "Pipeline", color: "bg-blue-500" },
  SHORTLISTED: { label: "Shortlisted", color: "bg-green-500" },
  PUSHED_TO_CLIENT: { label: "With Client", color: "bg-purple-500" },
  CLIENT_APPROVED: { label: "Client Approved", color: "bg-emerald-500" },
  CLIENT_REJECTED: { label: "Client Rejected", color: "bg-orange-500" },
  REJECTED: { label: "Rejected", color: "bg-red-500" },
  SELECTED: { label: "Selected", color: "bg-green-700" },
};

export default function TalentDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/talent/dashboard");
        const json = await res.json();
        setData(json.data);
      } catch {}
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  const statCards = [
    { label: "Active Clients", value: data?.clients || 0, icon: Building2, href: "/talent/clients", color: "bg-blue-500" },
    { label: "Total Requisitions", value: data?.totalRequisitions || 0, icon: FileText, href: "/talent/requisitions", color: "bg-indigo-500" },
    { label: "Pending Approval", value: data?.pendingApproval || 0, icon: Clock, href: "/talent/requisitions?status=PENDING_APPROVAL", color: "bg-amber-500" },
    { label: "Candidates", value: data?.totalCandidates || 0, icon: Users, href: "/talent/candidates", color: "bg-emerald-500" },
    { label: "Interviews", value: data?.totalInterviews || 0, icon: Calendar, href: "/talent/interviews", color: "bg-purple-500" },
    { label: "Placements", value: data?.placements || 0, icon: CheckCircle2, href: "/talent/requisitions?status=FILLED", color: "bg-green-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0A102F]">
          Welcome back, {session?.user?.name || "Recruiter"}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s an overview of your recruitment pipeline.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-[#0A102F] mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2.5 rounded-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pipeline Breakdown */}
          {data?.pipeline && Object.keys(data.pipeline).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-[#0A102F] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#3147FF]" />
                Pipeline Breakdown
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {Object.entries(pipelineStageLabels).map(([stage, { label, color }]) => (
                  <div key={stage} className="text-center p-3 rounded-lg bg-gray-50">
                    <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
                    <p className="text-xl font-bold text-[#0A102F]">{data.pipeline[stage] || 0}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Candidates */}
            {data?.recentCandidates && data.recentCandidates.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[#0A102F]">Recent Candidates</h2>
                  <Link href="/talent/candidates" className="text-sm text-[#3147FF] hover:underline">View all</Link>
                </div>
                <div className="space-y-3">
                  {data.recentCandidates.map((c) => (
                    <Link
                      key={c.id}
                      href={`/talent/candidates/${c.id}`}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                        {c.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0A102F] truncate">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.currentRole || "No role specified"}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Interviews */}
            {data?.upcomingInterviews && data.upcomingInterviews.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[#0A102F]">Upcoming Interviews</h2>
                  <Link href="/talent/interviews" className="text-sm text-[#3147FF] hover:underline">View all</Link>
                </div>
                <div className="space-y-3">
                  {data.upcomingInterviews.map((int: any) => (
                    <Link
                      key={int.id}
                      href={`/talent/interviews/${int.id}`}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0A102F] truncate">{int.candidate.name}</p>
                        <p className="text-xs text-gray-500">{int.candidateRequisition.requisition.title}</p>
                      </div>
                      {int.scheduledStart && (
                        <span className="text-xs text-gray-500">
                          {new Date(int.scheduledStart).toLocaleDateString()}{" "}
                          {new Date(int.scheduledStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#0A102F] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/talent/clients/new"
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Add New Client</span>
              </Link>
              <Link
                href="/talent/requisitions/new"
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Create Requisition</span>
              </Link>
              <Link
                href="/talent/candidates/new"
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Users className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Upload Candidate CV</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
