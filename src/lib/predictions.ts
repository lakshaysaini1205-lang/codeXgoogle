import type { Analytics, Issue, IssueCategory } from "./types";
import { CATEGORY_LABELS } from "./types";

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86400000;
}

function getWeekLabel(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function computeAnalytics(issues: Issue[]): Analytics {
  const resolved = issues.filter((i) => i.status === "resolved" || i.status === "closed");
  const resolutionTimes = resolved
    .filter((i) => i.resolvedAt)
    .map((i) => daysBetween(i.createdAt, i.resolvedAt!));

  const avgResolutionDays =
    resolutionTimes.length > 0
      ? Math.round(
          (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length) * 10
        ) / 10
      : 0;

  const categories: IssueCategory[] = [
    "pothole",
    "water_leak",
    "streetlight",
    "waste",
    "infrastructure",
    "safety",
    "other",
  ];

  const categoryBreakdown = Object.fromEntries(
    categories.map((c) => [c, issues.filter((i) => i.category === c).length])
  ) as Record<IssueCategory, number>;

  const statuses = ["reported", "verified", "in_progress", "resolved", "closed"] as const;
  const statusBreakdown = Object.fromEntries(
    statuses.map((s) => [s, issues.filter((i) => i.status === s).length])
  ) as Analytics["statusBreakdown"];

  const now = new Date();
  const weeklyTrend: Analytics["weeklyTrend"] = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - w * 7 - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    weeklyTrend.push({
      week: getWeekLabel(weekStart),
      reported: issues.filter(
        (i) => new Date(i.createdAt) >= weekStart && new Date(i.createdAt) < weekEnd
      ).length,
      resolved: issues.filter(
        (i) =>
          i.resolvedAt &&
          new Date(i.resolvedAt) >= weekStart &&
          new Date(i.resolvedAt) < weekEnd
      ).length,
    });
  }

  const gridSize = 0.01;
  const grid = new Map<string, { lat: number; lng: number; count: number }>();
  for (const issue of issues) {
    const key = `${Math.round(issue.location.lat / gridSize)}_${Math.round(issue.location.lng / gridSize)}`;
    const existing = grid.get(key);
    if (existing) {
      existing.count++;
    } else {
      grid.set(key, {
        lat: Math.round(issue.location.lat / gridSize) * gridSize,
        lng: Math.round(issue.location.lng / gridSize) * gridSize,
        count: 1,
      });
    }
  }

  const hotspots = [...grid.values()]
    .filter((g) => g.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((g, i) => ({
      ...g,
      label: `Hotspot ${i + 1} (${g.count} issues)`,
    }));

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const predictions: Analytics["predictions"] = categories
    .filter((c) => categoryBreakdown[c] > 0)
    .map((category) => {
      const recent = issues.filter(
        (i) => i.category === category && new Date(i.createdAt) >= thirtyDaysAgo
      ).length;
      const previous = issues.filter(
        (i) =>
          i.category === category &&
          new Date(i.createdAt) >= sixtyDaysAgo &&
          new Date(i.createdAt) < thirtyDaysAgo
      ).length;

      let trend: "rising" | "stable" | "declining" = "stable";
      if (recent > previous * 1.2) trend = "rising";
      else if (recent < previous * 0.8) trend = "declining";

      const expectedReports = Math.round(recent * (trend === "rising" ? 1.3 : trend === "declining" ? 0.7 : 1));

      const recommendations: Record<IssueCategory, string> = {
        pothole: "Pre-position road repair crews in identified hotspot zones before monsoon season.",
        water_leak: "Inspect aging pipeline infrastructure in high-report areas proactively.",
        streetlight: "Schedule bulk LED replacement in poorly-lit corridors.",
        waste: "Increase collection frequency and add bins in recurring dump sites.",
        infrastructure: "Conduct structural audits on frequently reported public assets.",
        safety: "Deploy rapid response teams to areas with rising safety reports.",
        other: "Review uncategorized reports for emerging community patterns.",
      };

      return {
        category,
        expectedReports,
        trend,
        recommendation: recommendations[category],
      };
    })
    .sort((a, b) => b.expectedReports - a.expectedReports)
    .slice(0, 4);

  return {
    totalIssues: issues.length,
    resolvedIssues: resolved.length,
    avgResolutionDays,
    categoryBreakdown,
    statusBreakdown,
    weeklyTrend,
    hotspots,
    predictions,
  };
}

export function formatCategoryLabel(cat: IssueCategory): string {
  return CATEGORY_LABELS[cat];
}
