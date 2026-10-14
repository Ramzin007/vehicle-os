"use client";

import { useState } from "react";
import { X, Bike, Car, Loader2, ChevronDown } from "lucide-react";
import { useVehicle } from "@/components/context/vehicle-context";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOTORCYCLE_BRANDS = [
  "Royal Enfield",
  "Yamaha",
  "TVS",
  "Honda",
  "Hero",
  "Bajaj",
  "KTM",
  "Suzuki",
  "Kawasaki",
  "Triumph",
  "BMW Motorrad",
  "Ather",
  "Ola Electric",
  "Jawa / Yezdi",
  "Aprilia",
  "Ducati",
  "Harley-Davidson",
  "Ultraviolette",
  "Revolt",
  "Husqvarna",
  "Benelli",
  "Vespa",
];

const CAR_BRANDS = [
  "Maruti Suzuki",
  "Hyundai",
  "Tata Motors",
  "Mahindra",
  "Toyota",
  "Kia",
  "Honda",
  "Volkswagen",
  "Skoda",
  "MG Motor",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Renault",
  "Nissan",
  "Ford",
  "Jeep",
  "Volvo",
  "BYD",
  "Tesla",
  "Porsche",
  "Land Rover",
];

export default function AddVehicleModal({ isOpen, onClose }: AddVehicleModalProps) {
  const { refreshVehicles, setActiveVehicleId } = useVehicle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");

  const [form, setForm] = useState({
    model: "",
    type: "MOTORCYCLE",
    year: new Date().getFullYear(),
    registrationNumber: "",
    fuelType: "PETROL",
    tankCapacity: "",
    currentOdometer: "",
    color: "",
  });

  if (!isOpen) return null;

  const currentBrands = form.type === "MOTORCYCLE" ? MOTORCYCLE_BRANDS : CAR_BRANDS;

  const handleTypeChange = (newType: "MOTORCYCLE" | "CAR") => {
    setForm((prev) => ({ ...prev, type: newType }));
    if (selectedBrand !== "OTHER") {
      const allowedList = newType === "MOTORCYCLE" ? MOTORCYCLE_BRANDS : CAR_BRANDS;
      if (!allowedList.includes(selectedBrand)) {
        setSelectedBrand("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const brandName = selectedBrand === "OTHER" ? customBrand.trim() : selectedBrand.trim();

    if (!brandName) {
      setError("Please select or enter a vehicle brand");
      return;
    }

    if (!form.model.trim()) {
      setError("Please enter the vehicle model / variant");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.model.trim(),
          model: form.model.trim(),
          type: form.type,
          make: brandName,
          year: form.year ? Number(form.year) : undefined,
          registrationNumber: form.registrationNumber.trim() || undefined,
          fuelType: form.fuelType,
          tankCapacity: form.tankCapacity ? Number(form.tankCapacity) : undefined,
          currentOdometer: Number(form.currentOdometer || 0),
          color: form.color.trim() || undefined,
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl max-h-[88dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Add New Vehicle</h2>
            <p className="text-xs text-zinc-400">Track another motorcycle, car, or scooter</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-zinc-200"
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
                onClick={() => handleTypeChange("MOTORCYCLE")}
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
                onClick={() => handleTypeChange("CAR")}
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

          {/* Brand & Model Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Brand</label>
              <div className="relative mt-1.5">
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    if (e.target.value !== "OTHER") {
                      setCustomBrand("");
                    }
                  }}
                  required
                  className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 pr-9 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="" disabled>Select brand</option>
                  {currentBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="OTHER">Other (Specify)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400">Model / Variant</label>
              <input
                type="text"
                placeholder={form.type === "MOTORCYCLE" ? "e.g. Hunter 350 / R15 V4" : "e.g. Creta SX / Swift ZXi"}
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Other Brand Input if selected */}
          {selectedBrand === "OTHER" && (
            <div>
              <label className="text-xs font-medium text-zinc-400">Specify Brand Name</label>
              <input
                type="text"
                placeholder={form.type === "MOTORCYCLE" ? "e.g. Benelli, Ultraviolette, etc." : "e.g. Force, Mini, Lexus, etc."}
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Current Odometer (km)</label>
              <input
                type="number"
                placeholder="e.g. 10000"
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
                placeholder="e.g. 12.0"
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
                placeholder="e.g. MH 02 AB 1234"
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

          {/* Action buttons with generous clearance for mobile nav and gesture bars */}
          <div className="mt-4 flex gap-3 pt-2 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 py-3 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition shadow-lg shadow-emerald-500/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
