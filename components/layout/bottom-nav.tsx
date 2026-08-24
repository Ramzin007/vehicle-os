"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: "⌂",
  },
  {
    label: "Fuel",
    href: "/fuel",
    icon: "⛽",
  },
  {
    label: "Service",
    href: "/maintenance",
    icon: "🔧",
  },
  {
    label: "More",
    href: "/more",
    icon: "•••",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-t border-zinc-800 bg-zinc-950/95 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="grid h-16 grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-xs transition ${
                isActive
                  ? "text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span
                className={`text-lg leading-none ${
                  isActive ? "opacity-100" : "opacity-70"
                }`}
              >
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}