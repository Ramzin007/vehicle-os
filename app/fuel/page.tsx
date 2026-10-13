"use client";

import { useEffect, useState, useCallback } from "react";
import { useVehicle } from "@/components/context/vehicle-context";
import { calculateFuelMetrics, type FuelLogItem } from "@/lib/calculations";
import AddRefuelModal from "@/components/modals/add-refuel-modal";
import {
  Fuel,
  Plus,
  Award,
  Trash2,
  Calendar,
  MapPin,
} from "lucide-react";

export default function FuelPage() {
  const { activeVehicle, refreshVehicles } = useVehicle();
  const [logs, setLogs] = useState<FuelLogItem[]>([]);
  const [_loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFuel = useCallback(async () => {
    if (!activeVehicle) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/fuel?vehicleId=${activeVehicle.id}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeVehicle]);

  useEffect(() => {
    fetchFuel();
  }, [fetchFuel]);

  const metrics = calculateFuelMetrics(logs);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fuel record?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/fuel?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchFuel();
        await refreshVehicles();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5">
      {/* Header & Add Refill CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Fuel className="h-5 w-5 text-emerald-400" />
            Fuel & Refills
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {activeVehicle ? `${activeVehicle.name} • ${activeVehicle.model}` : "Fuel tracking"}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Refill</span>
        </button>
      </div>

      {/* Fuel Metrics Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Average Fuel Economy
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-emerald-400">
                {metrics.averageEconomy > 0 ? metrics.averageEconomy : "--"}
              </span>
              <span className="text-sm font-semibold text-zinc-400">km/L</span>
            </div>
            {metrics.averageEconomy > 0 && (
              <p className="text-xs text-zinc-500 mt-1">
                {(100 / metrics.averageEconomy).toFixed(2)} L/100km • ~{Math.round(metrics.averageEconomy * 2.352)} MPG (US)
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <Award className="h-3.5 w-3.5 text-emerald-400" />
              <span>Best: {metrics.bestEconomy > 0 ? `${metrics.bestEconomy} km/L` : "--"}</span>
            </div>
            {metrics.worstEconomy > 0 && (
              <span className="text-[10px] text-zinc-500">
                Low: {metrics.worstEconomy} km/L
              </span>
            )}
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-zinc-800/80 pt-4 text-center">
          <div className="rounded-xl bg-zinc-950/60 p-2.5 border border-zinc-800/60">
            <p className="text-[10px] uppercase font-semibold text-zinc-500">Cost / km</p>
            <p className="mt-1 text-sm font-bold text-zinc-200">
              {metrics.costPerKm > 0 ? `₹${metrics.costPerKm}` : "--"}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-950/60 p-2.5 border border-zinc-800/60">
            <p className="text-[10px] uppercase font-semibold text-zinc-500">Total Fuel</p>
            <p className="mt-1 text-sm font-bold text-zinc-200">
              {metrics.totalLiters > 0 ? `${metrics.totalLiters} L` : "--"}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-950/60 p-2.5 border border-zinc-800/60">
            <p className="text-[10px] uppercase font-semibold text-zinc-500">Total Spend</p>
            <p className="mt-1 text-sm font-bold text-zinc-200">
              ₹{metrics.totalCost.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Refuel History Feed */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Refuel History ({logs.length})
          </h2>
          <span className="text-[11px] text-zinc-500">Sorted by newest</span>
        </div>

        {logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
            <Fuel className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-zinc-300">No refuels logged yet</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Record your full tank fills to automatically compute your TVS Ronin fuel economy.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
            >
              Add First Refill
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 transition hover:border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-zinc-100">
                        {log.odometer.toLocaleString()} km
                      </span>

                      {log.calculatedEconomy ? (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                          {log.calculatedEconomy} km/L
                        </span>
                      ) : log.isFullTank ? (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                          Baseline Fill
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">
                          Partial
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      {log.calculatedDistance && (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          +{log.calculatedDistance} km covered
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-bold text-zinc-100">
                      ₹{log.totalCost.toFixed(0)}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {log.liters} L @ ₹{log.pricePerLiter.toFixed(2)}/L
                    </p>
                  </div>
                </div>

                {/* Station & Notes */}
                {(log.stationName || log.notes) && (
                  <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400 truncate">
                      {log.stationName && (
                        <span className="flex items-center gap-1 text-zinc-300 font-medium truncate">
                          <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                          {log.stationName}
                        </span>
                      )}
                      {log.notes && (
                        <span className="text-zinc-500 truncate italic">
                          • {log.notes}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(log.id)}
                      disabled={deletingId === log.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 p-1"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Modal */}
      {isAddModalOpen && (
        <AddRefuelModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            fetchFuel();
            refreshVehicles();
          }}
        />
      )}
    </div>
  );
}
