"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Building2,
  FileText,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  UserSearch,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { StatCardSkeleton } from "@/components/dashboard/LoadingSkeleton";

interface AdminStats {
  totalJobs: number;
  activeJobs: number;
  totalUsers: number;
  totalCompanies: number;
  totalApplications: number;
  totalInquiries: number;
  unreadInquiries: number;
}

interface TalentData {
  clients: number;
  totalRequisitions: number;
  pendingApproval: number;
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
  CLIENT_APPROVED: { label: "Approved", color: "bg-emerald-500" },
  CLIENT_REJECTED: { label: "Rejected", color: "bg-orange-500" },
  REJECTED: { label: "Dropped", color: "bg-red-500" },
  SELECTED: { label: "Selected", color: "bg-green-700" },
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [talentData, setTalentData] = useState<TalentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const promises: Promise<any>[] = [
          fetch("/api/talent/dashboard").then((r) => r.json()),
        ];
        if (isAdmin) {
          promises.push(fetch("/api/admin/stats").then((r) => r.json()));
        }
        const results = await Promise.all(promises);
        setTalentData(results[0]?.data || null);
        if (isAdmin && results[1]?.success) {
          setAdminStats(results[1].data);
        }
      } catch {}
      setLoading(false);
    }
    if (session?.user) fetchData();
  }, [session, isAdmin]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-7 bg-gray-200 rounded w-64 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-48" />
        </div>
        <StatCardSkeleton count={4} />
        <StatCardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-navy-900">
          Welcome back, {session?.user?.name || "Admin"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isAdmin
            ? "Here's an overview of your platform and recruitment pipeline."
            : "Here's an overview of your recruitment pipeline."}
        </p>
      </div>

      {/* Admin Stats (ADMIN only) */}
      {isAdmin && adminStats && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Platform Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Jobs"
              value={adminStats.totalJobs}
              sublabel={`${adminStats.activeJobs} active`}
              icon={Briefcase}
              bgColor="bg-blue-50"
              textColor="text-blue-600"
              href="/admin/jobs"
            />
            <StatCard
              label="Total Users"
              value={adminStats.totalUsers}
              sublabel="Job seekers & employers"
              icon={Users}
              bgColor="bg-green-50"
              textColor="text-green-600"
              href="/admin/users"
            />
            <StatCard
              label="Companies"
              value={adminStats.totalCompanies}
              sublabel="Registered employers"
              icon={Building2}
              bgColor="bg-purple-50"
              textColor="text-purple-600"
              href="/admin/companies"
            />
            <StatCard
              label="Applications"
              value={adminStats.totalApplications}
              sublabel="Total received"
              icon={FileText}
              bgColor="bg-orange-50"
              textColor="text-orange-600"
            />
          </div>
        </div>
      )}

      {/* Inquiries Alert (ADMIN only) */}
      {isAdmin && adminStats && adminStats.unreadInquiries > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-orange-500 p-4 flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            You have{" "}
            <span className="font-bold text-orange-600">
              {adminStats.unreadInquiries} unread
            </span>{" "}
            contact inquiries.
          </p>
          <Link
            href="/admin/inquiries"
            className="ml-auto text-sm font-medium text-primary-600 hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Talent Stats */}
      {talentData && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Recruitment Pipeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="Active Clients"
              value={talentData.clients}
              icon={UserSearch}
              bgColor="bg-blue-50"
              textColor="text-blue-600"
              href="/admin/clients"
            />
            <StatCard
              label="Requisitions"
              value={talentData.totalRequisitions}
              sublabel={`${talentData.pendingApproval} pending approval`}
              icon={FileText}
              bgColor="bg-indigo-50"
              textColor="text-indigo-600"
              href="/admin/requisitions"
            />
            <StatCard
              label="Candidates"
              value={talentData.totalCandidates}
              icon={Users}
              bgColor="bg-emerald-50"
              textColor="text-emerald-600"
              href="/admin/candidates"
            />
            <StatCard
              label="Interviews"
              value={talentData.totalInterviews}
              icon={Calendar}
              bgColor="bg-purple-50"
              textColor="text-purple-600"
              href="/admin/interviews"
            />
            <StatCard
              label="Pending Approval"
              value={talentData.pendingApproval}
              icon={Clock}
              bgColor="bg-amber-50"
              textColor="text-amber-600"
              href="/admin/requisitions?status=PENDING_APPROVAL"
            />
            <StatCard
              label="Placements"
              value={talentData.placements}
              icon={CheckCircle2}
              bgColor="bg-green-50"
              textColor="text-green-600"
            />
          </div>
        </div>
      )}

      {/* Pipeline Breakdown */}
      {talentData?.pipeline && Object.keys(talentData.pipeline).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Pipeline Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(pipelineStageLabels).map(([stage, { label, color }]) => (
              <div key={stage} className="text-center p-3 rounded-lg bg-gray-50">
                <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
                <p className="text-xl font-bold text-navy-900">
                  {talentData.pipeline[stage] || 0}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Candidates */}
        {talentData?.recentCandidates && talentData.recentCandidates.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy-900">Recent Candidates</h2>
              <Link
                href="/admin/candidates"
                className="text-sm text-primary-600 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {talentData.recentCandidates.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/candidates/${c.id}`}
                  className="flex items-center gap-3 p-2.5 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">{c.name}</p>
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
        {talentData?.upcomingInterviews && talentData.upcomingInterviews.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy-900">Upcoming Interviews</h2>
              <Link
                href="/admin/interviews"
                className="text-sm text-primary-600 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {talentData.upcomingInterviews.map((int: any) => (
                <Link
                  key={int.id}
                  href={`/admin/interviews/${int.id}`}
                  className="flex items-center gap-3 p-2.5 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">
                      {int.candidate?.name || "Candidate"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {int.candidateRequisition?.requisition?.title || "Interview"}
                    </p>
                  </div>
                  {int.scheduledStart && (
                    <span className="text-xs text-gray-500">
                      {new Date(int.scheduledStart).toLocaleDateString()}{" "}
                      {new Date(int.scheduledStart).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
        <h2 className="text-base font-semibold text-navy-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/admin/clients/new"
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <UserSearch className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Add New Client</span>
          </Link>
          <Link
            href="/admin/requisitions/new"
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Create Requisition</span>
          </Link>
          <Link
            href="/admin/candidates/new"
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Users className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">Upload Candidate CV</span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin/content"
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Briefcase className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Edit Website Content</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
