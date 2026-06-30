import { NextResponse } from "next/server";
import { getIssues, saveIssue, getOrCreateDemoUser, saveUser } from "@/lib/store";
import { categorizeWithAI } from "@/lib/ai-categorizer";
import { awardPoints } from "@/lib/gamification";
import { v4 as uuidv4 } from "uuid";
import type { Issue } from "@/lib/types";

export async function GET() {
  const issues = getIssues();
  return NextResponse.json(issues);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      location,
      mediaUrls = [],
      mediaType = "none",
      reporterId,
      reporterName,
    } = body;

    if (!description || !location?.lat || !location?.lng) {
      return NextResponse.json(
        { error: "Description and location are required" },
        { status: 400 }
      );
    }

    const aiAnalysis = await categorizeWithAI(
      description,
      location.address ?? `${location.lat}, ${location.lng}`
    );

    const now = new Date().toISOString();
    const userId = reporterId ?? "demo-user";
    const userName = reporterName ?? "Community Citizen";

    const issue: Issue = {
      id: uuidv4(),
      title: title || aiAnalysis.suggestedTitle,
      description,
      category: aiAnalysis.category,
      status: "reported",
      priority: aiAnalysis.priority,
      location,
      mediaUrls,
      mediaType,
      reporterId: userId,
      reporterName: userName,
      aiAnalysis,
      verifications: [],
      statusHistory: [
        {
          id: uuidv4(),
          status: "reported",
          note: "Issue reported by citizen",
          updatedBy: userName,
          timestamp: now,
        },
      ],
      upvotes: 1,
      createdAt: now,
      updatedAt: now,
    };

    saveIssue(issue);

    let user = getOrCreateDemoUser();
    if (userId === user.id || userId === "demo-user") {
      const { user: updated } = awardPoints(
        { ...user, reportsCount: user.reportsCount + 1 },
        "REPORT"
      );
      saveUser(updated);
    }

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error("Create issue error:", error);
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 });
  }
}
