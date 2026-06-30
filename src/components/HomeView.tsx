"use client";

import { useEffect, useState } from "react";
import type { Issue } from "@/lib/types";
import IssueMap from "@/components/IssueMap";
import IssueCard from "@/components/IssueCard";
import { Filter, Search, Loader2 } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/types";

export default function HomeView() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selected, setSelected] = useState<Issue | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      await fetch("/api/seed", { method: "POST" });
      const res = await fetch("/api/issues");
      if (res.ok) setIssues(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  const filtered = issues.filter((i) => {
    if (filter !== "all" && i.category !== filter) return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="relative h-[45vh] lg:h-auto lg:flex-1">
        <IssueMap
          issues={filtered}
          selectedId={selected?.id}
          onSelect={setSelected}
          height="100%"
        />
        <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-4 py-2 shadow-lg backdrop-blur-sm">
          <p className="text-lg font-bold text-slate-900">{filtered.length}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Active Issues
          </p>
        </div>
      </div>

      <aside className="flex w-full flex-col border-t border-slate-200 bg-white lg:w-[400px] lg:border-l lg:border-t-0">
        <div className="border-b border-slate-100 p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <Filter className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <FilterChip
                key={key}
                active={filter === key}
                onClick={() => setFilter(key)}
                label={label.split(" ")[0]}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No issues found. Be the first to report one!
            </p>
          ) : (
            filtered.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                compact
                selected={selected?.id === issue.id}
                onSelect={setSelected}
              />
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}
