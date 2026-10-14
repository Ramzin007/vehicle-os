"use client";

import { useState } from "react";
import { X, ReceiptText, Loader2 } from "lucide-react";
import { useVehicle } from "@/components/context/vehicle-context";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
  const { activeVehicle } = useVehicle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("SERVICE");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [odometer, setOdometer] = useState(activeVehicle ? String(activeVehicle.currentOdometer) : "");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const categories = [
    { id: "SERVICE", label: "Service / Repair" },
    { id: "PARTS", label: "Spare Parts" },
    { id: "ACCESSORIES", label: "Gear / Mod" },
    { id: "WASH", label: "Wash / Detailing" },
    { id: "TOLL", label: "Toll / Parking" },
    { id: "INSURANCE", label: "Insurance / Tax" },
    { id: "FUEL", label: "Fuel" },
    { id: "OTHER", label: "Other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle) {
      setError("No active vehicle selected");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: activeVehicle.id,
          title,
          category,
          amount: parsedAmount,
          date: new Date(date).toISOString(),
          odometer: odometer ? Number(odometer) : null,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record expense");
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Add Vehicle Expense</h2>
              <p className="text-xs text-zinc-400 font-mono">
                {activeVehicle ? `${activeVehicle.name} • ${activeVehicle.model}` : "Record spending"}
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

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* Category Chips */}
          <div>
            <label className="text-xs font-medium text-zinc-400">Category</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                    category === c.id
                      ? "border-purple-500 bg-purple-500/20 text-purple-300"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 750"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-semibold text-purple-400 placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Title / Description</label>
            <input
              type="text"
              placeholder="e.g. Chain Lube Spray / Ceramic Foam Wash"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Odometer (Optional)</label>
              <input
                type="number"
                placeholder="e.g. 10000"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Purchased online"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
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
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-500 py-3 text-xs font-semibold text-zinc-950 hover:bg-purple-400 disabled:opacity-50 transition shadow-lg shadow-purple-500/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
