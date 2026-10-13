"use client";

import { useState, useEffect } from "react";
import { X, Fuel, Loader2, Sparkles } from "lucide-react";
import { useVehicle } from "@/components/context/vehicle-context";

interface AddRefuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddRefuelModal({ isOpen, onClose, onSuccess }: AddRefuelModalProps) {
  const { activeVehicle, refreshVehicles } = useVehicle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [odometer, setOdometer] = useState("");
  const [liters, setLiters] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("103.50");
  const [totalCost, setTotalCost] = useState("");
  const [isFullTank, setIsFullTank] = useState(true);
  const [missedRefuel, setMissedRefuel] = useState(false);
  const [stationName, setStationName] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (activeVehicle) {
      setOdometer(String(activeVehicle.currentOdometer));
    }
  }, [activeVehicle, isOpen]);

  // Handle auto-calculation of total cost when liters or price changes
  const handleLitersChange = (val: string) => {
    setLiters(val);
    const l = parseFloat(val);
    const p = parseFloat(pricePerLiter);
    if (!isNaN(l) && !isNaN(p) && l > 0 && p > 0) {
      setTotalCost((l * p).toFixed(2));
    }
  };

  const handlePriceChange = (val: string) => {
    setPricePerLiter(val);
    const l = parseFloat(liters);
    const p = parseFloat(val);
    if (!isNaN(l) && !isNaN(p) && l > 0 && p > 0) {
      setTotalCost((l * p).toFixed(2));
    }
  };

  const handleTotalCostChange = (val: string) => {
    setTotalCost(val);
    const t = parseFloat(val);
    const p = parseFloat(pricePerLiter);
    if (!isNaN(t) && !isNaN(p) && t > 0 && p > 0) {
      setLiters((t / p).toFixed(2));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle) {
      setError("No active vehicle selected");
      return;
    }

    const odoNum = parseFloat(odometer);
    const lNum = parseFloat(liters);
    const pNum = parseFloat(pricePerLiter);
    const costNum = parseFloat(totalCost);

    if (isNaN(odoNum) || odoNum <= 0) {
      setError("Please enter a valid odometer reading");
      return;
    }
    if (isNaN(lNum) || lNum <= 0) {
      setError("Please enter valid fuel liters");
      return;
    }
    if (isNaN(costNum) || costNum <= 0) {
      setError("Please enter a valid total cost");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: activeVehicle.id,
          date: new Date(date).toISOString(),
          odometer: odoNum,
          liters: lNum,
          pricePerLiter: pNum || costNum / lNum,
          totalCost: costNum,
          isFullTank,
          missedRefuel,
          stationName: stationName || null,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record fuel refill");
      }

      await refreshVehicles();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const quickStations = ["IndianOil", "Bharat Petroleum", "HPCL", "Shell", "Nayara"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Fuel className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Record Fuel Refill</h2>
              <p className="text-xs text-zinc-400">
                {activeVehicle ? `${activeVehicle.name} • ${activeVehicle.model}` : "Vehicle refill"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Odometer Reading (km)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 4350"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Fuel (Liters)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 10.5"
                value={liters}
                onChange={(e) => handleLitersChange(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-semibold text-emerald-400 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Price / L (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 103.50"
                value={pricePerLiter}
                onChange={(e) => handlePriceChange(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Total Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 1086"
                value={totalCost}
                onChange={(e) => handleTotalCostChange(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Full Tank & Missed Refuel Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div
              onClick={() => setIsFullTank(!isFullTank)}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                isFullTank
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400"
              }`}
            >
              <div>
                <p className="text-xs font-medium">Full Tank</p>
                <p className="text-[10px] text-zinc-500">Computes mileage</p>
              </div>
              <div
                className={`h-4 w-7 rounded-full p-0.5 transition-colors ${
                  isFullTank ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`h-3 w-3 rounded-full bg-white transition-transform ${
                    isFullTank ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            <div
              onClick={() => setMissedRefuel(!missedRefuel)}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                missedRefuel
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400"
              }`}
            >
              <div>
                <p className="text-xs font-medium">Missed Refill</p>
                <p className="text-[10px] text-zinc-500">Skipped tracking</p>
              </div>
              <div
                className={`h-4 w-7 rounded-full p-0.5 transition-colors ${
                  missedRefuel ? "bg-amber-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`h-3 w-3 rounded-full bg-white transition-transform ${
                    missedRefuel ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Station Name with quick chips */}
          <div>
            <label className="text-xs font-medium text-zinc-400">Fuel Station / Brand</label>
            <input
              type="text"
              placeholder="e.g. IndianOil Swaraj"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickStations.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStationName(st)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Highway cruise, Rain mode, Premium XP95"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Save Refill
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
