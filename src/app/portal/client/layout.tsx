"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout, { SidebarItem } from "@/components/dashboard/DashboardLayout";
import { Building2, FileText, Users, Calendar } from "lucide-react";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/portal/client", icon: Building2 },
  { label: "Requisitions", href: "/portal/client/requisitions", icon: FileText },
  { label: "Candidates", href: "/portal/client/candidates", icon: Users },
  { label: "Interviews", href: "/portal/client/interviews", icon: Calendar },
];

export default function ClientPortalLayout({
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
      session?.user?.role !== "CLIENT_USER" &&
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
  if (userRole !== "CLIENT_USER" && userRole !== "ADMIN") return null;

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      brandTitle="Client Portal"
      brandSubtitle="Arbeit Recruitment"
      collapsible={false}
    >
      {children}
    </DashboardLayout>
  );
}
