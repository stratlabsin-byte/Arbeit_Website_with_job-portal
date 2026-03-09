"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  INDUSTRIES,
  LOCATIONS,
} from "@/types";

interface JobFiltersProps {
  totalResults?: number;
}

export default function JobFilters({ totalResults }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    jobType: true,
    experienceLevel: true,
    industry: true,
    location: true,
    salary: true,
    remote: true,
  });

  const currentFilters = {
    jobType: searchParams.get("jobType") || "",
    experienceLevel: searchParams.get("experienceLevel") || "",
    industry: searchParams.get("industry") || "",
    location: searchParams.get("location") || "",
    salaryMin: searchParams.get("salaryMin") || "",
    salaryMax: searchParams.get("salaryMax") || "",
    isRemote: searchParams.get("isRemote") === "true",
  };

  const updateFilter = useCallback(
    (key: string, value: string | boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "" || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      params.delete("page");
      router.push(`/jobs?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleCheckbox = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key) || "";
      const values = current ? current.split(",") : [];
      const index = values.indexOf(value);
      if (index > -1) {
        values.splice(index, 1);
      } else {
        values.push(value);
      }
      const params = new URLSearchParams(searchParams.toString());
      if (values.length === 0) {
        params.delete(key);
      } else {
        params.set(key, values.join(","));
      }
      params.delete("page");
      router.push(`/jobs?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams();
    const keyword = searchParams.get("keyword");
    if (keyword) params.set("keyword", keyword);
    router.push(`/jobs?${params.toString()}`);
  }, [router, searchParams]);

  const hasActiveFilters =
    currentFilters.jobType ||
    currentFilters.experienceLevel ||
    currentFilters.industry ||
    currentFilters.location ||
    currentFilters.salaryMin ||
    currentFilters.salaryMax ||
    currentFilters.isRemote;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isChecked = (key: string, value: string): boolean => {
    const current = searchParams.get(key) || "";
    return current.split(",").includes(value);
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Job Type */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => toggleSection("jobType")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900 text-sm">Job Type</span>
          {expandedSections.jobType ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {expandedSections.jobType && (
          <div className="mt-3 space-y-2">
            {JOB_TYPES.map((type) => (
              <label
                key={type.value}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isChecked("jobType", type.value)}
                  onChange={() => toggleCheckbox("jobType", type.value)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Experience Level */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => toggleSection("experienceLevel")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900 text-sm">
            Experience Level
          </span>
          {expandedSections.experienceLevel ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {expandedSections.experienceLevel && (
          <div className="mt-3 space-y-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <label
                key={level.value}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isChecked("experienceLevel", level.value)}
                  onChange={() =>
                    toggleCheckbox("experienceLevel", level.value)
                  }
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                  {level.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Industry */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => toggleSection("industry")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900 text-sm">Industry</span>
          {expandedSections.industry ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {expandedSections.industry && (
          <div className="mt-3">
            <select
              value={currentFilters.industry}
              onChange={(e) => updateFilter("industry", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">All Industries</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => toggleSection("location")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900 text-sm">Location</span>
          {expandedSections.location ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {expandedSections.location && (
          <div className="mt-3">
            <select
              value={currentFilters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">All Locations</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Salary Range */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => toggleSection("salary")}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900 text-sm">
            Salary Range
          </span>
          {expandedSections.salary ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {expandedSections.salary && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Min (INR/year)
              </label>
              <input
                type="number"
                placeholder="e.g. 300000"
                value={currentFilters.salaryMin}
                onChange={(e) => updateFilter("salaryMin", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Max (INR/year)
              </label>
              <input
                type="number"
                placeholder="e.g. 1500000"
                value={currentFilters.salaryMax}
                onChange={(e) => updateFilter("salaryMax", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Remote Toggle */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => updateFilter("isRemote", !currentFilters.isRemote)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium text-gray-900 text-sm">
            Remote Only
          </span>
          {currentFilters.isRemote ? (
            <ToggleRight className="w-8 h-8 text-primary-600" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-gray-300" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-colors"
      >
        <SlidersHorizontal className="w-5 h-5" />
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto h-[calc(100vh-65px)]">
          {filterContent}
        </div>
      </div>
    </>
  );
}
