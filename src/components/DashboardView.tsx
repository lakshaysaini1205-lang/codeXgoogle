"use client";

import type { Analytics } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

interface DashboardViewProps {
  analytics: Analytics;
}

export default function DashboardView({ analytics }: DashboardViewProps) {
  const categoryData = Object.entries(analytics.categoryBreakdown)
    .filter(([, count]) => count > 0)
    .map(([cat, count]) => ({
      name: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS].split(" ")[0],
      count,
      fill: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS],
    }));

  const resolutionRate =
    analytics.totalIssues > 0
      ? Math.round((analytics.resolvedIssues / analytics.totalIssues) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Issues" value={analytics.totalIssues} color="emerald" />
        <StatCard label="Resolved" value={analytics.resolvedIssues} color="blue" />
        <StatCard label="Resolution Rate" value={`${resolutionRate}%`} color="purple" />
        <StatCard
          label="Avg Resolution"
          value={`${analytics.avgResolutionDays}d`}
          color="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Issues by Category">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analytics.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="reported"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Status Distribution">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={Object.entries(analytics.statusBreakdown)
                  .filter(([, v]) => v > 0)
                  .map(([name, value]) => ({ name: name.replace("_", " "), value }))}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {["#3b82f6", "#a855f7", "#f59e0b", "#10b981", "#94a3b8"].map(
                  (color, i) => (
                    <Cell key={i} fill={color} />
                  )
                )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Predictive Insights
          </h3>
          <div className="space-y-3">
            {analytics.predictions.map((p) => (
              <div
                key={p.category}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    {CATEGORY_LABELS[p.category]}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-medium">
                    {p.trend === "rising" && (
                      <>
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        <span className="text-red-600">Rising</span>
                      </>
                    )}
                    {p.trend === "declining" && (
                      <>
                        <TrendingDown className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-600">Declining</span>
                      </>
                    )}
                    {p.trend === "stable" && (
                      <>
                        <Minus className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-500">Stable</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  ~{p.expectedReports} reports expected next month
                </p>
                <p className="mt-1 text-[11px] text-emerald-700">
                  {p.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {analytics.hotspots.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Issue Hotspots
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.hotspots.map((h) => (
              <div
                key={h.label}
                className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2"
              >
                <span className="text-xs font-medium text-red-800">{h.label}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  {h.count} issues
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  const bg: Record<string, string> = {
    emerald: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${bg[color]} p-5 text-white shadow-lg`}
    >
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}
