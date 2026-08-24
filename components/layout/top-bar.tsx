type TopBarProps = {
  title: string;
};

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          VehicleOS
        </p>

        <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
          {title}
        </h1>
      </div>

      <button
        type="button"
        aria-label="Open settings"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800"
      >
        ⚙
      </button>
    </header>
  );
}