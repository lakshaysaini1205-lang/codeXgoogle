"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Issue } from "@/lib/types";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  PRIORITY_COLORS,
  CATEGORY_COLORS,
} from "@/lib/types";
import StatusTimeline from "@/components/StatusTimeline";
import IssueMap from "@/components/IssueMap";
import {
  ArrowLeft,
  ThumbsUp,
  Sparkles,
  MapPin,
  User,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function IssueDetailView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetch(`/api/issues/${id}`)
      .then((r) => r.json())
      .then(setIssue)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleVerify() {
    setVerifying(true);
    try {
      const res = await fetch(`/api/issues/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) setIssue(await res.json());
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Issue not found</p>
        <Link href="/" className="text-sm text-emerald-600 hover:underline">
          Back to map
        </Link>
      </div>
    );
  }

  const alreadyVerified = issue.verifications.some(
    (v) => v.userId === "demo-user"
  );

  return (
    <div className="mx-auto max-w-5xl flex-1 px-4 py-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: CATEGORY_COLORS[issue.category] }}
              >
                {CATEGORY_LABELS[issue.category]}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: PRIORITY_COLORS[issue.priority] }}
              >
                {issue.priority}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {STATUS_LABELS[issue.status]}
              </span>
            </div>

            <h1 className="mb-2 text-xl font-bold text-slate-900">
              {issue.title}
            </h1>
            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              {issue.description}
            </p>

            {issue.mediaUrls.length > 0 && (
              <div className="mb-4 overflow-hidden rounded-xl">
                {issue.mediaType === "video" ? (
                  <video
                    src={issue.mediaUrls[0]}
                    controls
                    className="w-full"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={issue.mediaUrls[0]}
                    alt="Issue evidence"
                    className="w-full object-cover"
                  />
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {issue.reporterName}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {issue.location.address ?? "Location pinned"}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                {issue.upvotes} upvotes
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <Sparkles className="h-4 w-4" />
              AI Analysis
            </h3>
            <p className="mb-2 text-xs text-emerald-700">
              {issue.aiAnalysis.reasoning}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {issue.aiAnalysis.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-700"
                >
                  #{tag}
                </span>
              ))}
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {Math.round(issue.aiAnalysis.confidence * 100)}% confidence
              </span>
            </div>
          </div>

          <div className="h-[200px] overflow-hidden rounded-2xl border border-slate-200">
            <IssueMap
              issues={[issue]}
              selectedId={issue.id}
              interactive={false}
              height="200px"
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Tracking Timeline
            </h3>
            <StatusTimeline issue={issue} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Community Verification ({issue.verifications.length})
            </h3>
            {issue.verifications.length > 0 ? (
              <div className="mb-4 space-y-2">
                {issue.verifications.map((v) => (
                  <div
                    key={v.userId + v.timestamp}
                    className="flex items-center gap-2 text-xs text-slate-600"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    {v.userName} verified ·{" "}
                    {new Date(v.timestamp).toLocaleDateString()}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-xs text-slate-400">
                No verifications yet. Be the first to confirm this issue.
              </p>
            )}
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying || alreadyVerified}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {verifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {alreadyVerified ? "Already Verified" : "Verify Issue (+10 pts)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
