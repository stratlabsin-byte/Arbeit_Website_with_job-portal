"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Users, Calendar, Plus, ArrowRight } from "lucide-react";

export default function ClientDashboardPage() {
  const [stats, setStats] = useState({
    requisitions: 0,
    candidates: 0,
    interviews: 0,
    pendingReview: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [reqRes, candRes, intRes] = await Promise.all([
          fetch("/api/talent/client/requisitions"),
          fetch("/api/talent/client/candidates"),
          fetch("/api/talent/client/interviews"),
        ]);
        const [reqJson, candJson, intJson] = await Promise.all([
          reqRes.json(),
          candRes.json(),
          intRes.json(),
        ]);
        setStats({
          requisitions: reqJson.total || 0,
          candidates: candJson.total || 0,
          interviews: intJson.total || 0,
          pendingReview: (candJson.data || []).filter(
            (c: any) => c.stage === "PUSHED_TO_CLIENT"
          ).length,
        });
      } catch {}
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cards = [
    { label: "Requisitions", value: stats.requisitions, icon: FileText, href: "/talent/client/requisitions", color: "bg-blue-50 text-blue-600" },
    { label: "Candidates for Review", value: stats.pendingReview, icon: Users, href: "/talent/client/candidates", color: "bg-purple-50 text-purple-600" },
    { label: "Total Candidates", value: stats.candidates, icon: Users, href: "/talent/client/candidates", color: "bg-emerald-50 text-emerald-600" },
    { label: "Interviews", value: stats.interviews, icon: Calendar, href: "/talent/client/interviews", color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0A102F]">Dashboard</h1>
        <Link
          href="/talent/client/requisitions/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3147FF] text-white rounded-lg text-sm font-medium hover:bg-[#2a3de6] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Submit Job Requirement
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#3147FF] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-[#0A102F]">{card.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
