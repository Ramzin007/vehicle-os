"use client";

import { useState } from "react";
import { Bike, Car, Gauge, Fuel, Edit3, Check, X } from "lucide-react";
import { useVehicle } from "@/components/context/vehicle-context";

interface VehicleCardProps {
  careScore?: number;
  careRating?: string;
  careColor?: string;
  estimatedRange?: number;
}

export default function VehicleCard({
  careScore = 88,
  careRating = "GOOD",
  careColor = "#10b981",
  estimatedRange = 420,
}: VehicleCardProps) {
  const { activeVehicle, refreshVehicles } = useVehicle();
  const [isEditingOdo, setIsEditingOdo] = useState(false);
  const [odoValue, setOdoValue] = useState("");
  const [savingOdo, setSavingOdo] = useState(false);

  if (!activeVehicle) {
    return (
      <section className="animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="h-6 w-32 rounded bg-zinc-800" />
        <div className="mt-2 h-4 w-48 rounded bg-zinc-800/60" />
      </section>
    );
  }

  const handleSaveOdometer = async () => {
    const num = parseFloat(odoValue);
    if (isNaN(num) || num < 0) return;
    setSavingOdo(true);
    try {
      await fetch("/api/vehicles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeVehicle.id,
          currentOdometer: num,
        }),
      });
      await refreshVehicles();
      setIsEditingOdo(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingOdo(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 p-5 shadow-xl">
      {/* Decorative ambient glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-15 blur-3xl"
        style={{ backgroundColor: careColor }}
      />

      {/* Header with Type & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/80 px-2.5 text-[11px] font-medium text-zinc-300">
            {activeVehicle.type === "MOTORCYCLE" ? (
              <Bike className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Car className="h-3.5 w-3.5 text-cyan-400" />
            )}
            <span>{activeVehicle.make || "Vehicle"}</span>
          </div>

          {activeVehicle.registrationNumber && (
            <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-2.5 py-0.5 text-[10px] font-mono tracking-wider text-zinc-400">
              {activeVehicle.registrationNumber}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </div>
      </div>

      {/* Vehicle Name and Care Score Ring */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
            {activeVehicle.name}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {activeVehicle.model} {activeVehicle.year ? `• ${activeVehicle.year}` : ""}
          </p>
        </div>

        {/* Circular Care Score Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-zinc-800 bg-zinc-950/90 shadow-inner">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800/80"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.2"
                strokeDasharray={`${careScore}, 100`}
                strokeLinecap="round"
                stroke={careColor}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-base font-extrabold tracking-tight text-zinc-100">
                {careScore}
              </span>
            </div>
          </div>
          <span
            className="mt-1 text-[9px] font-bold uppercase tracking-wider"
            style={{ color: careColor }}
          >
            {careRating}
          </span>
        </div>
      </div>

      {/* Telemetry bar: Odometer & Est Range */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-800/80 pt-4">
        {/* Odometer */}
        <div className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800/70 text-zinc-300">
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">
                Odometer
              </p>
              {isEditingOdo ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="number"
                    value={odoValue}
                    onChange={(e) => setOdoValue(e.target.value)}
                    className="w-20 rounded bg-zinc-800 px-1 py-0.5 text-xs text-zinc-100 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveOdometer}
                    disabled={savingOdo}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setIsEditingOdo(false)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-bold text-zinc-100">
                  {activeVehicle.currentOdometer.toLocaleString()}{" "}
                  <span className="text-[10px] font-normal text-zinc-500">km</span>
                </p>
              )}
            </div>
          </div>

          {!isEditingOdo && (
            <button
              onClick={() => {
                setOdoValue(String(activeVehicle.currentOdometer));
                setIsEditingOdo(true);
              }}
              className="text-zinc-500 hover:text-zinc-300 p-1"
              title="Update Odometer"
            >
              <Edit3 className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Est. Range Remaining */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Fuel className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">
              Est. Range
            </p>
            <p className="text-sm font-bold text-emerald-400">
              ~{estimatedRange}{" "}
              <span className="text-[10px] font-normal text-zinc-500">km</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}