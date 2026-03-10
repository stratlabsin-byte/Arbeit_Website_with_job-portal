"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Users,
  Building2,
  FileText,
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
} from "lucide-react";

interface AnalyticsData {
  totalJobs: number;
  totalUsers: number;
  totalApplications: number;
  totalCompanies: number;
  jobsByStatus: Record<string, number>;
  jobsByType: Record<string, number>;
  jobsByIndustry: { industry: string; count: number }[];
  applicationsByStatus: Record<string, number>;
  usersByRole: Record<string, number>;
  newUsersLast30Days: number;
  monthlyTrend: { month: string; count: number }[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-400",
  ACTIVE: "bg-green-500",
  PAUSED: "bg-yellow-500",
  CLOSED: "bg-red-500",
  EXPIRED: "bg-gray-600",
};

const applicationStatusColors: Record<string, string> = {
  APPLIED: "bg-blue-500",
  VIEWED: "bg-cyan-500",
  SHORTLISTED: "bg-indigo-500",
  INTERVIEW: "bg-purple-500",
  OFFERED: "bg-amber-500",
  HIRED: "bg-green-500",
  REJECTED: "bg-red-500",
  WITHDRAWN: "bg-gray-500",
};

const roleColors: Record<string, string> = {
  JOB_SEEKER: "bg-blue-500",
  EMPLOYER: "bg-purple-500",
  ADMIN: "bg-red-500",
};

const roleLabels: Record<string, string> = {
  JOB_SEEKER: "Job Seekers",
  EMPLOYER: "Employers",
  ADMIN: "Admins",
};

function formatLabel(str: string) {
  return str
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Failed to load analytics data.
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Jobs",
      value: data.totalJobs,
      icon: Briefcase,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Total Users",
      value: data.totalUsers,
      sublabel: `${data.newUsersLast30Days} new in last 30 days`,
      icon: Users,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Applications",
      value: data.totalApplications,
      icon: FileText,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Companies",
      value: data.totalCompanies,
      icon: Building2,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  const maxTrend = Math.max(...data.monthlyTrend.map((m) => m.count), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary-600" />
          Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Detailed breakdown of platform activity and metrics.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}
              >
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            {card.sublabel && (
              <p className="text-xs text-gray-400 mt-0.5">{card.sublabel}</p>
            )}
          </div>
        ))}
      </div>

      {/* Monthly Trend */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          Monthly Job Posting Trend
        </h2>
        <div className="flex items-end gap-3 h-48">
          {data.monthlyTrend.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-gray-700">
                {m.count}
              </span>
              <div
                className="w-full bg-primary-500 rounded-t-md transition-all duration-500"
                style={{
                  height: `${Math.max((m.count / maxTrend) * 100, 4)}%`,
                  minHeight: "4px",
                }}
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {m.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Jobs by Status */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            Jobs by Status
          </h2>
          <div className="space-y-3">
            {Object.entries(data.jobsByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {formatLabel(status)}
                  </span>
                  <span className="text-sm text-gray-500">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${statusColors[status] || "bg-gray-400"}`}
                    style={{
                      width: `${Math.max((count / data.totalJobs) * 100, 2)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(data.jobsByStatus).length === 0 && (
              <p className="text-sm text-gray-400">No job data available.</p>
            )}
          </div>
        </div>

        {/* Applications by Status */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-orange-600" />
            Applications by Status
          </h2>
          <div className="space-y-3">
            {Object.entries(data.applicationsByStatus).map(
              ([status, count]) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {formatLabel(status)}
                    </span>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${applicationStatusColors[status] || "bg-gray-400"}`}
                      style={{
                        width: `${Math.max((count / data.totalApplications) * 100, 2)}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
            {Object.keys(data.applicationsByStatus).length === 0 && (
              <p className="text-sm text-gray-400">
                No application data available.
              </p>
            )}
          </div>
        </div>

        {/* Jobs by Industry */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-indigo-600" />
            Top Industries
          </h2>
          <div className="space-y-3">
            {data.jobsByIndustry.map((item, idx) => {
              const maxCount = data.jobsByIndustry[0]?.count || 1;
              return (
                <div key={item.industry}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate mr-2">
                      {item.industry}
                    </span>
                    <span className="text-sm text-gray-500 flex-shrink-0">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-indigo-500"
                      style={{
                        width: `${Math.max((item.count / maxCount) * 100, 2)}%`,
                        opacity: 1 - idx * 0.07,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {data.jobsByIndustry.length === 0 && (
              <p className="text-sm text-gray-400">
                No industry data available.
              </p>
            )}
          </div>
        </div>

        {/* Users by Role */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-green-600" />
            Users by Role
          </h2>
          <div className="space-y-3">
            {Object.entries(data.usersByRole).map(([role, count]) => (
              <div key={role}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {roleLabels[role] || formatLabel(role)}
                  </span>
                  <span className="text-sm text-gray-500">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${roleColors[role] || "bg-gray-400"}`}
                    style={{
                      width: `${Math.max((count / data.totalUsers) * 100, 2)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(data.usersByRole).length === 0 && (
              <p className="text-sm text-gray-400">No user data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Jobs by Type */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-cyan-600" />
          Jobs by Type
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(data.jobsByType).map(([type, count]) => (
            <div
              key={type}
              className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-1">{formatLabel(type)}</p>
            </div>
          ))}
          {Object.keys(data.jobsByType).length === 0 && (
            <p className="text-sm text-gray-400 col-span-full">
              No job type data available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
