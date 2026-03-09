"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Star,
  Calendar,
  Eye,
  Upload,
  Search,
  UserCog,
  Briefcase,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";

interface DashboardStats {
  totalApplications: number;
  shortlisted: number;
  interviews: number;
  profileViews: number;
}

interface ApplicationItem {
  id: string;
  job: {
    title: string;
    company: { name: string; logo?: string };
    location: string;
  };
  status: string;
  appliedAt: string;
}

interface RecommendedJob {
  id: string;
  title: string;
  slug: string;
  company: { name: string; logo?: string };
  location: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  showSalary: boolean;
}

const statusColors: Record<string, string> = {
  APPLIED: "badge-gray",
  VIEWED: "badge-blue",
  SHORTLISTED: "badge-orange",
  INTERVIEW: "badge-purple",
  OFFERED: "badge-green",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "badge-gray",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0,
    profileViews: 0,
  });
  const [recentApplications, setRecentApplications] = useState<ApplicationItem[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch applications
        const appsRes = await fetch("/api/applications");
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          const apps: ApplicationItem[] = appsData.data || [];
          setRecentApplications(apps.slice(0, 5));
          setStats({
            totalApplications: apps.length,
            shortlisted: apps.filter((a: ApplicationItem) => a.status === "SHORTLISTED").length,
            interviews: apps.filter((a: ApplicationItem) => a.status === "INTERVIEW").length,
            profileViews: 0,
          });
        }

        // Fetch profile for completion
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const profile = profileData.data;
          if (profile) {
            let completed = 0;
            let total = 8;
            if (profile.headline) completed++;
            if (profile.summary) completed++;
            if (profile.skills) completed++;
            if (profile.education) completed++;
            if (profile.experience) completed++;
            if (profile.resumeUrl) completed++;
            if (profile.location) completed++;
            if (profile.linkedinUrl) completed++;
            setProfileCompletion(Math.round((completed / total) * 100));
          }
        }

        // Fetch recommended jobs
        const jobsRes = await fetch("/api/jobs?limit=4");
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setRecommendedJobs(jobsData.data || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
      label: "Total Applications",
      value: stats.totalApplications,
      icon: FileText,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Shortlisted",
      value: stats.shortlisted,
      icon: Star,
      color: "text-orange-600 bg-orange-100",
    },
    {
      label: "Interviews",
      value: stats.interviews,
      icon: Calendar,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Profile Views",
      value: stats.profileViews,
      icon: Eye,
      color: "text-green-600 bg-green-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="section-heading">
          Welcome back, {session?.user?.name?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your job search.
        </p>
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

      {/* Profile completion + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Completion */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profile Completion
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {profileCompletion}%
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {profileCompletion < 100
              ? "Complete your profile to increase visibility to employers."
              : "Great! Your profile is complete."}
          </p>
          {profileCompletion < 100 && (
            <Link
              href="/dashboard/profile"
              className="btn-primary inline-flex items-center mt-4 text-sm px-4 py-2"
            >
              Complete Profile
              <ArrowRight size={16} className="ml-2" />
            </Link>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/dashboard/profile"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <UserCog size={24} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                Update Profile
              </span>
            </Link>
            <Link
              href="/jobs"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Search size={24} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                Browse Jobs
              </span>
            </Link>
            <Link
              href="/dashboard/profile#resume"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Upload size={24} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                Upload Resume
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Applications
          </h2>
          <Link
            href="/dashboard/applications"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </Link>
        </div>
        {recentApplications.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No applications yet.</p>
            <Link href="/jobs" className="btn-primary inline-block mt-3 text-sm px-4 py-2">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    {app.job.company.logo ? (
                      <img
                        src={app.job.company.logo}
                        alt={app.job.company.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <Briefcase size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {app.job.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {app.job.company.name} &bull; {app.job.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      statusColors[app.status] || "badge-gray"
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Jobs */}
      {recommendedJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recommended Jobs
            </h2>
            <Link
              href="/jobs"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.map((job) => (
              <div key={job.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {job.company.logo ? (
                      <img
                        src={job.company.logo}
                        alt={job.company.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <Briefcase size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-gray-500">{job.company.name}</p>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {job.jobType.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
