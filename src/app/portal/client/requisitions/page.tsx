"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, ChevronRight } from "lucide-react";

interface Requisition {
  id: string;
  title: string;
  status: string;
  priority: string;
  workModel: string;
  vacancies: number;
  createdAt: string;
  _count: { candidates: number };
}

const statusColors: Record<string, string> = {
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ON_HOLD: "bg-gray-100 text-gray-500",
  CLOSED: "bg-red-100 text-red-700",
  FILLED: "bg-emerald-100 text-emerald-700",
};

export default function ClientRequisitionsPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_data() {
      const res = await fetch("/api/talent/client/requisitions");
      const json = await res.json();
      setRequisitions(json.data || []);
      setLoading(false);
    }
    fetch_data();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0A102F]">Your Requisitions</h1>
        <Link
          href="/portal/client/requisitions/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3147FF] text-white rounded-lg text-sm font-medium hover:bg-[#2a3de6]"
        >
          <Plus className="w-4 h-4" />
          Submit New Requirement
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
        </div>
      ) : requisitions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No requisitions yet</p>
          <p className="text-gray-400 text-sm mt-1">Submit your first job requirement to get started</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {requisitions.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#0A102F] truncate">{req.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[req.status] || "bg-gray-100"}`}>
                    {req.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span>{req.workModel}</span>
                  <span>{req.vacancies} vacancy</span>
                  <span>{req._count.candidates} candidates</span>
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
