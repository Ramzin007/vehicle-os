"use client";

import { useEffect, useState, useCallback } from "react";
import { useVehicle } from "@/components/context/vehicle-context";
import AddExpenseModal from "@/components/modals/add-expense-modal";
import MonthlySpendChart from "@/components/expenses/monthly-spend-chart";
import {
  ReceiptText,
  Plus,
  Trash2,
  Coins,
} from "lucide-react";

interface Expense {
  id: string;
  vehicleId: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  odometer?: number | null;
  notes?: string | null;
}

interface Summary {
  totalSpend: number;
  costPerKm: number;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  monthlyBreakdown: { month: string; amount: number }[];
}

const categoryColors: Record<string, string> = {
  FUEL: "#10b981", // emerald
  SERVICE: "#06b6d4", // cyan
  PARTS: "#f59e0b", // amber
  ACCESSORIES: "#8b5cf6", // purple
  WASH: "#3b82f6", // blue
  TOLL: "#ec4899", // pink
  INSURANCE: "#6366f1", // indigo
  OTHER: "#71717a", // zinc
};

export default function ExpensesPage() {
  const { activeVehicle } = useVehicle();
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const activeId = localStorage.getItem("vehicleos_active_vehicle_id");
        if (activeId) {
          const cached = sessionStorage.getItem(`vehicleos_cached_expenses_${activeId}`);
          if (cached) return JSON.parse(cached);
        }
      } catch {}
    }
    return [];
  });
  const [summary, setSummary] = useState<Summary | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const activeId = localStorage.getItem("vehicleos_active_vehicle_id");
        if (activeId) {
          const cached = sessionStorage.getItem(`vehicleos_cached_expense_summary_${activeId}`);
          if (cached) return JSON.parse(cached);
        }
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState(() => expenses.length === 0);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // When activeVehicle changes, if not matching initial cache, try loading vehicle-specific cache immediately
  useEffect(() => {
    if (!activeVehicle) return;
    try {
      const cachedExp = sessionStorage.getItem(`vehicleos_cached_expenses_${activeVehicle.id}`);
      const cachedSum = sessionStorage.getItem(`vehicleos_cached_expense_summary_${activeVehicle.id}`);
      if (cachedExp) {
        setExpenses(JSON.parse(cachedExp));
      }
      if (cachedSum) {
        setSummary(JSON.parse(cachedSum));
      }
    } catch {}
  }, [activeVehicle]);

  const fetchExpenses = useCallback(async () => {
    if (!activeVehicle) return;
    try {
      const res = await fetch(`/api/expenses?vehicleId=${activeVehicle.id}`);
      const data = await res.json();
      if (data.success) {
        const newExpenses = data.expenses || [];
        const newSummary = data.summary || null;
        setExpenses(newExpenses);
        setSummary(newSummary);
        try {
          sessionStorage.setItem(`vehicleos_cached_expenses_${activeVehicle.id}`, JSON.stringify(newExpenses));
          if (newSummary) {
            sessionStorage.setItem(`vehicleos_cached_expense_summary_${activeVehicle.id}`, JSON.stringify(newSummary));
          }
        } catch {}
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeVehicle]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setExpenses((prev) => {
          const updated = prev.filter((e) => e.id !== id);
          if (activeVehicle) {
            try {
              sessionStorage.setItem(`vehicleos_cached_expenses_${activeVehicle.id}`, JSON.stringify(updated));
            } catch {}
          }
          return updated;
        });
        await fetchExpenses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory === "ALL") return true;
    return e.category === selectedCategory;
  });

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header & Add CTA */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5 sm:gap-3 truncate">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
              <ReceiptText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="truncate">Expenses & Costs</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 truncate">
            {activeVehicle ? `${activeVehicle.name} • ${activeVehicle.model}` : "Cost tracking & categories"}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl bg-purple-500 px-3 sm:px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-purple-400 shadow-lg shadow-purple-500/20"
        >
          <Plus className="h-4 w-4" />
          <span><span className="hidden xs:inline">Add </span>Expense</span>
        </button>
      </div>

      {/* 2-Column Responsive Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Analytics Banner & Category Breakdown (lg: 5 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {loading && !summary ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 animate-pulse">
              <div className="h-3 w-32 bg-zinc-800 rounded mb-3" />
              <div className="h-10 w-44 bg-zinc-800 rounded mb-6" />
              <div className="h-3 w-full bg-zinc-800/60 rounded-full mb-4" />
              <div className="flex gap-2">
                <div className="h-7 w-20 bg-zinc-800/80 rounded-xl" />
                <div className="h-7 w-24 bg-zinc-800/80 rounded-xl" />
                <div className="h-7 w-20 bg-zinc-800/80 rounded-xl" />
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Total Vehicle Investment
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-2 font-mono">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-100 tabular-nums">
                  ₹{summary?.totalSpend.toLocaleString() ?? 0}
                </span>
                {summary && summary.costPerKm > 0 && (
                  <span className="text-xs text-purple-400 font-bold tabular-nums">
                    (₹{summary.costPerKm}/km)
                  </span>
                )}
              </div>

              {/* Visual Category Proportion Bar */}
              {summary && summary.categoryBreakdown.length > 0 && (
                <div className="mt-6 border-t border-zinc-800/80 pt-5">
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                    {summary.categoryBreakdown.map((cat) => (
                      <div
                        key={cat.category}
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: categoryColors[cat.category] || "#71717a",
                        }}
                        title={`${cat.category}: ${cat.percentage}%`}
                      />
                    ))}
                  </div>

                  {/* Category Legend Chips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {summary.categoryBreakdown.map((cat) => (
                      <div
                        key={cat.category}
                        className="flex items-center gap-2 rounded-xl bg-zinc-950/70 px-3 py-1.5 text-xs border border-zinc-800/80"
                      >
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: categoryColors[cat.category] || "#71717a" }}
                        />
                        <span className="text-zinc-300 font-medium">{cat.category}</span>
                        <span className="text-zinc-500 font-mono">₹{cat.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Monthly Spending Cadence Bar Chart */}
          {summary && summary.monthlyBreakdown.length > 0 && (
            <MonthlySpendChart monthlyData={summary.monthlyBreakdown} />
          )}
        </div>

        {/* Right Column: Filter & Transaction Feed (lg: 7 cols) */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* Category Filter Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {["ALL", "FUEL", "SERVICE", "PARTS", "ACCESSORIES", "WASH", "TOLL", "INSURANCE"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          {/* Transactions List */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Transactions ({filteredExpenses.length})
              </h2>
              <span className="text-[11px] text-zinc-500 font-mono">Chronological</span>
            </div>

            {loading && expenses.length === 0 ? (
              <div className="flex flex-col gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 animate-pulse"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-zinc-800 shrink-0" />
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-32 bg-zinc-800 rounded" />
                        <div className="h-3 w-24 bg-zinc-800/60 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-16 bg-zinc-800 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/40">
                <Coins className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                <p className="text-sm font-semibold text-zinc-300">No expenses recorded</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Track fuel, service, spare parts, and accessories in one ledger.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 rounded-xl bg-purple-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-purple-400"
                >
                  Record First Expense
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3 sm:p-4 transition hover:border-zinc-750"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold font-mono"
                        style={{
                          backgroundColor: `${categoryColors[exp.category] || "#71717a"}20`,
                          color: categoryColors[exp.category] || "#71717a",
                        }}
                      >
                        {exp.category.slice(0, 3)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-zinc-200 truncate">{exp.title}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500 mt-0.5 font-mono">
                          <span>{new Date(exp.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                          {exp.odometer && <span>• {exp.odometer.toLocaleString()} km</span>}
                          {exp.notes && <span className="font-sans italic truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs">• {exp.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 font-mono shrink-0">
                      <span className="text-sm font-bold text-zinc-100 tabular-nums">
                        ₹{exp.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-rose-500/10 transition"
                        title="Delete expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <AddExpenseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchExpenses}
        />
      )}
    </div>
  );
}
