"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";

// A tiny helper to load the Google Maps script once
function useGoogleMaps(apiKey?: string) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!apiKey) return;
    if (typeof window === "undefined") return;
    if ((window as any).google?.maps) {
      setLoaded(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://maps.googleapis.com/maps/api/js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => setLoaded(true));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);
  return loaded;
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObjRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState("");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapsLoaded = useGoogleMaps(apiKey);

  // Ask for geolocation and keep updating backend
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        // Send to backend
        fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coords }),
        }).catch(() => {});
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setPermissionDenied(true);
        setError(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Fetch friends positions periodically
  useEffect(() => {
    const load = () => {
      fetch("/api/location")
        .then((r) => r.json())
        .then((data) => setFriends(data.friends || []))
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  // Initialize map and markers
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current) return;
    // @ts-ignore
    const { google } = window as any;
    if (!google?.maps) return;

    const map = new google.maps.Map(mapRef.current, {
      center: position || { lat: 20, lng: 0 },
      zoom: position ? 14 : 2, // globe-like start
      mapTypeId: "hybrid", // a more globe-ish satellite view
      tilt: 45,
      heading: 0,
      disableDefaultUI: true,
      zoomControl: true,
      fullscreenControl: true,
    });
    mapObjRef.current = map;

    // Setup directions
    directionsServiceRef.current = new google.maps.DirectionsService();
    directionsRendererRef.current = new google.maps.DirectionsRenderer({ map });

    if (position) {
      new google.maps.Marker({
        position,
        map,
        title: "You",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });
      map.setCenter(position);
      map.setZoom(15);
    }

    friends.forEach((f) => {
      if (!f.coords) return;
      new google.maps.Marker({
        position: f.coords,
        map,
        title: f.username || "Friend",
      });
    });
  }, [mapsLoaded, position, friends]);

  const routeToDestination = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!destination || !position) return;
    // @ts-ignore
    const { google } = window as any;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: destination }, (results: any, status: any) => {
      if (status !== "OK" || !results?.[0]) {
        setError("Destination not found");
        return;
      }
      const destLoc = results[0].geometry.location;
      const req = {
        origin: new google.maps.LatLng(position.lat, position.lng),
        destination: destLoc,
        travelMode: google.maps.TravelMode.WALKING,
      };
      directionsServiceRef.current.route(req, (res: any, stat: any) => {
        if (stat === "OK") {
          directionsRendererRef.current.setDirections(res);
        } else {
          setError("Could not compute directions");
        }
      });
    });
  };

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="pt-14 h-[calc(100vh-56px)] relative">
        {!apiKey && (
          <div className="h-full grid place-items-center text-center p-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Google Maps API key missing</h2>
              <p className="text-muted-foreground">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment.</p>
            </div>
          </div>
        )}
        {permissionDenied && (
          <div className="absolute inset-14 z-10 bg-background/90 grid place-items-center p-6 text-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">Location required</h2>
              <p className="text-muted-foreground">This app only runs if location is on. Please enable location permissions.</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute left-4 bottom-4 bg-destructive text-white px-3 py-2 rounded-md text-sm shadow">
            {error}
          </div>
        )}
        <form onSubmit={routeToDestination} className="absolute left-1/2 -translate-x-1/2 top-16 z-20 w-[min(680px,92vw)] bg-background/90 backdrop-blur border rounded-md p-2 flex gap-2 items-center">
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Search destination (address, place)"
            className="flex-1 px-3 py-2 rounded-md border bg-background"
          />
          <button type="submit" className="px-3 py-2 rounded-md bg-primary text-primary-foreground">Directions</button>
        </form>
        <div ref={mapRef} className="w-full h-full" />
      </main>
    </div>
  );
}