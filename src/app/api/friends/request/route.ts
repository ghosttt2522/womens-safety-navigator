import { NextRequest, NextResponse } from "next/server";
import { friends, requests } from "../route";

export async function POST(req: NextRequest) {
  const { to } = await req.json();
  const from = "guest"; // demo only
  if (!to) return NextResponse.json({ error: "to required" }, { status: 400 });
  const id = Math.random().toString(36).slice(2);
  requests.push({ id, from, to, status: "pending" });
  // Ensure sets are initialised
  if (!friends.get(from)) friends.set(from, new Set());
  if (!friends.get(to)) friends.set(to, new Set());
  return NextResponse.json({ ok: true, id });
}