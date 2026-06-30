export const DEFAULT_CENTER = { lat: 19.076, lng: 72.8777 };
export const DEFAULT_ZOOM = 13;

export const POINTS = {
  REPORT: 50,
  VERIFY: 10,
  RESOLVE_CONFIRM: 25,
  FIRST_REPORT: 100,
  STREAK_BONUS: 15,
} as const;

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000, 5000];

export const BADGE_DEFINITIONS = [
  {
    id: "first_report",
    name: "First Responder",
    description: "Submitted your first community report",
    icon: "🎯",
    condition: (user: { reportsCount: number }) => user.reportsCount >= 1,
  },
  {
    id: "community_guardian",
    name: "Community Guardian",
    description: "Verified 5 community reports",
    icon: "🛡️",
    condition: (user: { verificationsCount: number }) =>
      user.verificationsCount >= 5,
  },
  {
    id: "problem_solver",
    name: "Problem Solver",
    description: "Helped resolve 3 issues",
    icon: "✅",
    condition: (user: { points: number }) => user.points >= 300,
  },
  {
    id: "hero",
    name: "Community Hero",
    description: "Reached Level 5",
    icon: "🏆",
    condition: (user: { level: number }) => user.level >= 5,
  },
  {
    id: "super_reporter",
    name: "Super Reporter",
    description: "Submitted 10 reports",
    icon: "📢",
    condition: (user: { reportsCount: number }) => user.reportsCount >= 10,
  },
] as const;
