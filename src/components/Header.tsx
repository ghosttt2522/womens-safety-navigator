"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, User2, MapPinned } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link
          href="/profile"
          className="p-2 rounded-md hover:bg-muted inline-flex items-center gap-2"
          aria-label="Profile"
        >
          <User2 className="h-5 w-5" />
          <span className="hidden sm:inline">Profile</span>
        </Link>
        <Link
          href="/map"
          className="px-3 py-1.5 rounded-md hover:bg-muted inline-flex items-center gap-2"
          aria-label="Map"
        >
          <MapPinned className="h-5 w-5" />
          <span className="hidden sm:inline">Map</span>
        </Link>
        <Link
          href="/chat"
          className="p-2 rounded-md hover:bg-muted inline-flex items-center gap-2"
          aria-label="Chat"
        >
          <span className="hidden sm:inline">Chat</span>
          <MessageCircle className="h-5 w-5" />
        </Link>
      </div>
      {pathname !== "/map" && (
        <div className="sr-only">Navigate to map, profile, or chat</div>
      )}
    </header>
  );
}