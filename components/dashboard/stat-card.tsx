type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
};

export default function StatCard({
  label,
  value,
  unit,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm text-zinc-400">{label}</p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight">
          {value}
        </span>

        {unit && (
          <span className="text-sm text-zinc-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}