"use client";

import type { Issue } from "@/lib/types";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  PRIORITY_COLORS,
  CATEGORY_COLORS,
} from "@/lib/types";
import { MapPin, ThumbsUp, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface IssueCardProps {
  issue: Issue;
  compact?: boolean;
  onSelect?: (issue: Issue) => void;
  selected?: boolean;
}

export default function IssueCard({
  issue,
  compact,
  onSelect,
  selected,
}: IssueCardProps) {
  const timeAgo = getTimeAgo(issue.createdAt);

  const content = (
    <div
      className={`group rounded-xl border bg-white p-4 transition-all hover:shadow-md ${
        selected
          ? "border-emerald-400 ring-2 ring-emerald-100"
          : "border-slate-200 hover:border-emerald-200"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[issue.category] }}
          />
          <span className="text-xs font-medium text-slate-500">
            {CATEGORY_LABELS[issue.category]}
          </span>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
          style={{ backgroundColor: PRIORITY_COLORS[issue.priority] }}
        >
          {issue.priority}
        </span>
      </div>

      <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
        {issue.title}
      </h3>

      {!compact && (
        <p className="mb-3 line-clamp-2 text-xs text-slate-500">
          {issue.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {issue.location.address?.split(",")[0] ?? "Location pinned"}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          {issue.upvotes}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <StatusBadge status={issue.status} />
        {!onSelect && (
          <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-emerald-500" />
        )}
      </div>
    </div>
  );

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(issue)} className="w-full text-left">
        {content}
      </button>
    );
  }

  return <Link href={`/issues/${issue.id}`}>{content}</Link>;
}

function StatusBadge({ status }: { status: Issue["status"] }) {
  const colors: Record<Issue["status"], string> = {
    reported: "bg-blue-50 text-blue-700",
    verified: "bg-purple-50 text-purple-700",
    in_progress: "bg-amber-50 text-amber-700",
    resolved: "bg-emerald-50 text-emerald-700",
    closed: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
