import { NextRequest, NextResponse } from "next/server";
import { friends, requests } from "../route";

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const r = requests.find((x) => x.id === id);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  r.status = "accepted";
  friends.get(r.from)?.add(r.to);
  friends.get(r.to)?.add(r.from);
  return NextResponse.json({ ok: true });
}