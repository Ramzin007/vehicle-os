"use client";

import { useState } from "react";
import { X, Bike, Car, Loader2 } from "lucide-react";
import { useVehicle } from "@/components/context/vehicle-context";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddVehicleModal({ isOpen, onClose }: AddVehicleModalProps) {
  const { refreshVehicles, setActiveVehicleId } = useVehicle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    model: "",
    type: "MOTORCYCLE",
    make: "",
    year: new Date().getFullYear(),
    registrationNumber: "",
    fuelType: "PETROL",
    tankCapacity: "",
    currentOdometer: "",
    color: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.model) {
      setError("Please provide vehicle name and model");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          model: form.model,
          type: form.type,
          make: form.make || form.name.split(" ")[0] || "Generic",
          year: form.year ? Number(form.year) : undefined,
          registrationNumber: form.registrationNumber || undefined,
          fuelType: form.fuelType,
          tankCapacity: form.tankCapacity ? Number(form.tankCapacity) : undefined,
          currentOdometer: Number(form.currentOdometer || 0),
          color: form.color || undefined,
          isDefault: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create vehicle");
      }

      await refreshVehicles();
      if (data.vehicle?.id) {
        setActiveVehicleId(data.vehicle.id);
      }
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Add New Vehicle</h2>
            <p className="text-xs text-zinc-400">Track another motorcycle, car, or scooter</p>
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
          {/* Type Selector */}
          <div>
            <label className="text-xs font-medium text-zinc-400">Vehicle Type</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "MOTORCYCLE" })}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition ${
                  form.type === "MOTORCYCLE"
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                <Bike className="h-4 w-4" />
                Motorcycle
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "CAR" })}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition ${
                  form.type === "CAR"
                    ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                    : "border-zinc-800 bg-zinc-955 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                <Car className="h-4 w-4" />
                Car / 4-Wheeler
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Vehicle Name</label>
              <input
                type="text"
                placeholder="e.g. TVS Ronin / Honda City"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Model / Variant</label>
              <input
                type="text"
                placeholder="e.g. 225 / ZX CVT"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Current Odometer (km)</label>
              <input
                type="number"
                placeholder="e.g. 4350"
                value={form.currentOdometer}
                onChange={(e) => setForm({ ...form, currentOdometer: e.target.value })}
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Fuel Tank Capacity (L)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 14.0"
                value={form.tankCapacity}
                onChange={(e) => setForm({ ...form, tankCapacity: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Registration Number</label>
              <input
                type="text"
                placeholder="e.g. KL 10 AV 4242"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Fuel Type</label>
              <select
                value={form.fuelType}
                onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="CNG">CNG</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
