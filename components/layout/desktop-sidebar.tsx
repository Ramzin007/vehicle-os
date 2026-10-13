"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useVehicle } from "@/components/context/vehicle-context";
import {
  Home,
  Fuel,
  Wrench,
  FileText,
  ReceiptText,
  MapPin,
  Settings,
  ShieldCheck,
  Bike,
  Car,
  ChevronDown,
  Plus,
  Check,
  Gauge,
  LogOut,
  User,
} from "lucide-react";
import AddVehicleModal from "@/components/modals/add-vehicle-modal";
import AddRefuelModal from "@/components/modals/add-refuel-modal";
import AddServiceModal from "@/components/modals/add-service-modal";

const navItems = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Fuel & Refills", href: "/fuel", icon: Fuel },
  { label: "Service & Care", href: "/maintenance", icon: Wrench },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Expenses", href: "/expenses", icon: ReceiptText },
  { label: "Nearby Fuel", href: "/stations", icon: MapPin },
  { label: "Garage & Settings", href: "/more", icon: Settings },
];

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { vehicles, activeVehicle, setActiveVehicleId, refreshVehicles } = useVehicle();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <aside className="hidden md:flex w-64 lg:w-72 flex-col justify-between border-r border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl shrink-0 sticky top-0 h-screen p-4 overflow-y-auto">
        <div className="flex flex-col gap-5">
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-3 px-2 py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  VehicleOS
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-zinc-400">Vehicle Companion</p>
            </div>
          </Link>

          {/* Active Vehicle Switcher Card */}
          {activeVehicle && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 text-left transition hover:border-zinc-700 hover:bg-zinc-850"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-zinc-200 shrink-0">
                    {activeVehicle.type === "MOTORCYCLE" ? (
                      <Bike className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Car className="h-4 w-4 text-cyan-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-zinc-100 truncate">
                      {activeVehicle.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">
                      {activeVehicle.model}
                    </p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0 ml-1" />
              </button>

              {/* Vehicle Dropdown */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-900/98 p-1.5 shadow-2xl backdrop-blur-xl">
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Switch Vehicle
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {vehicles.map((v) => {
                        const isSelected = v.id === activeVehicle.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setActiveVehicleId(v.id);
                              setDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${
                              isSelected
                                ? "bg-emerald-500/15 text-emerald-300 font-semibold"
                                : "text-zinc-300 hover:bg-zinc-800"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {v.type === "MOTORCYCLE" ? (
                                <Bike className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <Car className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                              )}
                              <span className="truncate">{v.name}</span>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="my-1 border-t border-zinc-800/80" />

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        setIsAddVehicleOpen(true);
                      }}
                      className="flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Vehicle</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-transform ${
                      isActive ? "text-emerald-400 scale-105" : "text-zinc-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & User Profile */}
        <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800/80">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsFuelModalOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition"
            >
              <Fuel className="h-3.5 w-3.5 text-emerald-400" />
              <span>+ Refill</span>
            </button>
            <button
              onClick={() => setIsServiceModalOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 transition"
            >
              <Wrench className="h-3.5 w-3.5 text-cyan-400" />
              <span>+ Service</span>
            </button>
          </div>

          {activeVehicle && (
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2.5 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Gauge className="h-3.5 w-3.5 text-zinc-500" />
                <span>Odometer</span>
              </div>
              <span className="font-bold text-zinc-200">
                {activeVehicle.currentOdometer.toLocaleString()} km
              </span>
            </div>
          )}

          {/* User Account / Sign Out */}
          {currentUser ? (
            <div className="flex items-center justify-between rounded-xl bg-zinc-900/80 p-2 border border-zinc-800/80 text-xs">
              <div className="flex items-center gap-2 truncate">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 font-bold text-[11px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="font-semibold text-zinc-200 truncate text-[11px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
            >
              <User className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sign In / Demo</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Modals triggered from desktop sidebar */}
      {isAddVehicleOpen && (
        <AddVehicleModal
          isOpen={isAddVehicleOpen}
          onClose={() => setIsAddVehicleOpen(false)}
        />
      )}
      {isFuelModalOpen && (
        <AddRefuelModal
          isOpen={isFuelModalOpen}
          onClose={() => setIsFuelModalOpen(false)}
          onSuccess={() => {
            refreshVehicles();
            window.location.reload();
          }}
        />
      )}
      {isServiceModalOpen && (
        <AddServiceModal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onSuccess={() => {
            refreshVehicles();
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
