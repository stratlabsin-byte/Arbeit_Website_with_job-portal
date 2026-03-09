"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Users,
  Building2,
  FileText,
  TrendingUp,
  Eye,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalUsers: number;
  totalCompanies: number;
  totalApplications: number;
  totalInquiries: number;
  unreadInquiries: number;
  recentApplications: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
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
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Jobs",
      value: stats?.totalJobs || 0,
      sublabel: `${stats?.activeJobs || 0} active`,
      icon: Briefcase,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      sublabel: "Job seekers & employers",
      icon: Users,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Companies",
      value: stats?.totalCompanies || 0,
      sublabel: "Registered employers",
      icon: Building2,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Applications",
      value: stats?.totalApplications || 0,
      sublabel: "Total received",
      icon: FileText,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here&apos;s what&apos;s happening with Arbeit.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}
              >
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sublabel}</p>
          </div>
        ))}
      </div>

      {/* Inquiries Alert */}
      {stats?.unreadInquiries && stats.unreadInquiries > 0 && (
        <div className="card p-4 mb-8 border-l-4 border-l-orange-500 flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-orange-500" />
          <p className="text-sm text-gray-700">
            You have{" "}
            <span className="font-bold text-orange-600">
              {stats.unreadInquiries} unread
            </span>{" "}
            contact inquiries.
          </p>
          <a
            href="/admin/inquiries"
            className="ml-auto text-sm font-medium text-primary-600 hover:underline"
          >
            View All
          </a>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Manage Jobs</h3>
          <p className="text-sm text-gray-500 mb-4">
            Review, approve, or edit job listings posted by employers.
          </p>
          <a href="/admin/jobs" className="btn-primary text-sm px-4 py-2">
            View Jobs
          </a>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
          <p className="text-sm text-gray-500 mb-4">
            View and manage registered users, employers, and admins.
          </p>
          <a href="/admin/users" className="btn-primary text-sm px-4 py-2">
            View Users
          </a>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Contact Inquiries</h3>
          <p className="text-sm text-gray-500 mb-4">
            Respond to contact form submissions and recruitment inquiries.
          </p>
          <a href="/admin/inquiries" className="btn-primary text-sm px-4 py-2">
            View Inquiries
          </a>
        </div>
      </div>
    </div>
  );
}
