"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  Star,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  Users,
  Eye,
  Calendar,
} from "lucide-react";

interface EmployerStats {
  activeJobs: number;
  totalApplications: number;
  shortlisted: number;
  positionsFilled: number;
}

interface RecentApplication {
  id: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  job: {
    title: string;
  };
  status: string;
  appliedAt: string;
}

interface ActiveJob {
  id: string;
  title: string;
  slug: string;
  status: string;
  applicationCount: number;
  views: number;
  postedAt: string;
}

const statusBadgeClasses: Record<string, string> = {
  APPLIED: "badge-gray",
  VIEWED: "badge-blue",
  SHORTLISTED: "badge-orange",
  INTERVIEW: "badge-purple",
  OFFERED: "badge-green",
  HIRED: "badge-green",
  REJECTED: "bg-red-100 text-red-800",
};

export default function EmployerDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<EmployerStats>({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    positionsFilled: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employer's jobs
        const jobsRes = await fetch("/api/employers/jobs");
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          const jobs: ActiveJob[] = jobsData.data || [];
          setActiveJobs(jobs.filter((j) => j.status === "ACTIVE").slice(0, 5));
          setStats((prev) => ({
            ...prev,
            activeJobs: jobs.filter((j) => j.status === "ACTIVE").length,
            positionsFilled: jobs.filter((j) => j.status === "CLOSED").length,
          }));
        }

        // Fetch applications
        const appsRes = await fetch("/api/applications");
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          const apps: RecentApplication[] = appsData.data || [];
          setRecentApplications(apps.slice(0, 5));
          setStats((prev) => ({
            ...prev,
            totalApplications: apps.length,
            shortlisted: apps.filter((a) => a.status === "SHORTLISTED").length,
          }));
        }
      } catch (error) {
        console.error("Error fetching employer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Active Jobs",
      value: stats.activeJobs,
      icon: Briefcase,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Total Applications",
      value: stats.totalApplications,
      icon: FileText,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Shortlisted",
      value: stats.shortlisted,
      icon: Star,
      color: "text-orange-600 bg-orange-100",
    },
    {
      label: "Positions Filled",
      value: stats.positionsFilled,
      icon: CheckCircle,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-heading">
            Welcome, {session?.user?.name?.split(" ")[0] || "Employer"}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s an overview of your recruitment activity.
          </p>
        </div>
        <Link
          href="/employer/post-job"
          className="btn-primary hidden sm:flex items-center text-sm px-5 py-2.5"
        >
          <PlusCircle size={18} className="mr-2" />
          Post New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Post Job CTA */}
      <div className="sm:hidden">
        <Link
          href="/employer/post-job"
          className="btn-primary flex items-center justify-center w-full text-sm px-5 py-2.5"
        >
          <PlusCircle size={18} className="mr-2" />
          Post New Job
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h2>
            <Link
              href="/employer/applications"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <div className="text-center py-6">
              <Users size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No applications yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {app.user.image ? (
                        <img
                          src={app.user.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users size={14} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {app.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Applied for {app.job.title}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      statusBadgeClasses[app.status] || "badge-gray"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Job Listings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Job Listings
            </h2>
            <Link
              href="/employer/manage-jobs"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage All
            </Link>
          </div>
          {activeJobs.length === 0 ? (
            <div className="text-center py-6">
              <Briefcase size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 mb-3">
                No active job listings.
              </p>
              <Link
                href="/employer/post-job"
                className="btn-primary inline-block text-sm px-4 py-2"
              >
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <Link
                      href={`/employer/applications/${job.id}`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                    >
                      View
                      <ArrowRight size={12} className="ml-1" />
                    </Link>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <FileText size={12} className="mr-1" />
                      {job.applicationCount} applications
                    </span>
                    <span className="flex items-center">
                      <Eye size={12} className="mr-1" />
                      {job.views} views
                    </span>
                    <span className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {job.postedAt
                        ? new Date(job.postedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : "Draft"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
