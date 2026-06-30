"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import LeaderboardView from "@/components/LeaderboardView";
import { Loader2 } from "lucide-react";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      await fetch("/api/seed", { method: "POST" });
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setCurrentUser(data.currentUser);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !currentUser) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Community Heroes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Earn points and badges by reporting and verifying community issues.
        </p>
      </div>
      <LeaderboardView users={users} currentUser={currentUser} />
    </div>
  );
}
