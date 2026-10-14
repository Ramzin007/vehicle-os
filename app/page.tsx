"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import VehicleCard from "@/components/dashboard/vehicle-card";
import StatCard from "@/components/dashboard/stat-card";
import QuickActions from "@/components/dashboard/quick-actions";
import { useVehicle } from "@/components/context/vehicle-context";
import {
  calculateFuelMetrics,
  calculateCareScore,
  getDocumentStatus,
  type FuelLogItem,
  type MaintenanceTaskItem,
  type VehicleDocumentItem,
  type ExpenseItem,
} from "@/lib/calculations";
import {
  Fuel,
  Wrench,
  Receipt,
  FileText,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const { activeVehicle, refreshVehicles } = useVehicle();
  const [fuelLogs, setFuelLogs] = useState<FuelLogItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const activeId = localStorage.getItem("vehicleos_active_vehicle_id");
        const cached = activeId
          ? sessionStorage.getItem(`vehicleos_cached_fuel_logs_${activeId}`) || sessionStorage.getItem("vehicleos_cached_fuel_logs")
          : sessionStorage.getItem("vehicleos_cached_fuel_logs");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });

  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTaskItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const activeId = localStorage.getItem("vehicleos_active_vehicle_id");
        const cached = activeId
          ? sessionStorage.getItem(`vehicleos_cached_tasks_${activeId}`) || sessionStorage.getItem("vehicleos_cached_tasks")
          : sessionStorage.getItem("vehicleos_cached_tasks");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });

  const [documents, setDocuments] = useState<VehicleDocumentItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const activeId = localStorage.getItem("vehicleos_active_vehicle_id");
        const cached = activeId
          ? sessionStorage.getItem(`vehicleos_cached_documents_${activeId}`) || sessionStorage.getItem("vehicleos_cached_documents")
          : sessionStorage.getItem("vehicleos_cached_documents");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const activeId = localStorage.getItem("vehicleos_active_vehicle_id");
        const cached = activeId
          ? sessionStorage.getItem(`vehicleos_cached_expenses_${activeId}`) || sessionStorage.getItem("vehicleos_cached_expenses")
          : sessionStorage.getItem("vehicleos_cached_expenses");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });

  const [loading, setLoading] = useState(() => maintenanceTasks.length === 0);

  // Instantly hydrate vehicle-scoped cache when activeVehicle changes
  useEffect(() => {
    if (!activeVehicle) return;
    try {
      const cachedTasks = sessionStorage.getItem(`vehicleos_cached_tasks_${activeVehicle.id}`);
      const cachedFuel = sessionStorage.getItem(`vehicleos_cached_fuel_logs_${activeVehicle.id}`);
      const cachedDocs = sessionStorage.getItem(`vehicleos_cached_documents_${activeVehicle.id}`);
      const cachedExp = sessionStorage.getItem(`vehicleos_cached_expenses_${activeVehicle.id}`);

      if (cachedTasks) setMaintenanceTasks(JSON.parse(cachedTasks));
      if (cachedFuel) setFuelLogs(JSON.parse(cachedFuel));
      if (cachedDocs) setDocuments(JSON.parse(cachedDocs));
      if (cachedExp) setExpenses(JSON.parse(cachedExp));
    } catch {}
  }, [activeVehicle]);

  const loadData = useCallback(async () => {
    if (!activeVehicle) return;

    // Fetch maintenance tasks independently with 0-delay UI update
    fetch(`/api/maintenance?vehicleId=${activeVehicle.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.tasks)) {
          setMaintenanceTasks(data.tasks);
          try {
            sessionStorage.setItem(`vehicleos_cached_tasks_${activeVehicle.id}`, JSON.stringify(data.tasks));
            sessionStorage.setItem("vehicleos_cached_tasks", JSON.stringify(data.tasks));
          } catch {}
        }
      })
      .catch((e) => console.error("Maintenance fetch error:", e))
      .finally(() => setLoading(false));

    // Fetch fuel telemetry in parallel
    fetch(`/api/fuel?vehicleId=${activeVehicle.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.logs)) {
          setFuelLogs(data.logs);
          try {
            sessionStorage.setItem(`vehicleos_cached_fuel_logs_${activeVehicle.id}`, JSON.stringify(data.logs));
            sessionStorage.setItem("vehicleos_cached_fuel_logs", JSON.stringify(data.logs));
          } catch {}
        }
      })
      .catch((e) => console.error("Fuel fetch error:", e));

    // Fetch documents in parallel
    fetch(`/api/documents?vehicleId=${activeVehicle.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.documents)) {
          setDocuments(data.documents);
          try {
            sessionStorage.setItem(`vehicleos_cached_documents_${activeVehicle.id}`, JSON.stringify(data.documents));
            sessionStorage.setItem("vehicleos_cached_documents", JSON.stringify(data.documents));
          } catch {}
        }
      })
      .catch((e) => console.error("Documents fetch error:", e));

    // Fetch expenses in parallel
    fetch(`/api/expenses?vehicleId=${activeVehicle.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.expenses)) {
          setExpenses(data.expenses);
          try {
            sessionStorage.setItem(`vehicleos_cached_expenses_${activeVehicle.id}`, JSON.stringify(data.expenses));
            sessionStorage.setItem("vehicleos_cached_expenses", JSON.stringify(data.expenses));
          } catch {}
        }
      })
      .catch((e) => console.error("Expenses fetch error:", e));
  }, [activeVehicle]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute metrics
  const fuelMetrics = calculateFuelMetrics(fuelLogs);
  const careScoreResult = calculateCareScore(
    activeVehicle?.currentOdometer ?? 0,
    maintenanceTasks,
    documents,
    fuelLogs
  );

  const tankCap = activeVehicle?.tankCapacity || 14.0;
  const avgMileage = fuelMetrics.averageEconomy > 0 ? fuelMetrics.averageEconomy : 38.0;
  const estimatedRange = Math.round(tankCap * avgMileage);

  // Identify alerts: overdue/due soon tasks or documents expiring <= 30 days
  const now = new Date();
  const urgentTasks = maintenanceTasks.filter((t) => {
    if (t.status === "COMPLETED") return false;
    if (t.status === "OVERDUE" || t.status === "DUE_SOON") return true;
    if (t.dueOdometer && activeVehicle && t.dueOdometer - activeVehicle.currentOdometer <= 300) return true;
    if (t.dueDate) {
      const days = Math.ceil((new Date(t.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return days <= 14;
    }
    return false;
  });

  const urgentDocs = documents.filter((d) => {
    const s = getDocumentStatus(d.expiryDate);
    return s.status === "EXPIRED" || s.status === "EXPIRING_SOON";
  });

  const totalUrgent = urgentTasks.length + urgentDocs.length;

  // Next upcoming maintenance task
  const nextTask = maintenanceTasks.find((t) => t.status !== "COMPLETED");
  const nextTaskDueText = nextTask
    ? nextTask.dueOdometer && activeVehicle
      ? `${Math.max(0, Math.round(nextTask.dueOdometer - activeVehicle.currentOdometer))} km`
      : nextTask.dueDate
      ? new Date(nextTask.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : "Scheduled"
    : loading && maintenanceTasks.length === 0
    ? "--"
    : "All Done";

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Command Center Telemetry: 2x2 on Mobile, 4-Cols on Tablet/Desktop */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Fuel Economy"
          value={fuelMetrics.averageEconomy > 0 ? fuelMetrics.averageEconomy : "--"}
          unit="km/L"
          subtext={
            fuelMetrics.bestEconomy > 0
              ? `Best: ${fuelMetrics.bestEconomy} km/L`
              : "Track refills to compute"
          }
          icon={Fuel}
          accentColor="emerald"
          href="/fuel"
        />

        <StatCard
          label="Running Cost"
          value={fuelMetrics.costPerKm > 0 ? `₹${fuelMetrics.costPerKm}` : "--"}
          unit="/km"
          subtext={`Total Spend: ₹${expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}`}
          icon={Receipt}
          accentColor="purple"
          href="/expenses"
        />

        <StatCard
          label="Next Service"
          value={nextTaskDueText}
          unit={nextTask?.dueOdometer ? "left" : ""}
          subtext={nextTask ? nextTask.title : loading && maintenanceTasks.length === 0 ? "Checking schedule..." : "All tasks completed"}
          icon={Wrench}
          accentColor="cyan"
          href="/maintenance"
        />

        <StatCard
          label="Documents"
          value={`${documents.length}`}
          unit="Active"
          subtext={
            urgentDocs.length > 0
              ? `${urgentDocs.length} due soon`
              : "All certificates valid"
          }
          icon={FileText}
          accentColor="amber"
          href="/documents"
        />
      </section>

      {/* 2. Responsive Multi-Column Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column (lg: 7 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Vehicle Hero Card */}
          <VehicleCard
            careScore={careScoreResult.score}
            careRating={careScoreResult.rating}
            careColor={careScoreResult.color}
            estimatedRange={estimatedRange}
          />

          {/* Urgent Alerts Banner (if any) */}
          {totalUrgent > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 backdrop-blur-sm shadow-md">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-300">
                    {totalUrgent} Attention Item{totalUrgent > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-amber-400/80 mt-0.5 line-clamp-1">
                    {urgentTasks[0]?.title || urgentDocs[0]?.title} requires your attention
                  </p>
                </div>
                <Link
                  href={urgentTasks.length > 0 ? "/maintenance" : "/documents"}
                  className="rounded-xl bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition"
                >
                  Inspect
                </Link>
              </div>
            </div>
          )}

          {/* Recent Refuels Feed */}
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <Fuel className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Recent Refuels
                </h3>
              </div>
              <Link
                href="/fuel"
                className="flex items-center text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                All refuels
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
            </div>

            {fuelLogs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center">
                <p className="text-xs text-zinc-500">No refuels logged yet</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-zinc-800/80">
                {fuelLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-sm font-bold text-zinc-100 tabular-nums">
                          {log.odometer.toLocaleString()} km
                        </span>
                        {log.calculatedEconomy && (
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 tabular-nums">
                            {log.calculatedEconomy} km/L
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(log.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        • {log.liters} L {log.stationName ? `• ${log.stationName}` : ""}
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-sm font-bold text-zinc-100 tabular-nums">
                        ₹{log.totalCost.toFixed(0)}
                      </p>
                      <p className="text-[11px] text-zinc-500 tabular-nums">
                        ₹{log.pricePerLiter.toFixed(1)}/L
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Maintenance Schedule */}
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                  <Wrench className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Maintenance Schedule
                </h3>
              </div>
              <Link
                href="/maintenance"
                className="flex items-center text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View all
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
            </div>

            {maintenanceTasks.filter((t) => t.status !== "COMPLETED").length === 0 ? (
              <div className="flex items-center gap-2 rounded-2xl bg-zinc-950/60 p-3.5 text-xs text-zinc-400 border border-zinc-800/60">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>All scheduled service tasks are up to date!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {maintenanceTasks
                  .filter((t) => t.status !== "COMPLETED")
                  .slice(0, 3)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3"
                    >
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">{task.title}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                          {task.dueOdometer
                            ? `Due at ${task.dueOdometer.toLocaleString()} km`
                            : task.dueDate
                            ? `Due by ${new Date(task.dueDate).toLocaleDateString()}`
                            : "Scheduled"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold font-mono ${
                          task.status === "DUE_SOON"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Column (lg: 5 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Quick Actions Card */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
            <QuickActions
              onRefresh={() => {
                loadData();
                refreshVehicles();
              }}
            />
          </div>

          {/* Care Score & Health Breakdown Card */}
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  Care Score & Health
                </h3>
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold border font-mono"
                style={{
                  color: careScoreResult.color,
                  borderColor: `${careScoreResult.color}40`,
                  backgroundColor: `${careScoreResult.color}15`,
                }}
              >
                {careScoreResult.score}/100 • {careScoreResult.rating}
              </span>
            </div>

            {/* Sub-score meters */}
            <div className="mt-4 flex flex-col gap-3 text-xs border-y border-zinc-800/80 py-3.5">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Maintenance Compliance</span>
                  <span className="font-semibold text-zinc-200 font-mono">{careScoreResult.maintenancePoints}/35 pts</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${(careScoreResult.maintenancePoints / 35) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Document Health</span>
                  <span className="font-semibold text-zinc-200 font-mono">{careScoreResult.documentPoints}/30 pts</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(careScoreResult.documentPoints / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Fuel Tracking Regularity</span>
                  <span className="font-semibold text-zinc-200 font-mono">{careScoreResult.refuelPoints}/20 pts</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${(careScoreResult.refuelPoints / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Action Items
              </p>
              {careScoreResult.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}