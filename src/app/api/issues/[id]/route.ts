import { NextResponse } from "next/server";
import { getIssue, saveIssue } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const issue = await getIssue(id);
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }
  return NextResponse.json(issue);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const issue = await getIssue(id);
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  const body = await request.json();
  const updated = { ...issue, ...body, updatedAt: new Date().toISOString() };
  await saveIssue(updated);
  return NextResponse.json(updated);
}
