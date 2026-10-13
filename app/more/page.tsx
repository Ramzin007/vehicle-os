"use client";

import { useState } from "react";
import Link from "next/link";
import { useVehicle } from "@/components/context/vehicle-context";
import AddVehicleModal from "@/components/modals/add-vehicle-modal";
import {
  Settings,
  Bike,
  Car,
  FileText,
  MapPin,
  RotateCcw,
  Download,
  Shield,
  Plus,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function MorePage() {
  const { vehicles, activeVehicle, setActiveVehicleId, refreshVehicles } = useVehicle();
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetData = async () => {
    if (!confirm("Reset database to the original TVS Ronin 225 sample dataset?")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshVehicles();
        showToast("Database reset to TVS Ronin 225 sample data");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vehicleos-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Telemetry data exported successfully");
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-2xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-zinc-400" />
          Settings & Vehicle Garage
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Garage management, telemetry backup, and specifications
        </p>
      </div>

      {/* Active Vehicle Specifications Card */}
      {activeVehicle && (
        <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                {activeVehicle.type === "MOTORCYCLE" ? (
                  <Bike className="h-5 w-5" />
                ) : (
                  <Car className="h-5 w-5" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">{activeVehicle.name}</h2>
                <p className="text-xs text-zinc-400">{activeVehicle.model}</p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
              Active Vehicle
            </span>
          </div>

          {/* Technical Specs Grid */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-zinc-800/80 pt-3">
            <div className="rounded-xl bg-zinc-950/60 p-2.5 border border-zinc-800/60">
              <span className="text-[10px] uppercase font-semibold text-zinc-500">
                Registration
              </span>
              <p className="font-mono text-zinc-200 mt-0.5 font-medium">
                {activeVehicle.registrationNumber || "Unregistered"}
              </p>
            </div>
            <div className="rounded-xl bg-zinc-950/60 p-2.5 border border-zinc-800/60">
              <span className="text-[10px] uppercase font-semibold text-zinc-500">
                Tank Capacity
              </span>
              <p className="text-zinc-200 mt-0.5 font-medium">
                {activeVehicle.tankCapacity ? `${activeVehicle.tankCapacity} Liters` : "14 L"}
              </p>
            </div>
            <div className="rounded-xl bg-zinc-950/60 p-2.5 border border-zinc-800/60">
              <span className="text-[10px] uppercase font-semibold text-zinc-500">
                Odometer
              </span>
              <p className="text-zinc-200 mt-0.5 font-medium">
                {activeVehicle.currentOdometer.toLocaleString()} km
              </p>
            </div>
            <div className="rounded-xl bg-zinc-950/60 p-2.5 border border-zinc-800/60">
              <span className="text-[10px] uppercase font-semibold text-zinc-500">
                Fuel Type
              </span>
              <p className="text-zinc-200 mt-0.5 font-medium">{activeVehicle.fuelType}</p>
            </div>
          </div>

          {/* TVS Ronin Signature Notes */}
          {activeVehicle.name.toLowerCase().includes("ronin") && (
            <div className="mt-3 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3 text-[11px] text-zinc-400">
              <strong className="text-zinc-300">TVS Ronin 225 Highlights:</strong> 225.9 cc oil-cooled 4-valve engine (20.4 PS, 19.93 Nm torque), Assist & Slipper clutch, Dual-Channel ABS with Rain/Urban modes, and Upside Down (USD) Showa front suspension.
            </div>
          )}
        </section>
      )}

      {/* Switch / Add Vehicles Garage */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Vehicles in Garage ({vehicles.length})
          </h3>
          <button
            onClick={() => setIsAddVehicleOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Vehicle
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveVehicleId(v.id)}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                v.id === activeVehicle?.id
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-3">
                {v.type === "MOTORCYCLE" ? (
                  <Bike className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <Car className="h-4 w-4 text-cyan-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-semibold">{v.name}</p>
                  <p className="text-[10px] text-zinc-500">{v.model} • {v.currentOdometer.toLocaleString()} km</p>
                </div>
              </div>

              {v.id === activeVehicle?.id && (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Shortcuts & Utilities */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          Vehicle Tools & Safety
        </h3>

        <div className="flex flex-col divide-y divide-zinc-800/80">
          <Link
            href="/documents"
            className="flex items-center justify-between py-3 text-xs text-zinc-200 hover:text-white group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Vehicle Documents & Expiry</p>
                <p className="text-[10px] text-zinc-500">RC, Insurance, PUC, and License tracking</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300" />
          </Link>

          <Link
            href="/stations"
            className="flex items-center justify-between py-3 text-xs text-zinc-200 hover:text-white group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Nearby Fuel Stations</p>
                <p className="text-[10px] text-zinc-500">Live GPS fuel point and air finder</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300" />
          </Link>
        </div>
      </section>

      {/* Data Management & Demo Seeder */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          Data & System
        </h3>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300 hover:bg-zinc-900 transition"
          >
            <div className="flex items-center gap-2.5">
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Export Telemetry (JSON)</span>
            </div>
            <span className="text-[10px] text-zinc-500">Backup</span>
          </button>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300 hover:bg-red-500/10 transition"
          >
            <div className="flex items-center gap-2.5">
              {resetting ? (
                <Loader2 className="h-4 w-4 animate-spin text-red-400" />
              ) : (
                <RotateCcw className="h-4 w-4 text-red-400" />
              )}
              <span>Reset to TVS Ronin 225 Demo Data</span>
            </div>
            <span className="text-[10px] text-red-400/80">Restore</span>
          </button>
        </div>
      </section>

      {/* Tech Architecture Footer */}
      <footer className="text-center py-2 text-[11px] text-zinc-500 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5 font-medium text-zinc-400">
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          <span>VehicleOS • Production-Minded Companion</span>
        </div>
        <p>Next.js 16 • React 19 • Tailwind CSS v4 • Prisma & SQLite</p>
      </footer>

      {/* Add Vehicle Modal */}
      {isAddVehicleOpen && (
        <AddVehicleModal
          isOpen={isAddVehicleOpen}
          onClose={() => setIsAddVehicleOpen(false)}
        />
      )}
    </div>
  );
}
