"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, Loader2, Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to sign in");
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load demo account");
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load demo session");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-xl shadow-emerald-950/60 mb-3">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            Sign In to VehicleOS
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Access your vehicles, fuel telemetry, and maintenance records
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* 1-Click Demo Login Button (Portfolio Highlight) */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={demoLoading || loading}
          className="w-full flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-left transition hover:bg-emerald-500/15 group mb-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300">
                1-Click Demo Rider Login
              </p>
              <p className="text-[11px] text-emerald-400/80">
                Instant access with pre-seeded TVS Ronin 225
              </p>
            </div>
          </div>
          {demoLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          ) : (
            <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-zinc-900 px-3 text-[10px] uppercase font-bold tracking-wider text-zinc-500 absolute">
            Or sign in with email
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-400">Email Address</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                placeholder="rider@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400">Password</label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-zinc-400">
          New to VehicleOS?{" "}
          <Link href="/register" className="font-semibold text-emerald-400 hover:text-emerald-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
