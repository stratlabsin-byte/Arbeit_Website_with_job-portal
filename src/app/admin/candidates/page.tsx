"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, Search, ChevronRight, FileText } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string | null;
  currentRole: string | null;
  currentCompany: string | null;
  experienceYears: number;
  location: string | null;
  source: string | null;
  createdAt: string;
  cvVersions: any[];
  _count: { requisitions: number; interviews: number };
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCandidates();
  }, [search]);

  async function fetchCandidates() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/talent/candidates?${params}`);
    const json = await res.json();
    setCandidates(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A102F]">Candidates</h1>
          <p className="text-gray-500 text-sm mt-1">{total} candidates in pool</p>
        </div>
        <Link
          href="/admin/candidates/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3147FF] text-white rounded-lg text-sm font-medium hover:bg-[#2a3de6] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Candidate
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, role, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20 focus:border-[#3147FF]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No candidates found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {candidates.map((c) => (
            <Link
              key={c.id}
              href={`/talent/candidates/${c.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-11 h-11 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#0A102F] truncate">{c.name}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                  {c.currentRole && <span>{c.currentRole}</span>}
                  {c.currentCompany && <span>at {c.currentCompany}</span>}
                  <span>{c.experienceYears} yrs exp</span>
                  {c.location && <span>{c.location}</span>}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 flex-shrink-0">
                {c.cvVersions.length > 0 && (
                  <FileText className="w-4 h-4 text-green-500" />
                )}
                <span title="Requisitions">{c._count.requisitions} reqs</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
