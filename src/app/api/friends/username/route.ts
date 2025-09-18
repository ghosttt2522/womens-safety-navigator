import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  // In real app, set cookie or session. For demo, set cookie.
  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, username });
  res.cookies.set("username", username, { path: "/" });
  return res;
}