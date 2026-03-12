"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus, Search, Users, FileText, ChevronRight, CheckCircle2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  city: string | null;
  status: string;
  createdAt: string;
  company: { id: string; isVerified: boolean; location: string | null } | null;
  _count: { requisitions: number; clientUsers: number };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter]);

  async function fetchClients() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/talent/clients?${params}`);
    const json = await res.json();
    setClients(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A102F]">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total clients</p>
        </div>
        <Link
          href="/talent/clients/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3147FF] text-white rounded-lg text-sm font-medium hover:bg-[#2a3de6] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
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
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Client List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No clients found</p>
          <p className="text-gray-400 text-sm mt-1">Add your first client to get started</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/talent/clients/${client.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#0A102F] truncate">{client.name}</h3>
                  {client.company?.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      client.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {client.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  {client.industry && <span>{client.industry}</span>}
                  {(client.city || client.company?.location) && (
                    <span>{client.city || client.company?.location}</span>
                  )}
                  {client.contactName && <span>{client.contactName}</span>}
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500 flex-shrink-0">
                <div className="flex items-center gap-1.5" title="Requisitions">
                  <FileText className="w-4 h-4" />
                  <span>{client._count.requisitions}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Users">
                  <Users className="w-4 h-4" />
                  <span>{client._count.clientUsers}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
