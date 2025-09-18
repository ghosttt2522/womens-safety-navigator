"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/map");
  }, [router]);

  return (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Women's Safety App</h1>
        <p className="text-muted-foreground max-w-md">
          Redirecting to the interactive globe map… If you are not redirected, <button className="underline" onClick={() => router.push("/map")}>tap here</button>.
        </p>
      </div>
    </div>
  );
}