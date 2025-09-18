import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  const { to, message } = await req.json();
  if (!to || !message) return NextResponse.json({ error: "to and message required" }, { status: 400 });

  const SID = process.env.TWILIO_ACCOUNT_SID;
  const TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const FROM = process.env.TWILIO_FROM_NUMBER;
  if (!SID || !TOKEN || !FROM) {
    return NextResponse.json({ error: "Twilio env vars missing" }, { status: 500 });
  }

  const client = twilio(SID, TOKEN);
  try {
    const res = await client.messages.create({ to, from: FROM, body: message });
    return NextResponse.json({ ok: true, sid: res.sid });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}