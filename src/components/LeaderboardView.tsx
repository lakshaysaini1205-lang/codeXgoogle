"use client";

import type { User } from "@/lib/types";
import { pointsToNextLevel } from "@/lib/gamification";
import { Trophy, Star, Medal } from "lucide-react";

interface LeaderboardViewProps {
  users: User[];
  currentUser: User;
}

export default function LeaderboardView({
  users,
  currentUser,
}: LeaderboardViewProps) {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white shadow-lg">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-sm text-emerald-700">
              Level {currentUser.level} · {currentUser.points} points
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Progress to Level {currentUser.level + 1}</span>
                <span>{pointsToNextLevel(currentUser.points)} pts to go</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-emerald-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${Math.min(100, (currentUser.points % 300) / 3)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {currentUser.badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentUser.badges.map((badge) => (
              <span
                key={badge.id}
                title={badge.description}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
              >
                {badge.icon} {badge.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Trophy className="h-4 w-4 text-amber-500" />
            Community Leaderboard
          </h3>
        </div>
        <div className="divide-y divide-slate-50">
          {users.map((user, idx) => (
            <div
              key={user.id}
              className={`flex items-center gap-4 px-5 py-3 ${
                user.id === currentUser.id ? "bg-emerald-50/50" : ""
              }`}
            >
              <span className="w-8 text-center text-lg">
                {idx < 3 ? medals[idx] : (
                  <span className="text-sm font-bold text-slate-400">{idx + 1}</span>
                )}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-400">
                  {user.reportsCount} reports · {user.verificationsCount} verifications
                </p>
              </div>
              <div className="text-right">
                <p className="flex items-center gap-1 text-sm font-bold text-emerald-700">
                  <Star className="h-3.5 w-3.5" />
                  {user.points}
                </p>
                <p className="text-[10px] text-slate-400">Level {user.level}</p>
              </div>
              {idx < 3 && (
                <Medal className={`h-5 w-5 ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-400" : "text-amber-700"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          How to Earn Points
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { action: "Report an issue", points: "+50" },
            { action: "Verify a report", points: "+10" },
            { action: "Confirm resolution", points: "+25" },
            { action: "First report bonus", points: "+100" },
          ].map((item) => (
            <div
              key={item.action}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
            >
              <span className="text-xs text-slate-600">{item.action}</span>
              <span className="text-xs font-bold text-emerald-600">{item.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
