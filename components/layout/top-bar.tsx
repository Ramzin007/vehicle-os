"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useVehicle } from "@/components/context/vehicle-context";
import { ChevronDown, Plus, Bike, Car, ShieldCheck, Settings, Check, Fuel, Wrench } from "lucide-react";
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
};

export default function TopBar({ title }: TopBarProps) {
  const pathname = usePathname();
  const { vehicles, activeVehicle, setActiveVehicleId, refreshVehicles } = useVehicle();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const currentTitle = title || pageTitles[pathname] || (activeVehicle ? activeVehicle.name : "VehicleOS");

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 md:px-8 backdrop-blur-md">
        {/* Mobile View: Brand & Title */}
        <div className="flex md:hidden items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-950/40">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                  VehicleOS
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-100">
                {title || (activeVehicle ? activeVehicle.name : "Companion")}
              </h1>
            </div>
          </Link>
        </div>

        {/* Desktop View: Page Title & Breadcrumb */}
        <div className="hidden md:flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-100">
              {currentTitle}
            </h1>
            {activeVehicle && (
              <p className="text-xs text-zinc-400">
                Active: <span className="text-zinc-200 font-medium">{activeVehicle.name}</span> ({activeVehicle.model})
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Responsive Controls */}
        <div className="flex items-center gap-2.5">
          {/* Desktop Quick Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setIsFuelModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition"
            >
              <Fuel className="h-3.5 w-3.5 text-emerald-400" />
              <span>Record Refill</span>
            </button>
            <button
              onClick={() => setIsServiceModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 transition"
            >
              <Wrench className="h-3.5 w-3.5 text-cyan-400" />
              <span>Log Service</span>
            </button>
          </div>

          {/* Mobile Vehicle Selector Pill */}
          {activeVehicle && (
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
              >
                {activeVehicle.type === "MOTORCYCLE" ? (
                  <Bike className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Car className="h-3.5 w-3.5 text-cyan-400" />
                )}
                <span className="max-w-[100px] truncate">{activeVehicle.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {/* Mobile Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-zinc-800 bg-zinc-900/98 p-1.5 shadow-2xl backdrop-blur-xl">
                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Select Vehicle
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
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                              isSelected
                                ? "bg-emerald-500/15 text-emerald-300 font-medium"
                                : "text-zinc-300 hover:bg-zinc-800"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {v.type === "MOTORCYCLE" ? (
                                <Bike className="h-4 w-4 shrink-0 text-emerald-400" />
                              ) : (
                                <Car className="h-4 w-4 shrink-0 text-cyan-400" />
                              )}
                              <div className="truncate">
                                <p className="truncate">{v.name}</p>
                                <p className="text-[10px] text-zinc-500 truncate">{v.model}</p>
                              </div>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
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
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add New Vehicle</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Settings icon */}
          <Link
            href="/more"
            aria-label="Settings and garage"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Settings className="h-4 w-4" />
          </Link>
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