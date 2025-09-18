import { NextResponse } from "next/server";

// Simple shared in-memory stores
const friends = new Map<string, Set<string>>();
const requests: { id: string; from: string; to: string; status: "pending" | "accepted" }[] = [];

export async function GET() {
  const me = "guest"; // demo only; would be auth'ed user
  const list = Array.from(friends.get(me) || []);
  const myReqs = requests.filter((r) => r.to === me && r.status === "pending");
  return NextResponse.json({ friends: list, requests: myReqs });
}

export { friends, requests };