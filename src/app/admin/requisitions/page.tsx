"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Building2,
  Users,
  ChevronRight,
  ChevronDown,
  Clock,
  Globe,
  Filter,
  LayoutList,
  Layers,
} from "lucide-react";
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

interface ClientInfo {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
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
  const [clientFilter, setClientFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [viewMode, setViewMode] = useState<"grouped" | "flat">("grouped");
  const [collapsedClients, setCollapsedClients] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchRequisitions();
  }, [search, statusFilter, clientFilter, priorityFilter]);

  async function fetchClients() {
    const res = await fetch("/api/talent/clients?limit=100");
    const json = await res.json();
    setClients((json.data || []).map((c: any) => ({ id: c.id, name: c.name })));
  }

  async function fetchRequisitions() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (clientFilter) params.set("clientId", clientFilter);
    if (priorityFilter) params.set("priority", priorityFilter);
    params.set("limit", "100");

    const res = await fetch(`/api/talent/requisitions?${params}`);
    const json = await res.json();
    setRequisitions(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }

  // Group requisitions by client
  const groupedByClient = useMemo(() => {
    const groups: Record<string, { client: ClientInfo; requisitions: Requisition[] }> = {};
    for (const req of requisitions) {
      const key = req.client.id;
      if (!groups[key]) {
        groups[key] = { client: req.client, requisitions: [] };
      }
      groups[key].requisitions.push(req);
    }
    // Sort groups by client name
    return Object.values(groups).sort((a, b) => a.client.name.localeCompare(b.client.name));
  }, [requisitions]);

  const pendingCount = requisitions.filter((r) => r.status === "PENDING_APPROVAL").length;
  const activeFilters = [statusFilter, clientFilter, priorityFilter].filter(Boolean).length;

  function toggleClientCollapse(clientId: string) {
    setCollapsedClients((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  }

  function clearFilters() {
    setStatusFilter("");
    setClientFilter("");
    setPriorityFilter("");
    setSearch("");
  }

  // Stats
  const stats = useMemo(() => {
    const open = requisitions.filter((r) => r.status === "OPEN" || r.status === "APPROVED").length;
    const published = requisitions.filter((r) => r.status === "PUBLISHED").length;
    const filled = requisitions.filter((r) => r.status === "FILLED").length;
    const totalCandidates = requisitions.reduce((sum, r) => sum + r._count.candidates, 0);
    return { open, published, filled, totalCandidates };
  }, [requisitions]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A102F]">Requisitions</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total requisitions</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/requisitions/import"
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-4 h-4" />
            Import from Website
          </Link>
          <Link
            href="/admin/requisitions/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#3147FF] text-white rounded-lg text-sm font-medium hover:bg-[#2a3de6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Requisition
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Open</p>
          <p className="text-xl font-bold text-[#0A102F]">{stats.open}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Published</p>
          <p className="text-xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Filled</p>
          <p className="text-xl font-bold text-emerald-600">{stats.filled}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Candidates</p>
          <p className="text-xl font-bold text-[#3147FF]">{stats.totalCandidates}</p>
        </div>
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
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
        >
          <option value="">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
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
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
        >
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* View toggle + active filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-3 h-3" />
              Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
            </button>
          )}
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grouped")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === "grouped" ? "bg-white text-[#0A102F] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Grouped
          </button>
          <button
            onClick={() => setViewMode("flat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === "flat" ? "bg-white text-[#0A102F] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            List
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
        </div>
      ) : requisitions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No requisitions found</p>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="text-sm text-[#3147FF] hover:underline mt-2">
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === "grouped" ? (
        /* Grouped View */
        <div className="space-y-4">
          {groupedByClient.map((group) => (
            <div key={group.client.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Client Header */}
              <button
                onClick={() => toggleClientCollapse(group.client.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#3147FF]/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4.5 h-4.5 text-[#3147FF]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-[#0A102F]">{group.client.name}</h3>
                    <p className="text-xs text-gray-500">
                      {group.requisitions.length} requisition{group.requisitions.length !== 1 ? "s" : ""}
                      {" · "}
                      {group.requisitions.reduce((s, r) => s + r._count.candidates, 0)} candidates
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Status summary pills */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    {(() => {
                      const counts: Record<string, number> = {};
                      group.requisitions.forEach((r) => {
                        counts[r.status] = (counts[r.status] || 0) + 1;
                      });
                      return Object.entries(counts).map(([status, count]) => (
                        <span
                          key={status}
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[status] || "bg-gray-100 text-gray-500"}`}
                        >
                          {count} {status.replace(/_/g, " ")}
                        </span>
                      ));
                    })()}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      collapsedClients.has(group.client.id) ? "-rotate-90" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Requisition List */}
              {!collapsedClients.has(group.client.id) && (
                <div className="border-t border-gray-100">
                  {group.requisitions.map((req, idx) => (
                    <Link
                      key={req.id}
                      href={`/talent/requisitions/${req.id}`}
                      className={`flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                        idx !== group.requisitions.length - 1 ? "border-b border-gray-50" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0 pl-12">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-medium text-[#0A102F] text-sm truncate">{req.title}</h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${statusColors[req.status] || "bg-gray-100 text-gray-500"}`}>
                            {req.status.replace(/_/g, " ")}
                          </span>
                          <span className={`text-xs font-medium flex-shrink-0 ${priorityColors[req.priority] || ""}`}>
                            {req.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
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
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Flat List View */
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
