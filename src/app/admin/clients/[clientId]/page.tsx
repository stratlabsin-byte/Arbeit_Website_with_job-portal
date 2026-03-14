"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Users,
  Edit2,
  Save,
  X,
} from "lucide-react";

interface ClientDetail {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  requisitions: any[];
  clientUsers: any[];
  _count: { requisitions: number; clientUsers: number };
}

export default function ClientDetailPage() {
  const { clientId } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  async function fetchClient() {
    const res = await fetch(`/api/talent/clients/${clientId}`);
    if (!res.ok) {
      router.push("/admin/clients");
      return;
    }
    const json = await res.json();
    setClient(json.data);
    setLoading(false);
  }

  function startEdit() {
    if (!client) return;
    setEditForm({
      name: client.name,
      industry: client.industry || "",
      website: client.website || "",
      contactName: client.contactName || "",
      contactEmail: client.contactEmail || "",
      contactPhone: client.contactPhone || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      notes: client.notes || "",
      status: client.status,
    });
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/talent/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      await fetchClient();
      setEditing(false);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!client) return null;

  return (
    <div>
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
            <Building2 className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#0A102F]">{client.name}</h1>
              <span
                className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                  client.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {client.status}
              </span>
            </div>
            {client.industry && <p className="text-gray-500 text-sm mt-0.5">{client.industry}</p>}
          </div>
        </div>
        {!editing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {editing ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    value={editForm.contactName}
                    onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    value={editForm.contactEmail}
                    onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    value={editForm.contactPhone}
                    onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3147FF]/20"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#3147FF] rounded-lg hover:bg-[#2a3de6] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-[#0A102F] mb-4">Company Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {client.contactName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    {client.contactName}
                  </div>
                )}
                {client.contactEmail && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {client.contactEmail}
                  </div>
                )}
                {client.contactPhone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {client.contactPhone}
                  </div>
                )}
                {client.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {client.website}
                    </a>
                  </div>
                )}
                {(client.city || client.state || client.address) && (
                  <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {[client.address, client.city, client.state].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>
              {client.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">{client.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Requisitions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0A102F]">
                Requisitions ({client._count.requisitions})
              </h2>
              <Link
                href={`/talent/requisitions/new?clientId=${client.id}`}
                className="text-sm text-[#3147FF] font-medium hover:underline"
              >
                + Create Requisition
              </Link>
            </div>
            {client.requisitions.length === 0 ? (
              <p className="text-sm text-gray-400">No requisitions yet</p>
            ) : (
              <div className="space-y-2">
                {client.requisitions.map((req: any) => (
                  <Link
                    key={req.id}
                    href={`/talent/requisitions/${req.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#0A102F]">{req.title}</p>
                      <p className="text-xs text-gray-500">
                        {req.location} &middot; {req.jobType}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        req.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : req.status === "PENDING_APPROVAL"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {req.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A102F] mb-4">Overview</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Requisitions</span>
                <span className="font-semibold text-[#0A102F]">{client._count.requisitions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Client Users</span>
                <span className="font-semibold text-[#0A102F]">{client._count.clientUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-600">
                  {new Date(client.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Client Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A102F] mb-4">Client Users</h2>
            {client.clientUsers.length === 0 ? (
              <p className="text-sm text-gray-400">No users yet</p>
            ) : (
              <div className="space-y-2">
                {client.clientUsers.map((cu: any) => (
                  <div key={cu.id} className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                      {cu.user.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0A102F]">{cu.user.name}</p>
                      <p className="text-xs text-gray-500">{cu.user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
