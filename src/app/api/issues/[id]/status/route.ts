import { NextResponse } from "next/server";
import { getIssue, saveIssue } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";
import type { IssueStatus } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const issue = await getIssue(id);
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  const { status, note, updatedBy } = await request.json();
  const validStatuses: IssueStatus[] = [
    "reported",
    "verified",
    "in_progress",
    "resolved",
    "closed",
  ];

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const now = new Date().toISOString();
  issue.status = status;
  issue.statusHistory.push({
    id: uuidv4(),
    status,
    note: note ?? `Status updated to ${status}`,
    updatedBy: updatedBy ?? "Municipal Admin",
    timestamp: now,
  });

  if (status === "resolved" || status === "closed") {
    issue.resolvedAt = now;
  }

  issue.updatedAt = now;
  await saveIssue(issue);

  return NextResponse.json(issue);
}
