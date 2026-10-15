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
  logout: () => Promise<void>;
  isLoading: boolean;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("vehicleos_cached_vehicles");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });
  const [activeVehicleId, setActiveVehicleIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("vehicleos_active_vehicle_id");
      } catch {}
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const clearLocalData = useCallback(() => {
    setVehicles([]);
    setActiveVehicleIdState(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("vehicleos_cached_vehicles");
        localStorage.removeItem("vehicleos_active_vehicle_id");
        sessionStorage.clear();
      } catch {}
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      clearLocalData();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, [clearLocalData]);

  const refreshVehicles = useCallback(async () => {
    try {
      const res = await fetch("/api/vehicles");
      if (res.status === 401) {
        clearLocalData();
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.vehicles)) {
        setVehicles(data.vehicles);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("vehicleos_cached_vehicles", JSON.stringify(data.vehicles));
          } catch {}
        }
        if (data.vehicles.length > 0) {
          // If no active vehicle is set, default to the marked default or first
          setActiveVehicleIdState((prev) => {
            if (prev && data.vehicles.some((v: Vehicle) => v.id === prev)) {
              return prev;
            }
            const def = data.vehicles.find((v: Vehicle) => v.isDefault);
            const chosenId = def ? def.id : data.vehicles[0].id;
            if (typeof window !== "undefined") {
              localStorage.setItem("vehicleos_active_vehicle_id", chosenId);
            }
            return chosenId;
          });
        } else {
          setActiveVehicleIdState(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("vehicleos_active_vehicle_id");
          }
        }
      } else {
        clearLocalData();
      }
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    } finally {
      setIsLoading(false);
    }
  }, [clearLocalData]);

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
        logout,
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
