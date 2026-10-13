"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";

interface MonthlySpendChartProps {
  monthlyData: { month: string; amount: number }[];
}

export default function MonthlySpendChart({ monthlyData }: MonthlySpendChartProps) {
  const data = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [];
    // Format month labels from YYYY-MM to MMM
    return monthlyData.map((d) => {
      const [year, month] = d.month.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const label = date.toLocaleDateString(undefined, { month: "short" });
      return {
        ...d,
        label,
      };
    });
  }, [monthlyData]);

  if (data.length === 0) return null;

  const maxAmount = Math.max(...data.map((d) => d.amount), 1000);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-200">Monthly Spending Cadence</h3>
            <p className="text-[10px] text-zinc-500">Expenses breakdown per calendar month</p>
          </div>
        </div>

        <span className="text-xs font-bold text-zinc-300">
          Peak: ₹{maxAmount.toLocaleString()}
        </span>
      </div>

      {/* SVG Bar Chart */}
      <div className="flex items-end justify-between gap-3 h-28 pt-4 px-2 border-b border-zinc-800/80">
        {data.map((d) => {
          const heightPct = Math.round((d.amount / maxAmount) * 100);
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              {/* Tooltip amount on hover */}
              <span className="text-[9px] font-bold text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ₹{d.amount > 999 ? `${(d.amount / 1000).toFixed(1)}k` : d.amount}
              </span>

              <div className="w-full max-w-[28px] bg-zinc-950 rounded-t-lg overflow-hidden flex items-end h-full">
                <div
                  style={{ height: `${Math.max(12, heightPct)}%` }}
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500 group-hover:from-purple-500 group-hover:to-purple-300 shadow-md shadow-purple-500/20"
                />
              </div>

              <span className="text-[10px] text-zinc-400 font-semibold mt-1">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
