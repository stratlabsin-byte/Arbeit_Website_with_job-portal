"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  ChevronDown,
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

  const navItems = [
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white shadow-sm"
      }`}
    >
      <div className="container-main">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-2xl font-heading font-bold">
              <span className="text-primary-600">arbe</span>
              <span className="text-primary-800">it</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() =>
                  item.children && setActiveDropdown(item.label)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === item.href
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown className="ml-1 w-4 h-4" />
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in-up">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side — Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {session ? (
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("user")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {session.user.name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {activeDropdown === "user" && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in-up">
                    {isEmployer ? (
                      <>
                        <Link href="/employer/dashboard" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                          <LayoutDashboard className="w-4 h-4 mr-3" />Dashboard
                        </Link>
                        <Link href="/employer/post-job" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                          <Briefcase className="w-4 h-4 mr-3" />Post a Job
                        </Link>
                        <Link href="/employer/manage-jobs" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                          <Building2 className="w-4 h-4 mr-3" />Manage Jobs
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                          <LayoutDashboard className="w-4 h-4 mr-3" />Dashboard
                        </Link>
                        <Link href="/dashboard/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                          <User className="w-4 h-4 mr-3" />My Profile
                        </Link>
                        <Link href="/dashboard/applications" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                          <FileText className="w-4 h-4 mr-3" />Applications
                        </Link>
                        <Link href="/dashboard/saved-jobs" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                          <BookmarkCheck className="w-4 h-4 mr-3" />Saved Jobs
                        </Link>
                      </>
                    )}
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm px-4 py-2">
                  Log In
                </Link>
                <Link href="/register" className="btn-primary text-sm px-4 py-2">
                  Sign Up
                </Link>
                <Link
                  href="/employers"
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 px-3 py-2"
                >
                  For Employers
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="container-main py-4 space-y-2">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                    pathname === item.href
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-500 hover:text-primary-600"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <hr className="border-gray-100" />
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600"
              >
                Sign Out
              </button>
            ) : (
              <div className="flex gap-3 px-4 pt-2">
                <Link href="/login" className="btn-secondary text-sm flex-1 py-2.5">
                  Log In
                </Link>
                <Link href="/register" className="btn-primary text-sm flex-1 py-2.5">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
