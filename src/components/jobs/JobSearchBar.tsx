"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Briefcase } from "lucide-react";
import { INDUSTRIES, LOCATIONS } from "@/types";

interface JobSearchBarProps {
  variant?: "hero" | "compact";
  defaultValues?: {
    keyword?: string;
    location?: string;
    industry?: string;
  };
}

export default function JobSearchBar({
  variant = "hero",
  defaultValues,
}: JobSearchBarProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(defaultValues?.keyword || "");
  const [location, setLocation] = useState(defaultValues?.location || "");
  const [industry, setIndustry] = useState(defaultValues?.industry || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);
    if (industry) params.set("industry", industry);
    router.push(`/jobs?${params.toString()}`);
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Job title, skill, or company"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
        <button type="submit" className="btn-primary text-sm px-5 py-2.5">
          Search
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl shadow-xl p-3 md:p-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Keyword */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Job title, skill, or company"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
          />
        </div>

        {/* Location */}
        <div className="md:col-span-3 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base appearance-none bg-white"
          >
            <option value="">All Locations</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Industry */}
        <div className="md:col-span-3 relative">
          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base appearance-none bg-white"
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 text-base"
          >
            Search Jobs
          </button>
        </div>
      </div>
    </form>
  );
}
