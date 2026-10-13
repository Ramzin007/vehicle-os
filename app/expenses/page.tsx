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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [_loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!activeVehicle) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses?vehicleId=${activeVehicle.id}`);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses || []);
        setSummary(data.summary || null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
              <ReceiptText className="h-5 w-5" />
            </div>
            Expenses & Costs
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {activeVehicle ? `${activeVehicle.name} • ${activeVehicle.model}` : "Cost tracking & categories"}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-purple-500 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-purple-400 shadow-lg shadow-purple-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* 2-Column Responsive Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Analytics Banner & Category Breakdown (lg: 5 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Vehicle Investment
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-100">
                ₹{summary?.totalSpend.toLocaleString() ?? 0}
              </span>
              {summary && summary.costPerKm > 0 && (
                <span className="text-xs text-purple-400 font-bold">
                  (₹{summary.costPerKm}/km)
                </span>
              )}
            </div>

            {/* Visual Category Proportion Bar */}
            {summary && summary.categoryBreakdown.length > 0 && (
              <div className="mt-6 border-t border-zinc-800/80 pt-5">
                <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-zinc-800">
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
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: categoryColors[cat.category] || "#71717a" }}
                      />
                      <span className="text-zinc-300 font-semibold">{cat.category}</span>
                      <span className="text-zinc-500 font-medium">₹{cat.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Monthly Spending Cadence Bar Chart */}
          {summary && summary.monthlyBreakdown.length > 0 && (
            <MonthlySpendChart monthlyData={summary.monthlyBreakdown} />
          )}
        </div>

        {/* Right Column: Filter & Transaction Feed (lg: 7 cols) */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* Category Filter Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {["ALL", "FUEL", "SERVICE", "PARTS", "ACCESSORIES", "WASH", "TOLL", "INSURANCE"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Transactions ({filteredExpenses.length})
              </h2>
              <span className="text-[11px] text-zinc-500">Sorted by date</span>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/40">
                <Coins className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                <p className="text-sm font-semibold text-zinc-300">No expenses recorded</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Track fuel, service, spare parts, and accessories in one ledger.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 rounded-xl bg-purple-500 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-400"
                >
                  Record First Expense
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="group flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 transition hover:border-zinc-700 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                        style={{
                          backgroundColor: `${categoryColors[exp.category] || "#71717a"}20`,
                          color: categoryColors[exp.category] || "#71717a",
                        }}
                      >
                        {exp.category.slice(0, 3)}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-zinc-200">{exp.title}</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                          <span>{new Date(exp.date).toLocaleDateString()}</span>
                          {exp.odometer && <span>• {exp.odometer.toLocaleString()} km</span>}
                          {exp.notes && <span>• {exp.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-100">
                        ₹{exp.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete expense"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
