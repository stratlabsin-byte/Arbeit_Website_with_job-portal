"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, Search, Building2, Users, ChevronRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import { REQUISITION_STATUSES } from "@/types";

interface Requisition {
  id: string;
  title: string;
  location: string | null;
  workModel: string;
  jobType: string;
  priority: string;
  status: string;
  createdAt: string;
  client: { id: string; name: string };
  _count: { candidates: number; assignments: number };
}

const statusColors: Record<string, string> = {
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ON_HOLD: "bg-gray-100 text-gray-600",
  CLOSED: "bg-red-100 text-red-700",
  FILLED: "bg-emerald-100 text-emerald-700",
};

const priorityColors: Record<string, string> = {
  LOW: "text-gray-500",
  MEDIUM: "text-blue-600",
  HIGH: "text-orange-600",
  URGENT: "text-red-600",
};

export default function RequisitionsPage() {
  const searchParams = useSearchParams();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchRequisitions();
  }, [search, statusFilter]);

  async function fetchRequisitions() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/talent/requisitions?${params}`);
    const json = await res.json();
    setRequisitions(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }

  // Count pending approvals
  const pendingCount = requisitions.filter((r) => r.status === "PENDING_APPROVAL").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A102F]">Requisitions</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total requisitions</p>
        </div>
        <Link
          href="/talent/requisitions/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3147FF] text-white rounded-lg text-sm font-medium hover:bg-[#2a3de6] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Requisition
        </Link>
      </div>

      {/* Pending Approval Banner */}
      {pendingCount > 0 && !statusFilter && (
        <button
          onClick={() => setStatusFilter("PENDING_APPROVAL")}
          className="w-full mb-4 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left hover:bg-amber-100 transition-colors"
        >
          <Clock className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {pendingCount} requisition{pendingCount > 1 ? "s" : ""} pending approval
            </p>
            <p className="text-xs text-amber-600">Click to review and approve</p>
          </div>
        </button>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search requisitions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20 focus:border-[#3147FF]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
        >
          <option value="">All Status</option>
          {Object.entries(REQUISITION_STATUSES).map(([key, value]) => (
            <option key={key} value={value}>
              {value.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
        </div>
      ) : requisitions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No requisitions found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {requisitions.map((req) => (
            <Link
              key={req.id}
              href={`/talent/requisitions/${req.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#0A102F] truncate">{req.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[req.status] || "bg-gray-100 text-gray-500"}`}>
                      {req.status.replace(/_/g, " ")}
                    </span>
                    <span className={`text-xs font-medium ${priorityColors[req.priority] || ""}`}>
                      {req.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {req.client.name}
                    </span>
                    {req.location && <span>{req.location}</span>}
                    <span>{req.workModel}</span>
                    <span>{req.jobType.replace(/_/g, " ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 flex-shrink-0 ml-4">
                  <div className="flex items-center gap-1" title="Candidates">
                    <Users className="w-4 h-4" />
                    {req._count.candidates}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
