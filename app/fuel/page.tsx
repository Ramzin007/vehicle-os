"use client";

import { useEffect, useState, useCallback } from "react";
import { useVehicle } from "@/components/context/vehicle-context";
import { calculateFuelMetrics, type FuelLogItem } from "@/lib/calculations";
import AddRefuelModal from "@/components/modals/add-refuel-modal";
import FuelTrendChart from "@/components/fuel/fuel-trend-chart";
import {
  Fuel,
  Plus,
  Award,
  Trash2,
  Calendar,
  MapPin,
  Sparkles,
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
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header & Add Refill CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Fuel className="h-5 w-5" />
            </div>
            Fuel & Refills
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {activeVehicle ? `${activeVehicle.name} • ${activeVehicle.model}` : "Fuel economy & refills"}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Refill</span>
        </button>
      </div>

      {/* 2-Column Responsive Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Metrics & Analysis (lg: 5 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Fuel Metrics Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Average Fuel Economy
                </p>
                <div className="mt-2 flex items-baseline gap-2 font-mono">
                  <span className="text-5xl font-extrabold tracking-tight text-zinc-100 tabular-nums">
                    {metrics.averageEconomy > 0 ? metrics.averageEconomy : "--"}
                  </span>
                  <span className="text-sm font-semibold text-zinc-500">km/L</span>
                </div>
                {metrics.averageEconomy > 0 && (
                  <p className="text-xs text-zinc-400 mt-1 font-mono">
                    {(100 / metrics.averageEconomy).toFixed(2)} L/100km • ~{Math.round(metrics.averageEconomy * 2.352)} MPG (US)
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 font-mono">
                  <Award className="h-4 w-4 text-emerald-400" />
                  <span>Best: {metrics.bestEconomy > 0 ? `${metrics.bestEconomy} km/L` : "--"}</span>
                </div>
                {metrics.worstEconomy > 0 && (
                  <span className="text-xs text-zinc-500 font-mono">
                    Low: {metrics.worstEconomy} km/L
                  </span>
                )}
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-zinc-800/80 pt-4 text-center">
              <div className="rounded-2xl bg-zinc-950/60 p-3 border border-zinc-800/80">
                <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Cost / km</p>
                <p className="mt-1 text-base font-bold text-zinc-100 font-mono tabular-nums">
                  {metrics.costPerKm > 0 ? `₹${metrics.costPerKm}` : "--"}
                </p>
              </div>
              <div className="rounded-2xl bg-zinc-950/60 p-3 border border-zinc-800/80">
                <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Total Fuel</p>
                <p className="mt-1 text-base font-bold text-zinc-100 font-mono tabular-nums">
                  {metrics.totalLiters > 0 ? `${metrics.totalLiters} L` : "--"}
                </p>
              </div>
              <div className="rounded-2xl bg-zinc-950/60 p-3 border border-zinc-800/80">
                <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Total Spend</p>
                <p className="mt-1 text-base font-bold text-zinc-100 font-mono tabular-nums">
                  ₹{metrics.totalCost.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Fuel Economy Trend Curve */}
          <FuelTrendChart logs={logs} averageEconomy={metrics.averageEconomy} />

          {/* Efficiency Tips & Insights */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 text-xs text-zinc-400">
            <div className="flex items-center gap-2 mb-2 text-zinc-200 font-semibold">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Fuel Insights</span>
            </div>
            <p className="leading-relaxed">
              Consistently filling the tank to full allows VehicleOS to compute high-accuracy trip mileage between fuel stops. Maintain optimal tire pressure to maximize fuel range.
            </p>
          </div>
        </div>

        {/* Right Column: Refuel History Feed (lg: 7 cols) */}
        <div className="flex flex-col gap-3 lg:col-span-7">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Refuel History ({logs.length})
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">Chronological</span>
          </div>

          {logs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/40">
              <Fuel className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
              <p className="text-sm font-semibold text-zinc-300">No refuels logged yet</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                Record your full tank fills to automatically compute fuel economy.
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
                  className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 transition hover:border-zinc-750"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-base font-bold text-zinc-100 tabular-nums">
                          {log.odometer.toLocaleString()} km
                        </span>

                        {log.calculatedEconomy ? (
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 tabular-nums">
                            {log.calculatedEconomy} km/L
                          </span>
                        ) : log.isFullTank ? (
                          <span className="rounded-full bg-zinc-800 border border-zinc-700/50 px-2 py-0.5 text-[10px] text-zinc-400">
                            Baseline Fill
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">
                            Partial
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(log.date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>

                        {log.calculatedDistance && (
                          <span className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
                            +{log.calculatedDistance} km covered
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <p className="text-base font-bold text-zinc-100 tabular-nums">
                        ₹{log.totalCost.toFixed(0)}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 tabular-nums">
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
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10"
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
