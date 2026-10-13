"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Compass,
  ExternalLink,
  Fuel,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface Station {
  id: string;
  name: string;
  brand: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  openStatus: string;
  amenities: string[];
  mapsUrl: string;
}

const brandColors: Record<string, string> = {
  IndianOil: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Bharat Petroleum": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  BPCL: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  HPCL: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Shell: "bg-red-500/15 text-red-400 border-red-500/30",
  Nayara: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");

  const fetchStations = useCallback(async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      const url = lat && lng ? `/api/stations?lat=${lat}&lng=${lng}` : "/api/stations";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStations(data.stations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      fetchStations();
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);
        setLocating(false);
        fetchStations(coords.lat, coords.lng);
      },
      (err) => {
        console.warn("Geolocation denied or failed:", err.message);
        setLocationError("Location access unavailable — showing nearby stations");
        setLocating(false);
        fetchStations();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [fetchStations]);

  useEffect(() => {
    requestGeolocation();
  }, [requestGeolocation]);

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5">
      {/* Header & Locate CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-400" />
            Nearby Fuel Stations
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {userCoords
              ? "Accurate to your GPS location"
              : "Discover petrol stations & air points"}
          </p>
        </div>

        <button
          onClick={requestGeolocation}
          disabled={locating}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          ) : (
            <RefreshCw className="h-4 w-4 text-amber-400" />
          )}
          <span>{locating ? "Locating..." : "Refresh"}</span>
        </button>
      </div>

      {/* GPS Status Banner */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-200">
              {userCoords ? "GPS Active" : "Location Status"}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {userCoords
                ? `Lat: ${userCoords.lat.toFixed(4)}, Lng: ${userCoords.lng.toFixed(4)}`
                : locationError || "Detecting nearest stations..."}
            </p>
          </div>
        </div>

        {userCoords && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Synced
          </span>
        )}
      </div>

      {/* Direct Live Google Maps Real-Time Launch Button */}
      <a
        href={
          userCoords
            ? `https://www.google.com/maps/search/petrol+pump/@${userCoords.lat},${userCoords.lng},14z`
            : "https://www.google.com/maps/search/petrol+pump+near+me"
        }
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 p-4 transition hover:border-amber-500/60 shadow-lg group"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 font-bold shrink-0 shadow-md">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              <span>Open Live Google Maps Radar</span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                Live Traffic & Fuel Prices
              </span>
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Launch turn-by-turn navigation directly to the nearest open pump
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:text-amber-300 shrink-0">
          <span>Open Maps</span>
          <ExternalLink className="h-4 w-4" />
        </div>
      </a>

      {/* Brand Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {["ALL", "IndianOil", "Bharat Petroleum", "HPCL", "Shell", "Nayara"].map((brand) => (
          <button
            key={brand}
            onClick={() => setSelectedBrand(brand)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
              selectedBrand === brand
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* Stations List */}
      <section className="flex flex-col gap-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
            <p className="text-xs">Finding nearest petrol stations...</p>
          </div>
        ) : stations.filter((s) => selectedBrand === "ALL" || s.brand.toLowerCase().includes(selectedBrand.toLowerCase())).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
            <Fuel className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-zinc-300">No stations found for &quot;{selectedBrand}&quot;</p>
            <button
              onClick={() => setSelectedBrand("ALL")}
              className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-400"
            >
              Show All Brands
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stations
              .filter((s) => selectedBrand === "ALL" || s.brand.toLowerCase().includes(selectedBrand.toLowerCase()))
              .map((st) => (
              <div
                key={st.id}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 transition hover:border-zinc-700 shadow-md flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-zinc-100">
                        {st.name}
                      </span>

                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                          brandColors[st.brand] || "bg-zinc-800 text-zinc-300 border-zinc-700"
                        }`}
                      >
                        {st.brand}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-zinc-400">{st.address}</p>

                    {/* Amenities */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {st.amenities.map((am, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-zinc-950 px-2 py-0.5 text-[10px] text-zinc-400 border border-zinc-800"
                        >
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-bold text-amber-400">
                        {st.distanceKm} km
                      </span>
                      <p className="text-[10px] text-zinc-500">{st.openStatus}</p>
                    </div>

                    <a
                      href={
                        userCoords
                          ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${encodeURIComponent(`${st.name} ${st.address}`)}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${st.name} ${st.brand}`)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                    >
                      <Navigation className="h-3 w-3 text-amber-400" />
                      <span>Route</span>
                      <ExternalLink className="h-3 w-3 text-zinc-500" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
