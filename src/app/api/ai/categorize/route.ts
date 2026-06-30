import { NextResponse } from "next/server";
import { categorizeWithAI } from "@/lib/ai-categorizer";

export async function POST(request: Request) {
  try {
    const { description, locationHint } = await request.json();
    if (!description) {
      return NextResponse.json({ error: "Description required" }, { status: 400 });
    }
    const result = await categorizeWithAI(description, locationHint);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Categorization failed" }, { status: 500 });
  }
}
