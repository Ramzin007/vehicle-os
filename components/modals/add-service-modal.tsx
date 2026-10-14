"use client";

import { useState } from "react";
import { X, Wrench, Loader2 } from "lucide-react";
import { useVehicle } from "@/components/context/vehicle-context";

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddServiceModal({ isOpen, onClose, onSuccess }: AddServiceModalProps) {
  const { activeVehicle } = useVehicle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ROUTINE");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState("PENDING");
  const [dueOdometer, setDueOdometer] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [intervalKm, setIntervalKm] = useState("");
  const [intervalMonths, setIntervalMonths] = useState("");
  const [cost, setCost] = useState("");
  const [serviceCenter, setServiceCenter] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const presets = [
    { title: "Engine Oil & Filter Change", category: "OIL", priority: "HIGH", intervalKm: 5000, intervalMonths: 6, cost: 1200 },
    { title: "Chain Clean & Lubricate", category: "CHAIN", priority: "MEDIUM", intervalKm: 500, intervalMonths: 1, cost: 150 },
    { title: "Brake Fluid & Pad Inspection", category: "BRAKES", priority: "MEDIUM", intervalKm: 6000, intervalMonths: 6, cost: 350 },
    { title: "Air Filter Clean / Replace", category: "ROUTINE", priority: "MEDIUM", intervalKm: 6000, intervalMonths: 6, cost: 400 },
    { title: "Spark Plug Inspection", category: "ROUTINE", priority: "LOW", intervalKm: 12000, intervalMonths: 12, cost: 250 },
    { title: "Full General Periodic Service", category: "ROUTINE", priority: "HIGH", intervalKm: 5000, intervalMonths: 6, cost: 2200 },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setPriority(preset.priority);
    setIntervalKm(String(preset.intervalKm));
    setIntervalMonths(String(preset.intervalMonths));
    setCost(String(preset.cost));

    if (activeVehicle) {
      setDueOdometer(String(activeVehicle.currentOdometer + preset.intervalKm));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle) {
      setError("No active vehicle selected");
      return;
    }
    if (!title) {
      setError("Please specify a service title");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: activeVehicle.id,
          title,
          category,
          priority,
          status,
          dueOdometer: dueOdometer ? Number(dueOdometer) : null,
          dueDate: dueDate || null,
          intervalKm: intervalKm ? Number(intervalKm) : null,
          intervalMonths: intervalMonths ? Number(intervalMonths) : null,
          cost: cost ? Number(cost) : 0,
          serviceCenter: serviceCenter || null,
          notes: notes || null,
          lastCompletedOdometer: status === "COMPLETED" ? activeVehicle.currentOdometer : null,
          lastCompletedDate: status === "COMPLETED" ? new Date().toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add service task");
      }

      onSuccess();
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
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Schedule Service Task</h2>
              <p className="text-xs text-zinc-400 font-mono">
                {activeVehicle ? `${activeVehicle.name} • ${activeVehicle.model}` : "Maintenance schedule"}
              </p>
            </div>
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

        {/* Quick Presets */}
        <div className="mt-4">
          <p className="text-[11px] font-medium text-zinc-400">Quick Presets</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-cyan-500/50 hover:bg-zinc-800"
              >
                + {p.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-400">Task Title</label>
            <input
              type="text"
              placeholder="e.g. Engine Oil Replacement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="ROUTINE">Routine Service</option>
                <option value="OIL">Engine Oil</option>
                <option value="CHAIN">Drive Chain</option>
                <option value="BRAKES">Brakes & Fluids</option>
                <option value="TIRES">Tires & Alignment</option>
                <option value="ELECTRICAL">Battery & Electrical</option>
                <option value="INSPECTION">General Inspection</option>
                <option value="REPAIR">Repair</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Due at Odometer (km)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={dueOdometer}
                onChange={(e) => setDueOdometer(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Due Date (Optional)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Repeating Interval (km)</label>
              <input
                type="number"
                placeholder="e.g. 3000"
                value={intervalKm}
                onChange={(e) => setIntervalKm(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Estimated Cost (₹)</label>
              <input
                type="number"
                placeholder="e.g. 1200"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="PENDING">Pending</option>
                <option value="DUE_SOON">Due Soon</option>
                <option value="COMPLETED">Already Completed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Service Center</label>
              <input
                type="text"
                placeholder="e.g. TVS Authorized Point"
                value={serviceCenter}
                onChange={(e) => setServiceCenter(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Notes / Parts Info</label>
            <input
              type="text"
              placeholder="e.g. TVS Tru4 Synthetic 10W-30 oil, OEM O-ring"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="mt-2 flex gap-3">
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
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50 transition shadow-lg shadow-cyan-500/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Service Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
