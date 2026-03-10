"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Search,
  Loader2,
  CheckSquare,
  Square,
  Download,
  MapPin,
  Briefcase,
  Building2,
} from "lucide-react";

interface ScrapedJob {
  title: string;
  description: string | null;
  location: string | null;
  department: string | null;
  workModel: string | null;
  jobType: string | null;
  experienceMin: number | null;
  experienceMax: number | null;
  skills: string[];
  url: string | null;
}

interface Client {
  id: string;
  name: string;
}

export default function ImportJobsPage() {
  const [url, setUrl] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<ScrapedJob[]>([]);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    fetch("/api/talent/clients?limit=100")
      .then((r) => r.json())
      .then((json) => setClients(json.data || []));
  }, []);

  async function handleScan() {
    if (!url.trim()) return;
    setScanning(true);
    setError("");
    setSuccess("");
    setJobs([]);
    setSelected(new Set());
    setScanned(false);

    try {
      const res = await fetch("/api/talent/ai/import-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to scan");

      const result = json.data;
      setJobs(result.jobs || []);
      setCompanyName(result.companyName);
      setScanned(true);

      // Select all by default
      const all = new Set<number>();
      (result.jobs || []).forEach((_: any, i: number) => all.add(i));
      setSelected(all);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  }

  async function handleImport() {
    if (!clientId) {
      setError("Please select a client first");
      return;
    }
    if (selected.size === 0) {
      setError("Please select at least one job to import");
      return;
    }

    setImporting(true);
    setError("");

    try {
      const selectedJobs = jobs.filter((_, i) => selected.has(i));
      const res = await fetch("/api/talent/ai/import-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          clientId,
          action: "import",
          jobs: selectedJobs,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to import");

      setSuccess(json.message || `${selectedJobs.length} jobs imported!`);
      setJobs([]);
      setSelected(new Set());
      setScanned(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  function toggleSelect(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === jobs.length) {
      setSelected(new Set());
    } else {
      const all = new Set<number>();
      jobs.forEach((_, i) => all.add(i));
      setSelected(all);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/talent/requisitions"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Requisitions
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Globe className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0A102F]">Import Jobs from Website</h1>
          <p className="text-sm text-gray-500">
            Paste a client&apos;s careers page URL to scan and import job listings
          </p>
        </div>
      </div>

      {/* Scan Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Careers Page URL</label>
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://company.com/careers"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3147FF]/20 focus:border-[#3147FF] outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
          />
          <button
            onClick={handleScan}
            disabled={scanning || !url.trim()}
            className="px-6 py-2.5 bg-[#3147FF] text-white rounded-lg font-medium hover:bg-[#2a3de6] disabled:opacity-50 flex items-center gap-2"
          >
            {scanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Scan Jobs
              </>
            )}
          </button>
        </div>

        {scanning && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              AI is analyzing the page and extracting job listings. This may take 10-20 seconds...
            </p>
          </div>
        )}
      </div>

      {/* Error / Success */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-green-700">{success}</p>
          <Link
            href="/talent/requisitions"
            className="text-sm text-green-800 font-medium underline mt-1 inline-block"
          >
            View Requisitions
          </Link>
        </div>
      )}

      {/* Results */}
      {scanned && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-[#0A102F]">
                  {jobs.length} Job{jobs.length !== 1 ? "s" : ""} Found
                  {companyName && (
                    <span className="text-gray-500 font-normal"> at {companyName}</span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Select the jobs you want to import as requisitions
                </p>
              </div>
              {jobs.length > 0 && (
                <button
                  onClick={toggleAll}
                  className="text-sm text-[#3147FF] hover:underline"
                >
                  {selected.size === jobs.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>

            {jobs.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No job listings found on this page. Try a different URL.
              </p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job, index) => (
                  <div
                    key={index}
                    onClick={() => toggleSelect(index)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selected.has(index)
                        ? "border-[#3147FF] bg-indigo-50/50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {selected.has(index) ? (
                          <CheckSquare className="w-5 h-5 text-[#3147FF]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#0A102F]">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {job.location}
                            </span>
                          )}
                          {job.department && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" /> {job.department}
                            </span>
                          )}
                          {job.jobType && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5" /> {job.jobType}
                            </span>
                          )}
                          {job.workModel && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                              {job.workModel}
                            </span>
                          )}
                        </div>
                        {job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {job.skills.slice(0, 6).map((skill, si) => (
                              <span
                                key={si}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 6 && (
                              <span className="text-xs text-gray-400">
                                +{job.skills.length - 6} more
                              </span>
                            )}
                          </div>
                        )}
                        {job.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {job.description.substring(0, 200)}
                            {job.description.length > 200 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Import Section */}
          {jobs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-[#0A102F] mb-4">Import Settings</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Client *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3147FF]/20 focus:border-[#3147FF] outline-none"
                >
                  <option value="">Select a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  {selected.size} job{selected.size !== 1 ? "s" : ""} selected for import
                </p>
                <button
                  onClick={handleImport}
                  disabled={importing || selected.size === 0 || !clientId}
                  className="px-6 py-2.5 bg-[#3147FF] text-white rounded-lg font-medium hover:bg-[#2a3de6] disabled:opacity-50 flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Importing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Import {selected.size} Job
                      {selected.size !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
