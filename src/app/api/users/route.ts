import { NextResponse } from "next/server";
import { getUsers, getOrCreateDemoUser } from "@/lib/store";

export async function GET() {
  const users = getUsers();
  const demoUser = getOrCreateDemoUser();
  return NextResponse.json({ users, currentUser: demoUser });
}
