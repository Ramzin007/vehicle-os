"use client";

import { useState } from "react";
import Link from "next/link";
import { useVehicle } from "@/components/context/vehicle-context";
import { ChevronDown, Plus, Bike, Car, ShieldCheck, Settings, Check } from "lucide-react";
import AddVehicleModal from "@/components/modals/add-vehicle-modal";

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { vehicles, activeVehicle, setActiveVehicleId } = useVehicle();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 backdrop-blur-md">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-2.5">
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

        {/* Right: Vehicle Selector Pill & Settings */}
        <div className="flex items-center gap-2">
          {activeVehicle && (
            <div className="relative">
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
                <span className="max-w-[110px] truncate">{activeVehicle.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {/* Dropdown Menu */}
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

          <Link
            href="/more"
            aria-label="Settings and more"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {isAddVehicleOpen && (
        <AddVehicleModal
          isOpen={isAddVehicleOpen}
          onClose={() => setIsAddVehicleOpen(false)}
        />
      )}
    </>
  );
}