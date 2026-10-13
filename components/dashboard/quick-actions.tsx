"use client";

import { useState } from "react";
import Link from "next/link";
import { Fuel, Wrench, Receipt, MapPin, Plus } from "lucide-react";
import AddRefuelModal from "@/components/modals/add-refuel-modal";
import AddServiceModal from "@/components/modals/add-service-modal";
import AddExpenseModal from "@/components/modals/add-expense-modal";

interface QuickActionsProps {
  onRefresh?: () => void;
}

export default function QuickActions({ onRefresh }: QuickActionsProps) {
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const handleSuccess = () => {
    if (onRefresh) onRefresh();
  };

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Quick Actions
          </h2>
          <span className="text-[11px] text-zinc-500">Tap to record</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Add Fuel */}
          <button
            type="button"
            onClick={() => setIsFuelModalOpen(true)}
            className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 text-left transition hover:border-emerald-500/40 hover:bg-zinc-850 group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
              <Fuel className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-100 flex items-center gap-1">
                Add Refill
                <Plus className="h-3 w-3 text-emerald-400" />
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Log fuel & mileage</p>
            </div>
          </button>

          {/* Schedule Service */}
          <button
            type="button"
            onClick={() => setIsServiceModalOpen(true)}
            className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 text-left transition hover:border-cyan-500/40 hover:bg-zinc-850 group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-100 flex items-center gap-1">
                Log Service
                <Plus className="h-3 w-3 text-cyan-400" />
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Maintenance task</p>
            </div>
          </button>

          {/* Add Expense */}
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 text-left transition hover:border-purple-500/40 hover:bg-zinc-850 group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-100 flex items-center gap-1">
                Add Expense
                <Plus className="h-3 w-3 text-purple-400" />
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Tolls, gear, wash</p>
            </div>
          </button>

          {/* Find Fuel Stations */}
          <Link
            href="/stations"
            className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 text-left transition hover:border-amber-500/40 hover:bg-zinc-850 group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-100">Nearby Fuel</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">GPS station finder</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Modals */}
      {isFuelModalOpen && (
        <AddRefuelModal
          isOpen={isFuelModalOpen}
          onClose={() => setIsFuelModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
      {isServiceModalOpen && (
        <AddServiceModal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
      {isExpenseModalOpen && (
        <AddExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}