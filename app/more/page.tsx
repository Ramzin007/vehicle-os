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
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function MorePage() {
  const { vehicles, activeVehicle, setActiveVehicleId, refreshVehicles } = useVehicle();
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    setDeletingId(vehicleToDelete.id);
    try {
      const res = await fetch(`/api/vehicles?id=${encodeURIComponent(vehicleToDelete.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Vehicle "${vehicleToDelete.name}" removed successfully`);
        setVehicleToDelete(null);
        await refreshVehicles();
        if (data.newDefaultId) {
          setActiveVehicleId(data.newDefaultId);
        }
      } else {
        alert(data.error || "Failed to remove vehicle");
      }
    } catch (e) {
      console.error(e);
      alert("Error removing vehicle");
    } finally {
      setDeletingId(null);
    }
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
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-2xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
            <Settings className="h-5 w-5" />
          </div>
          Settings & Vehicle Garage
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Garage management, telemetry backup, and vehicle technical specifications
        </p>
      </div>

      {/* 2-Column Responsive Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Vehicle Specs & Garage List (lg: 6 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-6">
          {/* Active Vehicle Specifications Card */}
          {activeVehicle && (
            <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    {activeVehicle.type === "MOTORCYCLE" ? (
                      <Bike className="h-6 w-6" />
                    ) : (
                      <Car className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-100">{activeVehicle.name}</h2>
                    <p className="text-xs text-zinc-400">{activeVehicle.model}</p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  Active Vehicle
                </span>
              </div>

              {/* Technical Specs Grid */}
              <div className="mt-5 grid grid-cols-2 gap-2.5 text-xs border-t border-zinc-800/80 pt-4">
                <div className="rounded-2xl bg-zinc-950/60 p-3 border border-zinc-800/60">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500">
                    Registration
                  </span>
                  <p className="font-mono text-zinc-200 mt-1 font-semibold">
                    {activeVehicle.registrationNumber || "Unregistered"}
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-950/60 p-3 border border-zinc-800/60">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500">
                    Tank Capacity
                  </span>
                  <p className="text-zinc-200 mt-1 font-semibold">
                    {activeVehicle.tankCapacity ? `${activeVehicle.tankCapacity} Liters` : "14 L"}
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-950/60 p-3 border border-zinc-800/60">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500">
                    Odometer
                  </span>
                  <p className="text-zinc-200 mt-1 font-semibold">
                    {activeVehicle.currentOdometer.toLocaleString()} km
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-950/60 p-3 border border-zinc-800/60">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500">
                    Fuel Type
                  </span>
                  <p className="text-zinc-200 mt-1 font-semibold">{activeVehicle.fuelType}</p>
                </div>
              </div>

              {/* TVS Ronin Signature Notes */}
              {activeVehicle.name.toLowerCase().includes("ronin") && (
                <div className="mt-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-3.5 text-xs text-zinc-400 leading-relaxed">
                  <strong className="text-zinc-300">TVS Ronin 225 Specifications:</strong> 225.9 cc oil-cooled 4-valve engine delivering 20.4 PS @ 7,750 RPM and 19.93 Nm torque @ 3,750 RPM. Equipped with Assist & Slipper clutch, Dual-Channel ABS (Rain / Urban modes), Showa USD front forks, and Glide Through Technology (GTT).
                </div>
              )}
            </section>
          )}

          {/* Switch / Add Vehicles Garage */}
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Vehicles in Garage ({vehicles.length})
              </h3>
              <button
                onClick={() => setIsAddVehicleOpen(true)}
                className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Vehicle
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className={`group flex items-center justify-between rounded-2xl border p-3.5 transition ${
                    v.id === activeVehicle?.id
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
                  }`}
                >
                  <button
                    onClick={() => setActiveVehicleId(v.id)}
                    className="flex flex-1 items-center gap-3 text-left overflow-hidden mr-2"
                  >
                    {v.type === "MOTORCYCLE" ? (
                      <Bike className="h-5 w-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Car className="h-5 w-5 text-cyan-400 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1 truncate">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold truncate">{v.name}</p>
                        {v.id === activeVehicle?.id && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {v.model} • {v.currentOdometer.toLocaleString()} km
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {v.id === activeVehicle?.id ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                    ) : (
                      <button
                        onClick={() => setActiveVehicleId(v.id)}
                        className="rounded-lg border border-zinc-700/60 bg-zinc-800/80 px-2 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      >
                        Select
                      </button>
                    )}

                    {vehicles.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVehicleToDelete({ id: v.id, name: v.name });
                        }}
                        title={`Remove ${v.name}`}
                        className="rounded-lg p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Tools & Backup (lg: 6 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-6">
          {/* Shortcuts & Utilities */}
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Vehicle Tools & Safety
            </h3>

            <div className="flex flex-col divide-y divide-zinc-800/80">
              <Link
                href="/documents"
                className="flex items-center justify-between py-3.5 text-xs text-zinc-200 hover:text-white group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-200">Vehicle Documents & Expiry Vault</p>
                    <p className="text-[11px] text-zinc-500">RC, Insurance, PUC, and License validity</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300" />
              </Link>

              <Link
                href="/stations"
                className="flex items-center justify-between py-3.5 text-xs text-zinc-200 hover:text-white group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-200">Nearby Fuel Stations</p>
                    <p className="text-[11px] text-zinc-500">Live GPS fuel point, air check, and maps route</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300" />
              </Link>
            </div>
          </section>

          {/* Data Management & Demo Seeder */}
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Data & System
            </h3>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-3.5 text-xs text-zinc-200 hover:bg-zinc-900 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold">Export Telemetry (JSON)</span>
                </div>
                <span className="text-[10px] text-zinc-500">Backup</span>
              </button>

              <button
                onClick={handleResetData}
                disabled={resetting}
                className="flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-300 hover:bg-red-500/10 transition"
              >
                <div className="flex items-center gap-2.5">
                  {resetting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                  ) : (
                    <RotateCcw className="h-4 w-4 text-red-400" />
                  )}
                  <span className="font-semibold">Reset to TVS Ronin 225 Demo Data</span>
                </div>
                <span className="text-[10px] text-red-400/80">Restore</span>
              </button>
            </div>
          </section>

          {/* Tech Architecture Footer */}
          <footer className="text-center py-2 text-xs text-zinc-500 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-400">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>VehicleOS • Production-Minded Companion</span>
            </div>
            <p className="text-[11px]">Next.js 16 • React 19 • Tailwind CSS v4 • Prisma & SQLite</p>
          </footer>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isAddVehicleOpen && (
        <AddVehicleModal
          isOpen={isAddVehicleOpen}
          onClose={() => setIsAddVehicleOpen(false)}
        />
      )}

      {/* Delete Vehicle Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-zinc-100">
              Remove Vehicle?
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Are you sure you want to remove <strong className="text-zinc-200">{vehicleToDelete.name}</strong> from your garage?
              All associated fuel logs, service history, and documents for this vehicle will also be deleted.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                disabled={Boolean(deletingId)}
                className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVehicle}
                disabled={Boolean(deletingId)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-red-500 py-2.5 text-xs font-bold text-white hover:bg-red-600 transition shadow-lg shadow-red-500/20"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
