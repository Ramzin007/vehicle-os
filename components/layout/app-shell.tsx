"use client";

import type { ReactNode } from "react";
import TopBar from "./top-bar";
import BottomNav from "./bottom-nav";
import DesktopSidebar from "./desktop-sidebar";
import { VehicleProvider } from "@/components/context/vehicle-context";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <VehicleProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500 selection:text-zinc-950">
        <div className="mx-auto flex min-h-screen w-full flex-col md:flex-row">
          {/* Left Desktop Sidebar (md:flex, hidden on mobile) */}
          <DesktopSidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />

            <main className="flex-1 pb-20 md:pb-8 w-full max-w-7xl mx-auto">
              {children}
            </main>
          </div>

          {/* Mobile Bottom Navigation (md:hidden, fixed on mobile screens) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    </VehicleProvider>
  );
}