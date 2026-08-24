import Link from "next/link";

const actions = [
  {
    label: "Add fuel",
    description: "Record a refuel",
    href: "/fuel",
    icon: "⛽",
  },
  {
    label: "Maintenance",
    description: "View service tasks",
    href: "/maintenance",
    icon: "🔧",
  },
  {
    label: "Documents",
    description: "Store vehicle documents",
    href: "/documents",
    icon: "📄",
  },
];

export default function QuickActions() {
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-zinc-400">
        Quick actions
      </h2>

      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700 hover:bg-zinc-800"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-xl">
              {action.icon}
            </div>

            <div>
              <p className="font-medium text-zinc-100">
                {action.label}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}