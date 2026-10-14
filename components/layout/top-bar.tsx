"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useVehicle } from "@/components/context/vehicle-context";
import {
  ChevronDown,
  Plus,
  Bike,
  Car,
  Settings,
  Check,
  Fuel,
  Wrench,
  User,
  LogOut,
} from "lucide-react";
import VehicleOsLogo from "@/components/ui/vehicle-os-logo";
import AddVehicleModal from "@/components/modals/add-vehicle-modal";
import AddRefuelModal from "@/components/modals/add-refuel-modal";
import AddServiceModal from "@/components/modals/add-service-modal";

interface TopBarProps {
  title?: string;
}

const pageTitles: Record<string, string> = {
  "/": "Dashboard Overview",
  "/fuel": "Fuel & Refills",
  "/maintenance": "Service & Maintenance",
  "/documents": "Vehicle Documents",
  "/expenses": "Expense Management",
  "/stations": "Nearby Fuel Stations",
  "/more": "Garage & Settings",
  "/login": "Sign In",
  "/register": "Create Account",
};

export default function TopBar({ title }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { vehicles, activeVehicle, setActiveVehicleId, refreshVehicles } = useVehicle();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUserMenuOpen(false);
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const currentTitle = title || pageTitles[pathname] || (activeVehicle ? activeVehicle.name : "VehicleOS");

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 md:px-8 backdrop-blur-md">
        {/* Mobile View: Brand & Title */}
        <div className="flex md:hidden items-center gap-2.5 min-w-0 flex-1 mr-2">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <VehicleOsLogo className="h-9 w-9 shrink-0 shadow-lg shadow-emerald-500/20" withContainer={true} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  VehicleOS
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h1 className="text-sm font-semibold tracking-tight text-zinc-100 truncate">
                {currentTitle}
              </h1>
            </div>
          </Link>
        </div>

        {/* Desktop View: Page Title & Breadcrumb */}
        <div className="hidden md:flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-100">
              {currentTitle}
            </h1>
            {activeVehicle && (
              <p className="text-xs text-zinc-400">
                Active: <span className="text-zinc-200 font-medium">{activeVehicle.model || activeVehicle.name}</span> <span className="text-zinc-500 font-mono">({activeVehicle.make || activeVehicle.name})</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Responsive Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop Quick Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setIsFuelModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              <Fuel className="h-3.5 w-3.5" />
              <span>Record Refill</span>
            </button>
            <button
              onClick={() => setIsServiceModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition"
            >
              <Wrench className="h-3.5 w-3.5" />
              <span>Log Service</span>
            </button>
          </div>

          {/* Mobile Vehicle Selector Pill */}
          {activeVehicle && (
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-850"
              >
                {activeVehicle.type === "MOTORCYCLE" ? (
                  <Bike className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Car className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                )}
                <span className="max-w-[75px] xs:max-w-[100px] truncate">{activeVehicle.model || activeVehicle.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              </button>

              {/* Mobile Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      Select Vehicle
                    </p>
                    <div className="flex flex-col gap-1">
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
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                              isSelected
                                ? "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30"
                                : "text-zinc-300 hover:bg-zinc-800"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              {v.type === "MOTORCYCLE" ? (
                                <Bike className="h-4 w-4 shrink-0 text-emerald-400" />
                              ) : (
                                <Car className="h-4 w-4 shrink-0 text-cyan-400" />
                              )}
                              <div className="truncate">
                                <p className="font-semibold truncate">{v.model || v.name}</p>
                                <p className="text-[11px] text-zinc-500 truncate">{v.make || v.name}</p>
                              </div>
                            </div>
                            {isSelected && <Check className="h-4 w-4 shrink-0 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="my-1.5 border-t border-zinc-800" />

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        setIsAddVehicleOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add New Vehicle</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User Account / Profile Menu Pill */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label="User account"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-850"
            >
              {currentUser ? (
                <span className="text-xs font-bold text-emerald-400">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-4 w-4 text-zinc-400" />
              )}
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl">
                  {currentUser ? (
                    <div>
                      <div className="px-3 py-2 border-b border-zinc-800">
                        <p className="text-sm font-semibold text-zinc-100 truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {currentUser.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/more"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition"
                        >
                          <Settings className="h-4 w-4 text-zinc-400" />
                          <span>Garage & Settings</span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-1">
                      <Link
                        href="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition"
                      >
                        <User className="h-4 w-4" />
                        <span>Sign In</span>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
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