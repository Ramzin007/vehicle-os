"use client";

import { useState } from "react";
import Link from "next/link";
import { Fuel, Wrench, Receipt, MapPin, Plus, Zap, ArrowUpRight } from "lucide-react";
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Quick Actions
            </h2>
          </div>
          <span className="rounded-full border border-zinc-800 bg-zinc-950/80 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400">
            Shortcuts
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Add Fuel */}
          <button
            type="button"
            onClick={() => setIsFuelModalOpen(true)}
            className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3 sm:p-3.5 text-left transition hover:border-zinc-700 hover:bg-zinc-850 group w-full h-full min-h-[72px]"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
              <Fuel className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center justify-between gap-1">
                <span className="truncate">Add Refill</span>
                <Plus className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              </p>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5">
                Log fuel & mileage
              </p>
            </div>
          </button>

          {/* Schedule Service */}
          <button
            type="button"
            onClick={() => setIsServiceModalOpen(true)}
            className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3 sm:p-3.5 text-left transition hover:border-zinc-700 hover:bg-zinc-850 group w-full h-full min-h-[72px]"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
              <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center justify-between gap-1">
                <span className="truncate">Log Service</span>
                <Plus className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              </p>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5">
                Maintenance task
              </p>
            </div>
          </button>

          {/* Add Expense */}
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3 sm:p-3.5 text-left transition hover:border-zinc-700 hover:bg-zinc-850 group w-full h-full min-h-[72px]"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center justify-between gap-1">
                <span className="truncate">Add Expense</span>
                <Plus className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              </p>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5">
                Tolls, gear, wash
              </p>
            </div>
          </button>

          {/* Find Fuel Stations */}
          <Link
            href="/stations"
            className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3 sm:p-3.5 text-left transition hover:border-zinc-700 hover:bg-zinc-850 group w-full h-full min-h-[72px]"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center justify-between gap-1">
                <span className="truncate">Nearby Fuel</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              </p>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5">
                GPS station finder
              </p>
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