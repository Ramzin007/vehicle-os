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
  const [fuelLogs, setFuelLogs] = useState<FuelLogItem[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTaskItem[]>([]);
  const [documents, setDocuments] = useState<VehicleDocumentItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [_loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!activeVehicle) return;
    setLoading(true);
    try {
      const [fuelRes, maintRes, docRes, expRes] = await Promise.all([
        fetch(`/api/fuel?vehicleId=${activeVehicle.id}`),
        fetch(`/api/maintenance?vehicleId=${activeVehicle.id}`),
        fetch(`/api/documents?vehicleId=${activeVehicle.id}`),
        fetch(`/api/expenses?vehicleId=${activeVehicle.id}`),
      ]);

      const [fuelData, maintData, docData, expData] = await Promise.all([
        fuelRes.json(),
        maintRes.json(),
        docRes.json(),
        expRes.json(),
      ]);

      if (fuelData.success) setFuelLogs(fuelData.logs || []);
      if (maintData.success) setMaintenanceTasks(maintData.tasks || []);
      if (docData.success) setDocuments(docData.documents || []);
      if (expData.success) setExpenses(expData.expenses || []);
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
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
    : "All Done";

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5">
      {/* 1. Vehicle Hero Card with Care Score Gauge */}
      <VehicleCard
        careScore={careScoreResult.score}
        careRating={careScoreResult.rating}
        careColor={careScoreResult.color}
        estimatedRange={estimatedRange}
      />

      {/* 2. Urgent Alerts Banner (if any) */}
      {totalUrgent > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-300">
                {totalUrgent} Attention Item{totalUrgent > 1 ? "s" : ""}
              </p>
              <p className="text-[11px] text-amber-400/80 mt-0.5 line-clamp-1">
                {urgentTasks[0]?.title || urgentDocs[0]?.title} requires attention
              </p>
            </div>
            <Link
              href={urgentTasks.length > 0 ? "/maintenance" : "/documents"}
              className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/30"
            >
              View
            </Link>
          </div>
        </div>
      )}

      {/* 3. 2x2 Telemetry Stat Cards */}
      <section className="grid grid-cols-2 gap-3">
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
        />

        <StatCard
          label="Running Cost"
          value={fuelMetrics.costPerKm > 0 ? `₹${fuelMetrics.costPerKm}` : "--"}
          unit="/km"
          subtext={`Total Spend: ₹${expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}`}
          icon={Receipt}
          accentColor="purple"
        />

        <StatCard
          label="Next Service"
          value={nextTaskDueText}
          unit={nextTask?.dueOdometer ? "left" : ""}
          subtext={nextTask ? nextTask.title : "All tasks completed"}
          icon={Wrench}
          accentColor="cyan"
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
        />
      </section>

      {/* 4. Quick Actions */}
      <QuickActions
        onRefresh={() => {
          loadData();
          refreshVehicles();
        }}
      />

      {/* 5. Care Recommendations & Insights */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Care Recommendations
            </h3>
          </div>
          <span className="text-[10px] font-medium text-zinc-500">
            Score: {careScoreResult.score}/100
          </span>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {careScoreResult.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Recent Refuels Snapshot */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Recent Refuels
            </h3>
          </div>
          <Link
            href="/fuel"
            className="flex items-center text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            All logs
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </div>

        {fuelLogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center">
            <p className="text-xs text-zinc-500">No refuel logs yet</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-800/80">
            {fuelLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-200">
                      {log.odometer.toLocaleString()} km
                    </span>
                    {log.calculatedEconomy && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        {log.calculatedEconomy} km/L
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {new Date(log.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    • {log.liters} L {log.stationName ? `• ${log.stationName}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-200">
                    ₹{log.totalCost.toFixed(0)}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    ₹{log.pricePerLiter.toFixed(1)}/L
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. Upcoming Service Snapshot */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-cyan-400" />
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
          <div className="flex items-center gap-2 rounded-xl bg-zinc-950/60 p-3 text-xs text-zinc-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>All scheduled services are up to date!</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {maintenanceTasks
              .filter((t) => t.status !== "COMPLETED")
              .slice(0, 3)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3"
                >
                  <div>
                    <p className="text-xs font-medium text-zinc-200">{task.title}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {task.dueOdometer
                        ? `Due at ${task.dueOdometer.toLocaleString()} km`
                        : task.dueDate
                        ? `Due by ${new Date(task.dueDate).toLocaleDateString()}`
                        : "Scheduled"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      task.status === "DUE_SOON"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
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
  );
}