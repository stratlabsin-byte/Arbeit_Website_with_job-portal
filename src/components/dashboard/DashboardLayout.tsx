"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import SidebarSection from "./SidebarSection";
import Breadcrumbs from "./Breadcrumbs";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  section?: string;
  roles?: string[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  brandTitle: string;
  brandSubtitle: string;
  collapsible?: boolean;
}

export default function DashboardLayout({
  children,
  sidebarItems,
  brandTitle,
  brandSubtitle,
  collapsible = true,
}: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = session?.user?.role || "";

  // Filter items by role
  const visibleItems = sidebarItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  // Group items by section
  const sections: { label: string; items: SidebarItem[] }[] = [];
  let currentSection = "";
  for (const item of visibleItems) {
    if (item.section && item.section !== currentSection) {
      currentSection = item.section;
      sections.push({ label: item.section, items: [item] });
    } else if (sections.length > 0) {
      sections[sections.length - 1].items.push(item);
    } else {
      sections.push({ label: "", items: [item] });
    }
  }

  const isActive = (href: string) => {
    // For root dashboard path, match exactly
    const basePaths = ["/admin", "/portal/client", "/portal/candidate"];
    if (basePaths.includes(href)) return pathname === href;
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
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-navy-900 text-white flex flex-col transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand */}
        <div className={`border-b border-white/10 ${collapsed ? "p-3" : "p-5"}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              A
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h2 className="font-heading font-bold text-base leading-tight truncate">
                  {brandTitle}
                </h2>
                <p className="text-[11px] text-gray-400 truncate">{brandSubtitle}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.label && (
                <SidebarSection label={section.label} collapsed={collapsed} />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        {collapsible && (
          <div className="hidden lg:block px-3 py-2 border-t border-white/10">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center w-full py-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        )}

        {/* User info */}
        <div className={`border-t border-white/10 ${collapsed ? "p-2" : "p-4"}`}>
          {session?.user && (
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{session.user.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{session.user.email}</p>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Breadcrumbs />
          </div>

          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
