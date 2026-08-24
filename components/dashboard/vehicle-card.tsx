type VehicleCardProps = {
  name: string;
  model: string;
};

export default function VehicleCard({
  name,
  model,
}: VehicleCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Your vehicle
      </p>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {name}
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            {model}
          </p>
        </div>

        <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          Active
        </div>
      </div>
    </section>
  );
}