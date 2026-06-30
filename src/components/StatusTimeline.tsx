"use client";

import type { Issue } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { CheckCircle2, Circle } from "lucide-react";

const STATUS_ORDER = [
  "reported",
  "verified",
  "in_progress",
  "resolved",
  "closed",
] as const;

interface StatusTimelineProps {
  issue: Issue;
}

export default function StatusTimeline({ issue }: StatusTimelineProps) {
  const currentIdx = STATUS_ORDER.indexOf(issue.status);

  return (
    <div className="space-y-0">
      {STATUS_ORDER.map((status, idx) => {
        const historyEntry = issue.statusHistory.find((h) => h.status === status);
        const isComplete = idx <= currentIdx;
        const isCurrent = status === issue.status;

        return (
          <div key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              {isComplete ? (
                <CheckCircle2
                  className={`h-5 w-5 ${isCurrent ? "text-emerald-600" : "text-emerald-400"}`}
                />
              ) : (
                <Circle className="h-5 w-5 text-slate-200" />
              )}
              {idx < STATUS_ORDER.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[24px] ${isComplete && idx < currentIdx ? "bg-emerald-300" : "bg-slate-100"}`}
                />
              )}
            </div>
            <div className="pb-5">
              <p
                className={`text-sm font-medium ${isCurrent ? "text-emerald-700" : isComplete ? "text-slate-700" : "text-slate-300"}`}
              >
                {STATUS_LABELS[status]}
              </p>
              {historyEntry && (
                <>
                  <p className="text-xs text-slate-500">{historyEntry.note}</p>
                  <p className="text-[10px] text-slate-400">
                    {historyEntry.updatedBy} ·{" "}
                    {new Date(historyEntry.timestamp).toLocaleString()}
                  </p>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
