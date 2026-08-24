import type { ReactNode } from "react";
import TopBar from "./top-bar";
import BottomNav from "./bottom-nav";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <TopBar title="Dashboard" />

        <main className="flex-1 pb-16">
          {children}
        </main>

        <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}