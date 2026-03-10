"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  Briefcase,
  LayoutDashboard,
  Building2,
  BookmarkCheck,
  FileText,
} from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const isEmployer = session?.user?.role === "EMPLOYER";
  const isAdmin = session?.user?.role === "ADMIN";

  // Default nav items (used as fallback)
  const defaultNavItems = [
    { label: "Home", href: "/" },
    {
      label: "Jobs",
      href: "/jobs",
      children: [
        { label: "Browse All Jobs", href: "/jobs" },
        { label: "Jobs by Industry", href: "/jobs?view=industry" },
        { label: "Remote Jobs", href: "/jobs?isRemote=true" },
        { label: "Fresher Jobs", href: "/jobs?experienceLevel=ENTRY" },
      ],
    },
    { label: "Contracting", href: "/contracting" },
    {
      label: "Recruitment",
      href: "/recruitment",
      children: [
        { label: "Recruitment Services", href: "/recruitment" },
        { label: "Information Technology", href: "/jobs?industry=Information+Technology" },
        { label: "Banking & Finance", href: "/jobs?industry=Banking+%26+Financial+Services" },
        { label: "AI & Data Science", href: "/jobs?industry=AI+%26+Data+Science" },
        { label: "Agriculture", href: "/jobs?industry=Agriculture+%26+Agritech" },
      ],
    },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const [navItems, setNavItems] = useState(defaultNavItems);

  useEffect(() => {
    fetch("/api/content?section=navigation")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && Array.isArray(data.data)) {
          // Filter out hidden nav items at all levels
          const filterHidden = (items: any[]): any[] =>
            items
              .filter((item: any) => !item.hidden)
              .map((item: any) => {
                const filtered = item.children ? filterHidden(item.children) : undefined;
                if (filtered && filtered.length === 0) {
                  const { children, ...rest } = item;
                  return rest;
                }
                return { ...item, children: filtered };
              });
          setNavItems(filterHidden(data.data));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled
          ? "shadow-md"
          : "shadow-none"
      }`}
    >
      {/* Top accent bar */}
      <div className="h-[3px] bg-[#3147FF]" />

      <div className="container-main">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 shrink-0">
            <div className="w-9 h-9 rounded-md bg-[#0A102F] flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">A</span>
            </div>
            <span className="text-[22px] font-heading font-bold tracking-tight">
              <span className="text-[#0A102F]">arbe</span>
              <span className="text-[#3147FF]">it</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-0.5 ml-10">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() =>
                  item.children && setActiveDropdown(item.label)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.href && item.href !== "#" ? (
                  <Link
                    href={item.href}
                    className={`flex items-center px-3.5 py-2 text-[13px] font-semibold uppercase tracking-wide rounded-md transition-all duration-200 ${
                      pathname === item.href
                        ? "text-[#3147FF] bg-blue-50"
                        : "text-[#0A102F] hover:text-[#3147FF] hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        className={`ml-1 w-3.5 h-3.5 transition-transform duration-200 ${
                          activeDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={() =>
                      item.children &&
                      setActiveDropdown(
                        activeDropdown === item.label ? null : item.label
                      )
                    }
                    className={`flex items-center px-3.5 py-2 text-[13px] font-semibold uppercase tracking-wide rounded-md transition-all duration-200 text-[#0A102F] hover:text-[#3147FF] hover:bg-gray-50`}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        className={`ml-1 w-3.5 h-3.5 transition-transform duration-200 ${
                          activeDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                )}

                {/* Dropdown */}
                {item.children && activeDropdown === item.label && (
                  <div
                    className="absolute top-full left-0 mt-0 w-60 bg-white rounded-lg shadow-lg border border-gray-200/80 py-1.5"
                    style={{
                      animation: "dropdownSlide 0.2s ease-out forwards",
                    }}
                  >
                    {item.children.map((child: any) => (
                      <div
                        key={child.label}
                        className="relative"
                        onMouseEnter={() =>
                          child.children && setActiveSubmenu(child.label)
                        }
                        onMouseLeave={() => setActiveSubmenu(null)}
                      >
                        {child.href && child.href !== "#" ? (
                          <Link
                            href={child.href}
                            className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 ${
                              pathname === child.href
                                ? "text-[#3147FF] bg-blue-50 font-medium"
                                : "text-[#0A102F]/80 hover:bg-blue-50 hover:text-[#3147FF]"
                            }`}
                          >
                            {child.label}
                            {child.children && (
                              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                            )}
                          </Link>
                        ) : (
                          <button
                            onClick={() =>
                              child.children &&
                              setActiveSubmenu(
                                activeSubmenu === child.label ? null : child.label
                              )
                            }
                            className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-[#0A102F]/80 hover:bg-blue-50 hover:text-[#3147FF] transition-colors duration-150"
                          >
                            {child.label}
                            {child.children && (
                              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                            )}
                          </button>
                        )}

                        {/* Nested submenu (flyout right) */}
                        {child.children && activeSubmenu === child.label && (
                          <div
                            className="absolute left-full top-0 ml-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200/80 py-1.5"
                            style={{
                              animation: "dropdownSlide 0.15s ease-out forwards",
                            }}
                          >
                            {child.children.map((sub: any) => (
                              <Link
                                key={sub.label}
                                href={sub.href}
                                className={`block px-4 py-2.5 text-sm transition-colors duration-150 ${
                                  pathname === sub.href
                                    ? "text-[#3147FF] bg-blue-50 font-medium"
                                    : "text-[#0A102F]/80 hover:bg-blue-50 hover:text-[#3147FF]"
                                }`}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side */}
          <div className="hidden lg:flex items-center space-x-3 ml-auto pl-6">
            {session ? (
              <div className="flex items-center space-x-3">
                {/* Search Jobs CTA */}
                <Link
                  href="/jobs"
                  className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-[#3147FF] rounded-md hover:bg-[#2a3de6] transition-colors duration-200 shadow-sm"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Search Jobs
                </Link>

                {/* User Menu */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown("user")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200">
                    <div className="w-8 h-8 rounded-full bg-[#0A102F] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[#0A102F]">
                      {session.user.name?.split(" ")[0] || "Account"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                        activeDropdown === "user" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {activeDropdown === "user" && (
                    <div
                      className="absolute top-full right-0 mt-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200/80 py-1.5"
                      style={{
                        animation: "dropdownSlide 0.2s ease-out forwards",
                      }}
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-[#0A102F]">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {session.user.email}
                        </p>
                      </div>

                      {isEmployer ? (
                        <>
                          <Link href="/employer/dashboard" className="flex items-center px-4 py-2.5 text-sm text-[#0A102F]/80 hover:bg-blue-50 hover:text-[#3147FF] transition-colors duration-150">
                            <LayoutDashboard className="w-4 h-4 mr-3 opacity-60" />Dashboard
                          </Link>
                          <Link href="/employer/post-job" className="flex items-center px-4 py-2.5 text-sm text-[#0A102F]/80 hover:bg-blue-50 hover:text-[#3147FF] transition-colors duration-150">
                            <Briefcase className="w-4 h-4 mr-3 opacity-60" />Post a Job
                          </Link>
                          <Link href="/employer/manage-jobs" className="flex items-center px-4 py-2.5 text-sm text-[#0A102F]/80 hover:bg-blue-50 hover:text-[#3147FF] transition-colors duration-150">
                            <Building2 className="w-4 h-4 mr-3 opacity-60" />Manage Jobs
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-sm text-[#0A102F]/80 hover:bg-blue-50 hover:text-[#3147FF] transition-colors duration-150">
                            <LayoutDashboard className="w-4 h-4 mr-3 opacity-60" />Dashboard
                          </Link>
                          <Link href="/dashboard/profile" className="flex items-center px-4 py-2.5 text-sm text-[#0A102F]/80 hover:bg-blue-50 hover:text-[#3147FF] transition-colors duration-150">
                            <User className="w-4 h-4 mr-3 opacity-60" />My Profile
                          </Link>
                          <Link href="/dashboard/applications" className="flex items-center px-4 py-2.5 text-sm text-[#0A102F]/80 hover:bg-blue-50 hover:text-[#3147FF] transition-colors duration-150">
                            <FileText className="w-4 h-4 mr-3 opacity-60" />Applications
                          </Link>
                          <Link href="/dashboard/saved-jobs" className="flex items-center px-4 py-2.5 text-sm text-[#0A102F]/80 hover:bg-blue-50 hover:text-[#3147FF] transition-colors duration-150">
                            <BookmarkCheck className="w-4 h-4 mr-3 opacity-60" />Saved Jobs
                          </Link>
                        </>
                      )}
                      <hr className="my-1.5 border-gray-100" />
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        <LogOut className="w-4 h-4 mr-3 opacity-60" />Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Search Jobs CTA */}
                <Link
                  href="/jobs"
                  className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-[#3147FF] rounded-md hover:bg-[#2a3de6] transition-colors duration-200 shadow-sm"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Search Jobs
                </Link>

                <div className="w-px h-6 bg-gray-200" />

                <Link
                  href="/login"
                  className="text-sm px-4 py-2 font-semibold text-[#0A102F] hover:text-[#3147FF] rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-4 py-2 font-semibold text-white bg-[#0A102F] rounded-md hover:bg-[#0A102F]/90 transition-colors duration-200"
                >
                  Sign Up
                </Link>
                <Link
                  href="/employers"
                  className="text-sm font-medium px-3 py-2 text-gray-500 hover:text-[#3147FF] transition-colors duration-200"
                >
                  For Employers
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Search Jobs + Menu Toggle */}
          <div className="flex lg:hidden items-center space-x-2">
            <Link
              href="/jobs"
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-[#3147FF] rounded-md"
            >
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
              Jobs
            </Link>
            <button
              className="p-2 rounded-md hover:bg-gray-100 text-[#0A102F] transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="container-main py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={`flex-1 block px-4 py-3 rounded-md text-sm font-semibold uppercase tracking-wide ${
                      pathname === item.href
                        ? "text-[#3147FF] bg-blue-50"
                        : "text-[#0A102F] hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === item.label ? null : item.label
                        )
                      }
                      className="p-3 text-gray-400 hover:text-[#3147FF]"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
                {item.children && activeDropdown === item.label && (
                  <div className="ml-4 mb-2 border-l-2 border-blue-100 pl-3 space-y-0.5">
                    {item.children.map((child: any) => (
                      <div key={child.label}>
                        <div className="flex items-center">
                          <Link
                            href={child.href}
                            className="flex-1 block px-3 py-2 text-sm text-[#0A102F]/70 hover:text-[#3147FF] transition-colors duration-150"
                          >
                            {child.label}
                          </Link>
                          {child.children && (
                            <button
                              onClick={() =>
                                setActiveSubmenu(
                                  activeSubmenu === child.label ? null : child.label
                                )
                              }
                              className="p-2 text-gray-400 hover:text-[#3147FF]"
                            >
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  activeSubmenu === child.label ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>
                        {child.children && activeSubmenu === child.label && (
                          <div className="ml-4 mb-1 border-l-2 border-blue-50 pl-3 space-y-0.5">
                            {child.children.map((sub: any) => (
                              <Link
                                key={sub.label}
                                href={sub.href}
                                className="block px-3 py-1.5 text-sm text-[#0A102F]/60 hover:text-[#3147FF] transition-colors duration-150"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <hr className="border-gray-100 my-2" />

            {session ? (
              <div className="space-y-1 px-1">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-[#0A102F]">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{session.user.email}</p>
                </div>
                {isEmployer ? (
                  <>
                    <Link href="/employer/dashboard" className="block px-4 py-2.5 text-sm text-[#0A102F]/80 hover:text-[#3147FF]">
                      Dashboard
                    </Link>
                    <Link href="/employer/post-job" className="block px-4 py-2.5 text-sm text-[#0A102F]/80 hover:text-[#3147FF]">
                      Post a Job
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-[#0A102F]/80 hover:text-[#3147FF]">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/profile" className="block px-4 py-2.5 text-sm text-[#0A102F]/80 hover:text-[#3147FF]">
                      My Profile
                    </Link>
                  </>
                )}
                <hr className="border-gray-100" />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-3 px-4 pt-2">
                <Link
                  href="/login"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-[#0A102F] border-2 border-gray-200 rounded-md hover:border-[#3147FF] hover:text-[#3147FF] transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-[#3147FF] rounded-md hover:bg-[#2a3de6] transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dropdown animation keyframes */}
      <style jsx>{`
        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}
