"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  href?: string;
}

export default function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  bgColor,
  textColor,
  href,
}: StatCardProps) {
  const numValue = typeof value === "string" ? parseInt(value) || 0 : value;

  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-navy-900 mt-1">
            {numValue === 0 ? "0" : value}
          </p>
          {numValue === 0 ? (
            <p className="text-xs text-gray-400 mt-1">No data yet</p>
          ) : sublabel ? (
            <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
          ) : null}
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
