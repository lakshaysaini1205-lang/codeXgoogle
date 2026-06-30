export type IssueCategory =
  | "pothole"
  | "water_leak"
  | "streetlight"
  | "waste"
  | "infrastructure"
  | "safety"
  | "other";

export type IssueStatus =
  | "reported"
  | "verified"
  | "in_progress"
  | "resolved"
  | "closed";

export type IssuePriority = "low" | "medium" | "high" | "critical";

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface AICategorization {
  category: IssueCategory;
  confidence: number;
  priority: IssuePriority;
  suggestedTitle: string;
  tags: string[];
  reasoning: string;
}

export interface StatusUpdate {
  id: string;
  status: IssueStatus;
  note: string;
  updatedBy: string;
  timestamp: string;
}

export interface Verification {
  userId: string;
  userName: string;
  timestamp: string;
  confirmed: boolean;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  location: GeoLocation;
  mediaUrls: string[];
  mediaType: "image" | "video" | "none";
  reporterId: string;
  reporterName: string;
  aiAnalysis: AICategorization;
  verifications: Verification[];
  statusHistory: StatusUpdate[];
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  badges: Badge[];
  reportsCount: number;
  verificationsCount: number;
  createdAt: string;
}

export interface Analytics {
  totalIssues: number;
  resolvedIssues: number;
  avgResolutionDays: number;
  categoryBreakdown: Record<IssueCategory, number>;
  statusBreakdown: Record<IssueStatus, number>;
  weeklyTrend: { week: string; reported: number; resolved: number }[];
  hotspots: { lat: number; lng: number; count: number; label: string }[];
  predictions: {
    category: IssueCategory;
    expectedReports: number;
    trend: "rising" | "stable" | "declining";
    recommendation: string;
  }[];
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  pothole: "Pothole / Road Damage",
  water_leak: "Water Leakage",
  streetlight: "Streetlight Issue",
  waste: "Waste Management",
  infrastructure: "Public Infrastructure",
  safety: "Public Safety",
  other: "Other",
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  reported: "Reported",
  verified: "Community Verified",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const PRIORITY_COLORS: Record<IssuePriority, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

export const CATEGORY_COLORS: Record<IssueCategory, string> = {
  pothole: "#78716c",
  water_leak: "#0ea5e9",
  streetlight: "#eab308",
  waste: "#84cc16",
  infrastructure: "#6366f1",
  safety: "#ef4444",
  other: "#94a3b8",
};
