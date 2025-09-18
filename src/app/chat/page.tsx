"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";

export default function ChatPage() {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const sendSMS = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/twilio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setLog((l) => [
        `Sent to ${to}: ${message}`,
        ...l,
      ]);
      setMessage("");
    } catch (e: any) {
      setLog((l) => ["Error: " + e.message, ...l]);
    } finally {
      setSending(false);
    }
  };

  const sendMyLocation = async () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      setMessage((m) => (m ? m + "\n" : "") + `My location: ${mapsUrl}`);
    });
  };

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="pt-14 max-w-2xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-semibold">Chat with friends</h2>
        <p className="text-sm text-muted-foreground">Send SMS using Twilio. Enter your friend's phone number in E.164 format, e.g. +15551234567. Use the location button to include your live location link.</p>
        <div className="space-y-2">
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Friend phone number (+1...)"
            className="w-full px-3 py-2 rounded-md border bg-background"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            rows={4}
            className="w-full px-3 py-2 rounded-md border bg-background"
          />
          <div className="flex gap-2">
            <button
              onClick={sendMyLocation}
              className="px-3 py-2 rounded-md bg-secondary"
            >Add my location</button>
            <button
              onClick={sendSMS}
              disabled={!to || !message || sending}
              className="px-3 py-2 rounded-md bg-foreground text-background disabled:opacity-60"
            >{sending ? "Sending..." : "Send SMS"}</button>
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <h3 className="font-medium mb-2">Activity</h3>
          <ul className="space-y-1 text-sm">
            {log.map((l, i) => (
              <li key={i} className="text-muted-foreground">{l}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}