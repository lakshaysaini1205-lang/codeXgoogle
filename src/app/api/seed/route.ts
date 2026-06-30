import { NextResponse } from "next/server";
import { replaceStore, getStore } from "@/lib/store";
import { createSeedData } from "@/lib/seed";

export async function POST() {
  const existing = getStore();
  if (existing.issues.length > 0) {
    return NextResponse.json({ message: "Already seeded", count: existing.issues.length });
  }
  const data = createSeedData();
  replaceStore(data);
  return NextResponse.json({ message: "Seeded successfully", ...data });
}
