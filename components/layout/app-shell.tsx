"use client";

import type { ReactNode } from "react";
import TopBar from "./top-bar";
import BottomNav from "./bottom-nav";
import { VehicleProvider } from "@/components/context/vehicle-context";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <VehicleProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500 selection:text-zinc-950">
        <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col border-x border-zinc-900/60 shadow-2xl">
          <TopBar />

          <main className="flex-1 pb-20">{children}</main>

          <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2">
            <BottomNav />
          </div>
        </div>
      </div>
    </VehicleProvider>
  );
}