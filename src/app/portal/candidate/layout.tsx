"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout, { SidebarItem } from "@/components/dashboard/DashboardLayout";
import { User, FileText, Calendar } from "lucide-react";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/portal/candidate", icon: User },
  { label: "Applications", href: "/portal/candidate/applications", icon: FileText },
  { label: "Interviews", href: "/portal/candidate/interviews", icon: Calendar },
];

export default function CandidatePortalLayout({
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
      session?.user?.role !== "CANDIDATE" &&
      session?.user?.role !== "JOB_SEEKER" &&
      session?.user?.role !== "ADMIN"
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
  if (userRole !== "CANDIDATE" && userRole !== "JOB_SEEKER" && userRole !== "ADMIN") return null;

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      brandTitle="Candidate Portal"
      brandSubtitle="Arbeit Careers"
      collapsible={false}
    >
      {children}
    </DashboardLayout>
  );
}
