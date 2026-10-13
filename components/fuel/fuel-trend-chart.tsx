"use client";

import { useMemo } from "react";
import type { FuelLogItem } from "@/lib/calculations";
import { TrendingUp, BarChart2 } from "lucide-react";

interface FuelTrendChartProps {
  logs: FuelLogItem[];
  averageEconomy: number;
}

export default function FuelTrendChart({ logs, averageEconomy }: FuelTrendChartProps) {
  // Extract entries that have a calculatedEconomy
  const validPoints = useMemo(() => {
    return logs
      .filter((l) => typeof l.calculatedEconomy === "number" && l.calculatedEconomy > 0)
      .map((l) => ({
        id: l.id,
        odometer: l.odometer,
        economy: l.calculatedEconomy as number,
        date: new Date(l.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      }));
  }, [logs]);

  if (validPoints.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5 text-center text-xs text-zinc-500">
        <BarChart2 className="mx-auto h-6 w-6 text-zinc-600 mb-2" />
        Log at least 2 full tanks to plot your mileage curve and fuel efficiency trend.
      </div>
    );
  }

  const economies = validPoints.map((p) => p.economy);
  const minEco = Math.floor(Math.min(...economies, averageEconomy || 30) - 2);
  const maxEco = Math.ceil(Math.max(...economies, averageEconomy || 40) + 2);
  const range = maxEco - minEco || 1;

  // Chart dimensions
  const height = 140;
  const width = 360;
  const paddingX = 24;
  const paddingY = 20;

  // Generate SVG coordinates
  const coords = validPoints.map((p, idx) => {
    const x =
      validPoints.length === 1
        ? width / 2
        : paddingX + (idx / (validPoints.length - 1)) * (width - 2 * paddingX);
    const y =
      height - paddingY - ((p.economy - minEco) / range) * (height - 2 * paddingY);
    return { ...p, x, y };
  });

  // Average line Y
  const avgY =
    height - paddingY - ((averageEconomy - minEco) / range) * (height - 2 * paddingY);

  // SVG path line
  const pathD = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  // Gradient area
  const areaD =
    coords.length > 0
      ? `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${
          height - paddingY
        } Z`
      : "";

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-200">Fuel Economy Trend</h3>
            <p className="text-[10px] text-zinc-500">Mileage curve across full refuels (km/L)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Actual
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="h-0.5 w-3 bg-zinc-500 border-dashed" />
            Avg ({averageEconomy})
          </span>
        </div>
      </div>

      {/* SVG Responsive Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 overflow-visible"
        >
          <defs>
            <linearGradient id="mileageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Average reference line */}
          {averageEconomy > 0 && avgY >= paddingY && avgY <= height - paddingY && (
            <line
              x1={paddingX}
              y1={avgY}
              x2={width - paddingX}
              y2={avgY}
              stroke="#52525b"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          )}

          {/* Area under curve */}
          {areaD && <path d={areaD} fill="url(#mileageGradient)" />}

          {/* Line curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {coords.map((pt, i) => (
            <g key={pt.id || i} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                className="fill-emerald-400 stroke-zinc-950 stroke-2 transition group-hover:r-6"
              />
              {/* Tooltip value */}
              <text
                x={pt.x}
                y={pt.y - 8}
                textAnchor="middle"
                className="fill-zinc-200 text-[10px] font-bold pointer-events-none"
              >
                {pt.economy}
              </text>
            </g>
          ))}
        </svg>

        {/* Date labels beneath the chart */}
        <div className="flex justify-between px-3 text-[10px] text-zinc-500 font-mono mt-1">
          {coords.map((pt, i) => (
            <span key={i} className="truncate max-w-[60px] text-center">
              {pt.date}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
