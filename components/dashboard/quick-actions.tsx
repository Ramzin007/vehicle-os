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
            className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 text-left transition hover:border-zinc-700 hover:bg-zinc-850 group min-h-[96px] w-full"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                <Fuel className="h-4 w-4" />
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-semibold text-zinc-100">Add Refill</p>
              <p className="text-xs text-zinc-400 mt-0.5">Fuel & mileage</p>
            </div>
          </button>

          {/* Schedule Service */}
          <button
            type="button"
            onClick={() => setIsServiceModalOpen(true)}
            className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 text-left transition hover:border-zinc-700 hover:bg-zinc-850 group min-h-[96px] w-full"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
                <Wrench className="h-4 w-4" />
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-semibold text-zinc-100">Log Service</p>
              <p className="text-xs text-zinc-400 mt-0.5">Maintenance task</p>
            </div>
          </button>

          {/* Add Expense */}
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 text-left transition hover:border-zinc-700 hover:bg-zinc-850 group min-h-[96px] w-full"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                <Receipt className="h-4 w-4" />
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-zinc-950 transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-semibold text-zinc-100">Add Expense</p>
              <p className="text-xs text-zinc-400 mt-0.5">Tolls, gear, wash</p>
            </div>
          </button>

          {/* Find Fuel Stations */}
          <Link
            href="/stations"
            className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 text-left transition hover:border-zinc-700 hover:bg-zinc-850 group min-h-[96px] w-full"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-semibold text-zinc-100">Nearby Fuel</p>
              <p className="text-xs text-zinc-400 mt-0.5">GPS station finder</p>
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