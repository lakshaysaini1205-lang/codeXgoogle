import { BADGE_DEFINITIONS, LEVEL_THRESHOLDS, POINTS } from "./constants";
import type { Badge, User } from "./types";

export function calculateLevel(points: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

export function pointsToNextLevel(points: number): number {
  const level = calculateLevel(points);
  if (level >= LEVEL_THRESHOLDS.length) return 0;
  return LEVEL_THRESHOLDS[level] - points;
}

export function checkNewBadges(user: User): Badge[] {
  const existing = new Set(user.badges.map((b) => b.id));
  const newBadges: Badge[] = [];

  for (const def of BADGE_DEFINITIONS) {
    if (!existing.has(def.id) && def.condition(user)) {
      newBadges.push({
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        earnedAt: new Date().toISOString(),
      });
    }
  }

  return newBadges;
}

export function awardPoints(
  user: User,
  action: keyof typeof POINTS
): { user: User; newBadges: Badge[] } {
  const updated: User = {
    ...user,
    points: user.points + POINTS[action],
    level: calculateLevel(user.points + POINTS[action]),
  };
  const newBadges = checkNewBadges(updated);
  updated.badges = [...updated.badges, ...newBadges];
  updated.level = calculateLevel(updated.points);
  return { user: updated, newBadges };
}
