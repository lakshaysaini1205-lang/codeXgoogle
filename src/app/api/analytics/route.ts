import { NextResponse } from "next/server";
import { getIssues } from "@/lib/store";
import { computeAnalytics } from "@/lib/predictions";

export async function GET() {
  const issues = getIssues();
  const analytics = computeAnalytics(issues);
  return NextResponse.json(analytics);
}
