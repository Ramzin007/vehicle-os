import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: LucideIcon;
  accentColor?: "emerald" | "cyan" | "amber" | "purple" | "zinc";
}

const colorStyles = {
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  zinc: "text-zinc-400 bg-zinc-800/60 border-zinc-700/40",
};

export default function StatCard({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  accentColor = "zinc",
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/90 p-4 backdrop-blur transition hover:border-zinc-700/80">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-400">{label}</p>
        {Icon && (
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${colorStyles[accentColor]}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-zinc-100">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-zinc-500">
            {unit}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-[11px] text-zinc-500 truncate">
          {subtext}
        </p>
      )}
    </div>
  );
}