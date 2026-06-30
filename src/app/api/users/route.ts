import { NextResponse } from "next/server";
import { getUsers, getOrCreateDemoUser } from "@/lib/store";

export async function GET() {
  const users = await getUsers();
  const demoUser = await getOrCreateDemoUser();
  return NextResponse.json({ users, currentUser: demoUser });
}
