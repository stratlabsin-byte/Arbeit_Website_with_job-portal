"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Calendar,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", href: "/talent", icon: LayoutDashboard },
  { label: "Clients", href: "/talent/clients", icon: Building2 },
  { label: "Requisitions", href: "/talent/requisitions", icon: FileText },
  { label: "Candidates", href: "/talent/candidates", icon: Users },
  { label: "Interviews", href: "/talent/interviews", icon: Calendar },
];

export default function TalentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      session?.user?.role !== "RECRUITER" &&
      session?.user?.role !== "ADMIN"
    ) {
      // Allow CLIENT_USER and CANDIDATE to pass through to their sub-layouts
      if (
        (session?.user?.role === "CLIENT_USER" && (pathname === "/talent/client" || pathname.startsWith("/talent/client/"))) ||
        (session?.user?.role === "CANDIDATE" && (pathname === "/talent/candidate" || pathname.startsWith("/talent/candidate/"))) ||
        (session?.user?.role === "JOB_SEEKER" && (pathname === "/talent/candidate" || pathname.startsWith("/talent/candidate/")))
      ) {
        return;
      }
      router.push("/");
    }
  }, [status, session, router, pathname]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Client portal (/talent/client/*) and candidate portal (/talent/candidate/*) handle their own chrome
  // Use exact path segments to avoid matching /talent/clients or /talent/candidates (recruiter pages)
  if (
    pathname === "/talent/client" || pathname.startsWith("/talent/client/") ||
    pathname === "/talent/candidate" || pathname.startsWith("/talent/candidate/")
  ) {
    return <>{children}</>;
  }

  const userRole = session?.user?.role;
  if (userRole !== "RECRUITER" && userRole !== "ADMIN") return null;

  const isActive = (href: string) => {
    if (href === "/talent") return pathname === "/talent";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#0A102F] text-white flex flex-col transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className={`p-4 border-b border-white/10 ${collapsed ? "px-3" : "p-6"}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#3147FF] rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              A
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-lg leading-tight">Talent Portal</h2>
                <p className="text-xs text-gray-400">Recruitment Hub</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-[#3147FF] text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && item.label}
            </Link>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:block p-3 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* User info */}
        {!collapsed && session?.user && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#3147FF] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {session.user.name?.[0] || "R"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{session.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1" />

          <button className="relative p-2 text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
