import { NextResponse } from "next/server";
import { getIssue, saveIssue, getOrCreateDemoUser, saveUser } from "@/lib/store";
import { awardPoints } from "@/lib/gamification";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const issue = getIssue(id);
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  const body = await request.json();
  const userId = body.userId ?? "demo-user";
  const userName = body.userName ?? "Community Citizen";

  const alreadyVerified = issue.verifications.some((v) => v.userId === userId);
  if (alreadyVerified) {
    return NextResponse.json({ error: "Already verified" }, { status: 409 });
  }

  const verification = {
    userId,
    userName,
    timestamp: new Date().toISOString(),
    confirmed: true,
  };

  issue.verifications.push(verification);
  issue.upvotes += 1;

  if (issue.verifications.length >= 2 && issue.status === "reported") {
    issue.status = "verified";
    issue.statusHistory.push({
      id: uuidv4(),
      status: "verified",
      note: `Verified by ${issue.verifications.length} community members`,
      updatedBy: "System",
      timestamp: new Date().toISOString(),
    });
  }

  issue.updatedAt = new Date().toISOString();
  saveIssue(issue);

  const user = getOrCreateDemoUser();
  if (userId === user.id || userId === "demo-user") {
    const { user: updated } = awardPoints(
      { ...user, verificationsCount: user.verificationsCount + 1 },
      "VERIFY"
    );
    saveUser(updated);
  }

  return NextResponse.json(issue);
}
