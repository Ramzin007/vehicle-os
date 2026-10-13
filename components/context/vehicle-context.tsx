"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  type: string;
  make: string;
  year?: number | null;
  registrationNumber?: string | null;
  vin?: string | null;
  color?: string | null;
  fuelType: string;
  tankCapacity?: number | null;
  currentOdometer: number;
  isDefault: boolean;
  createdAt: string;
  _count?: {
    fuelLogs: number;
    maintenanceTasks: number;
    documents: number;
    expenses: number;
  };
}

interface VehicleContextType {
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  setActiveVehicleId: (id: string) => void;
  refreshVehicles: () => Promise<void>;
  isLoading: boolean;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshVehicles = useCallback(async () => {
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      if (data.success && Array.isArray(data.vehicles)) {
        setVehicles(data.vehicles);
        if (data.vehicles.length > 0) {
          // If no active vehicle is set, default to the marked default or first
          setActiveVehicleIdState((prev) => {
            if (prev && data.vehicles.some((v: Vehicle) => v.id === prev)) {
              return prev;
            }
            const def = data.vehicles.find((v: Vehicle) => v.isDefault);
            return def ? def.id : data.vehicles[0].id;
          });
        }
      }
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshVehicles();
  }, [refreshVehicles]);

  const activeVehicle =
    vehicles.find((v) => v.id === activeVehicleId) ||
    vehicles.find((v) => v.isDefault) ||
    vehicles[0] ||
    null;

  const setActiveVehicleId = (id: string) => {
    setActiveVehicleIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("vehicleos_active_vehicle_id", id);
    }
  };

  // Restore saved vehicle on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vehicleos_active_vehicle_id");
      if (saved) {
        setActiveVehicleIdState(saved);
      }
    }
  }, []);

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        activeVehicle,
        setActiveVehicleId,
        refreshVehicles,
        isLoading,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const ctx = useContext(VehicleContext);
  if (!ctx) {
    throw new Error("useVehicle must be used within a VehicleProvider");
  }
  return ctx;
}
