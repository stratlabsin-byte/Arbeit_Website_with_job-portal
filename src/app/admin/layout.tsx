"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout, { SidebarItem } from "@/components/dashboard/DashboardLayout";
import {
  LayoutDashboard,
  FileEdit,
  Briefcase,
  Users,
  Building2,
  MessageSquare,
  BarChart3,
  Settings,
  UserSearch,
  FileText,
  Calendar,
} from "lucide-react";

const sidebarItems: SidebarItem[] = [
  // OVERVIEW
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, section: "Overview" },

  // WEBSITE (ADMIN only)
  { label: "Website Content", href: "/admin/content", icon: FileEdit, section: "Website", roles: ["ADMIN"] },
  { label: "Jobs", href: "/admin/jobs", icon: Briefcase, roles: ["ADMIN"] },
  { label: "Companies", href: "/admin/companies", icon: Building2, roles: ["ADMIN"] },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare, roles: ["ADMIN"] },
  { label: "Users", href: "/admin/users", icon: Users, roles: ["ADMIN"] },

  // TALENT
  { label: "Clients", href: "/admin/clients", icon: UserSearch, section: "Talent", roles: ["ADMIN", "RECRUITER"] },
  { label: "Requisitions", href: "/admin/requisitions", icon: FileText, roles: ["ADMIN", "RECRUITER"] },
  { label: "Candidates", href: "/admin/candidates", icon: Users, roles: ["ADMIN", "RECRUITER"] },
  { label: "Interviews", href: "/admin/interviews", icon: Calendar, roles: ["ADMIN", "RECRUITER"] },

  // SYSTEM (ADMIN only)
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, section: "System", roles: ["ADMIN"] },
  { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["ADMIN"] },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      session?.user?.role !== "ADMIN" &&
      session?.user?.role !== "RECRUITER"
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const userRole = session?.user?.role;
  if (userRole !== "ADMIN" && userRole !== "RECRUITER") return null;

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      brandTitle="Arbeit Admin"
      brandSubtitle="Management Console"
    >
      {children}
    </DashboardLayout>
  );
}
