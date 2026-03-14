"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  FileText,
  Building2,
  Settings,
} from "lucide-react";
import DashboardLayout, { SidebarItem } from "@/components/dashboard/DashboardLayout";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard, section: "Overview" },
  { label: "Post a Job", href: "/employer/post-job", icon: PlusCircle, section: "Jobs" },
  { label: "Manage Jobs", href: "/employer/manage-jobs", icon: FolderKanban },
  { label: "Applications", href: "/employer/applications", icon: FileText },
  { label: "Company Profile", href: "/employer/company-profile", icon: Building2, section: "Account" },
  { label: "Settings", href: "/employer/settings", icon: Settings },
];

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.role !== "EMPLOYER" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!session || (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN")) return null;

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      brandTitle="Employer Portal"
      brandSubtitle="Manage your hiring"
      collapsible={true}
    >
      {children}
    </DashboardLayout>
  );
}
