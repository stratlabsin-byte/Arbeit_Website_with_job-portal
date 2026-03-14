"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const labelMap: Record<string, string> = {
  admin: "Dashboard",
  content: "Website Content",
  jobs: "Jobs",
  users: "Users",
  companies: "Companies",
  inquiries: "Inquiries",
  analytics: "Analytics",
  settings: "Settings",
  clients: "Clients",
  requisitions: "Requisitions",
  candidates: "Candidates",
  interviews: "Interviews",
  new: "New",
  edit: "Edit",
  import: "Import",
  schedule: "Schedule",
  portal: "Portal",
  client: "Client",
  candidate: "Candidate",
  applications: "Applications",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link href={`/${segments[0]}`} className="text-gray-400 hover:text-gray-600 transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      {segments.slice(1).map((segment, index) => {
        const href = "/" + segments.slice(0, index + 2).join("/");
        const isLast = index === segments.length - 2;
        const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            {isLast ? (
              <span className="text-gray-700 font-medium">{label}</span>
            ) : (
              <Link href={href} className="text-gray-400 hover:text-gray-600 transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
