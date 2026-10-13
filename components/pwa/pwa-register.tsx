"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Register service worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("VehicleOS PWA SW registered:", reg.scope))
        .catch((err) => console.error("SW registration failed:", err));
    }

    // 2. Listen for native install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowBanner(false);
    }
    setInstallPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 rounded-2xl border border-emerald-500/40 bg-zinc-900/98 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 font-bold shrink-0 shadow-md">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-100">Install VehicleOS App</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Add to your phone for instant, full-screen offline access
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="text-zinc-500 hover:text-zinc-300 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setShowBanner(false)}
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-850"
        >
          Not now
        </button>
        <button
          onClick={handleInstallClick}
          className="flex-1 rounded-xl bg-emerald-500 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
        >
          Install Now
        </button>
      </div>
    </div>
  );
}
