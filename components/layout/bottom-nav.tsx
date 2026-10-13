"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Fuel, Wrench, ReceiptText, MoreHorizontal } from "lucide-react";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Fuel",
    href: "/fuel",
    icon: Fuel,
  },
  {
    label: "Service",
    href: "/maintenance",
    icon: Wrench,
  },
  {
    label: "Expenses",
    href: "/expenses",
    icon: ReceiptText,
  },
  {
    label: "More",
    href: "/more",
    icon: MoreHorizontal,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-t border-zinc-800/80 bg-zinc-950/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${
                isActive
                  ? "text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 h-0.5 w-6 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}

              <div
                className={`flex h-7 w-7 items-center justify-center rounded-xl transition ${
                  isActive ? "bg-emerald-500/15" : "bg-transparent"
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 transition-transform ${
                    isActive ? "scale-110" : ""
                  }`}
                />
              </div>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}