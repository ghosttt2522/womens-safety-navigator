"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

interface FriendRequest { id: string; from: string; to: string; status: "pending" | "accepted"; }

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [friendName, setFriendName] = useState("");
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Load persisted username
  useEffect(() => {
    const name = localStorage.getItem("username") || "";
    setUsername(name);
  }, []);

  const saveUsername = async () => {
    setSaving(true);
    try {
      localStorage.setItem("username", username);
      await fetch("/api/friends/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
    } finally {
      setSaving(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!friendName) return;
    await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: friendName }),
    });
    setFriendName("");
    loadData();
  };

  const acceptRequest = async (id: string) => {
    await fetch("/api/friends/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  const loadData = async () => {
    const r = await fetch("/api/friends");
    const data = await r.json();
    setRequests(data.requests || []);
    setFriends(data.friends || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="pt-14 max-w-2xl mx-auto p-4 space-y-6">
        <section className="rounded-lg border p-4">
          <h2 className="font-semibold text-lg mb-2">Your Profile</h2>
          <label className="block text-sm text-muted-foreground mb-1">Unique username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. maya_92"
            className="w-full px-3 py-2 rounded-md border bg-background"
          />
          <button
            onClick={saveUsername}
            disabled={!username || saving}
            className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-foreground text-background disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </section>

        <section className="rounded-lg border p-4">
          <h3 className="font-medium mb-2">Add a friend by username</h3>
          <div className="flex gap-2">
            <input
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="friend_username"
              className="flex-1 px-3 py-2 rounded-md border bg-background"
            />
            <button
              onClick={sendFriendRequest}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground"
            >
              Send Request
            </button>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h3 className="font-medium mb-2">Friend Requests</h3>
          <ul className="space-y-2">
            {requests.length === 0 && (
              <li className="text-sm text-muted-foreground">No pending requests</li>
            )}
            {requests.map((req) => (
              <li key={req.id} className="flex items-center justify-between">
                <span>{req.from} → {req.to}</span>
                {req.status === "pending" ? (
                  <button
                    onClick={() => acceptRequest(req.id)}
                    className="px-2 py-1 rounded-md bg-secondary"
                  >Accept</button>
                ) : (
                  <span className="text-xs text-muted-foreground">accepted</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border p-4">
          <h3 className="font-medium mb-2">Friends</h3>
          <ul className="flex flex-wrap gap-2">
            {friends.length === 0 && (
              <li className="text-sm text-muted-foreground">No friends yet</li>
            )}
            {friends.map((f) => (
              <li key={f} className="px-2 py-1 rounded-md bg-muted">{f}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}