import { NextRequest, NextResponse } from "next/server";

// In-memory store (for demo only)
const state: {
  users: Record<string, { username: string; coords?: { lat: number; lng: number }; updatedAt: number }>;
} = {
  users: {},
};

function getCurrentUser(req: NextRequest) {
  // For demo: username read from cookie or default "guest"
  const cookie = req.cookies.get("username");
  return cookie?.value || "guest";
}

export async function GET() {
  return NextResponse.json({
    friends: Object.values(state.users),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const username = getCurrentUser(req);
  state.users[username] = {
    username,
    coords: body.coords,
    updatedAt: Date.now(),
  };
  return NextResponse.json({ ok: true });
}