"use client";

import { useEffect, useState } from "react";
import type { Analytics } from "@/lib/types";
import DashboardView from "@/components/DashboardView";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      await fetch("/api/seed", { method: "POST" });
      const res = await fetch("/api/analytics");
      if (res.ok) setAnalytics(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl flex-1 px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Impact Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time analytics, trends, and AI-powered predictive insights for
          your community.
        </p>
      </div>
      {analytics && <DashboardView analytics={analytics} />}
    </div>
  );
}
