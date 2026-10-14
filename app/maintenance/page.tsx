"use client";

import { useEffect, useState, useCallback } from "react";
import { useVehicle } from "@/components/context/vehicle-context";
import AddServiceModal from "@/components/modals/add-service-modal";
import {
  Wrench,
  Plus,
  CheckCircle2,
  Calendar,
  Gauge,
  Trash2,
  Edit2,
  Check,
  RotateCw,
  Coins,
  MapPin,
} from "lucide-react";

interface MaintenanceTask {
  id: string;
  vehicleId: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  dueOdometer?: number | null;
  dueDate?: string | null;
  intervalKm?: number | null;
  intervalMonths?: number | null;
  lastCompletedOdometer?: number | null;
  lastCompletedDate?: string | null;
  cost?: number | null;
  serviceCenter?: string | null;
  notes?: string | null;
}

export default function MaintenancePage() {
  const { activeVehicle, refreshVehicles } = useVehicle();
  const [tasks, setTasks] = useState<MaintenanceTask[]>(() => {
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
  const [serviceExpenseTotal, setServiceExpenseTotal] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const activeId = localStorage.getItem("vehicleos_active_vehicle_id");
        const cached = activeId
          ? sessionStorage.getItem(`vehicleos_cached_service_spend_${activeId}`) || sessionStorage.getItem("vehicleos_cached_service_spend")
          : sessionStorage.getItem("vehicleos_cached_service_spend");
        if (cached !== null) return Number(cached);
      } catch {}
    }
    return 0;
  });
  const [loading, setLoading] = useState(() => tasks.length === 0);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED" | "ALL">("ACTIVE");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [completionOdo, setCompletionOdo] = useState("");
  const [completionCost, setCompletionCost] = useState("");
  const [completionDate, setCompletionDate] = useState(() => new Date().toISOString().split("T")[0]);

  // When activeVehicle changes, instantly load its cached tasks and spend
  useEffect(() => {
    if (!activeVehicle) return;
    try {
      const cachedTasks = sessionStorage.getItem(`vehicleos_cached_tasks_${activeVehicle.id}`);
      const cachedSpend = sessionStorage.getItem(`vehicleos_cached_service_spend_${activeVehicle.id}`);
      if (cachedTasks) setTasks(JSON.parse(cachedTasks));
      if (cachedSpend !== null) setServiceExpenseTotal(Number(cachedSpend));
    } catch {}
  }, [activeVehicle]);

  const fetchTasks = useCallback(async () => {
    if (!activeVehicle) return;

    // Single unified API fetch for tasks and service spend aggregate
    fetch(`/api/maintenance?vehicleId=${activeVehicle.id}`)
      .then((res) => res.json())
      .then((maintData) => {
        if (maintData.success) {
          if (Array.isArray(maintData.tasks)) {
            setTasks(maintData.tasks);
          }
          if (typeof maintData.totalServiceSpend === "number") {
            setServiceExpenseTotal(maintData.totalServiceSpend);
          }
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(`vehicleos_cached_tasks_${activeVehicle.id}`, JSON.stringify(maintData.tasks || []));
              sessionStorage.setItem("vehicleos_cached_tasks", JSON.stringify(maintData.tasks || []));
              if (typeof maintData.totalServiceSpend === "number") {
                sessionStorage.setItem(`vehicleos_cached_service_spend_${activeVehicle.id}`, String(maintData.totalServiceSpend));
                sessionStorage.setItem("vehicleos_cached_service_spend", String(maintData.totalServiceSpend));
              }
            } catch {}
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [activeVehicle]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleMarkComplete = async (taskId: string) => {
    if (!activeVehicle) return;
    try {
      const odo = completionOdo ? Number(completionOdo) : activeVehicle.currentOdometer;
      const cost = completionCost ? Number(completionCost) : undefined;

      const res = await fetch("/api/maintenance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          status: "COMPLETED",
          lastCompletedOdometer: odo,
          lastCompletedDate: completionDate ? new Date(completionDate).toISOString() : new Date().toISOString(),
          cost,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCompletingTaskId(null);
        setCompletionOdo("");
        setCompletionCost("");
        setCompletionDate(new Date().toISOString().split("T")[0]);
        await fetchTasks();
        await refreshVehicles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this maintenance task?")) return;
    try {
      const res = await fetch(`/api/maintenance?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentOdometer = activeVehicle?.currentOdometer ?? 0;
  const now = new Date();

  // Summary counts
  const pendingCount = tasks.filter((t) => t.status !== "COMPLETED").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === "ACTIVE") return t.status !== "COMPLETED";
    if (activeTab === "COMPLETED") return t.status === "COMPLETED";
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header & Schedule CTA */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5 sm:gap-3 truncate">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="truncate">Service & Health</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 truncate">
            {activeVehicle ? `${activeVehicle.name} • ${activeVehicle.model}` : "Maintenance tracker"}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl bg-cyan-500 px-3 sm:px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
        >
          <Plus className="h-4 w-4" />
          <span><span className="hidden xs:inline">Schedule </span>Service</span>
        </button>
      </div>

      {/* Maintenance Health Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4">
          <p className="text-[10px] sm:text-[11px] uppercase font-semibold text-zinc-400 tracking-wider truncate">Upcoming</p>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-cyan-400 tabular-nums">{pendingCount}</span>
            <span className="text-xs text-zinc-500">tasks</span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4">
          <p className="text-[10px] sm:text-[11px] uppercase font-semibold text-zinc-400 tracking-wider truncate">History</p>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">{completedCount}</span>
            <span className="text-xs text-zinc-500">done</span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4">
          <p className="text-[10px] sm:text-[11px] uppercase font-semibold text-zinc-400 tracking-wider truncate">Care Spend</p>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-100 tabular-nums">
              ₹{serviceExpenseTotal.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4">
          <p className="text-[10px] sm:text-[11px] uppercase font-semibold text-zinc-400 tracking-wider truncate">Odometer</p>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-100 tabular-nums">{currentOdometer.toLocaleString()}</span>
            <span className="text-xs text-zinc-500">km</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-1 sm:p-1.5 text-center">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`rounded-xl py-2 px-1 text-xs font-semibold transition truncate ${
            activeTab === "ACTIVE"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Upcoming ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`rounded-xl py-2 px-1 text-xs font-semibold transition truncate ${
            activeTab === "COMPLETED"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => setActiveTab("ALL")}
          className={`rounded-xl py-2 px-1 text-xs font-semibold transition truncate ${
            activeTab === "ALL"
              ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          All ({tasks.length})
        </button>
      </div>

      {/* Tasks List */}
      <section className="flex flex-col gap-3">
        {loading && tasks.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-zinc-800/60 bg-zinc-900/40 p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-36 rounded-lg bg-zinc-800" />
                  <div className="h-5 w-16 rounded-full bg-zinc-800" />
                </div>
                <div className="h-3 w-48 rounded bg-zinc-800/80 mt-1" />
                <div className="flex items-center gap-3 pt-3">
                  <div className="h-3 w-28 rounded bg-zinc-800/60" />
                  <div className="h-3 w-20 rounded bg-zinc-800/60" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/40">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
            <p className="text-sm font-semibold text-zinc-200">
              {activeTab === "ACTIVE"
                ? "No pending service tasks!"
                : "No tasks found in this view"}
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              Schedule oil changes, tire rotations, or brake inspections to keep your vehicle running smoothly.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-cyan-400"
            >
              Schedule Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === "COMPLETED";

            // Km countdown
            let kmRemaining: number | null = null;
            if (task.dueOdometer) {
              kmRemaining = Math.round(task.dueOdometer - currentOdometer);
            }

            // Days countdown
            let daysRemaining: number | null = null;
            if (task.dueDate) {
              daysRemaining = Math.ceil(
                (new Date(task.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
            }

            const isOverdue =
              !isCompleted &&
              ((kmRemaining !== null && kmRemaining < 0) ||
                (daysRemaining !== null && daysRemaining < 0) ||
                task.status === "OVERDUE");

            const isDueSoon =
              !isCompleted &&
              !isOverdue &&
              ((kmRemaining !== null && kmRemaining <= 300) ||
                (daysRemaining !== null && daysRemaining <= 14) ||
                task.status === "DUE_SOON");

            return (
              <div
                key={task.id}
                className={`group rounded-3xl border p-4 sm:p-5 transition flex flex-col justify-between h-full ${
                  isOverdue
                    ? "border-rose-500/30 bg-rose-500/5 shadow-lg shadow-rose-950/20"
                    : isDueSoon
                    ? "border-amber-500/30 bg-amber-500/5 shadow-lg shadow-amber-950/20"
                    : isCompleted
                    ? "border-zinc-800/60 bg-zinc-900/40 opacity-80"
                    : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900 shadow-lg shadow-zinc-950/40"
                }`}
              >
                <div className="flex flex-col gap-3">
                  {/* Card Header: Title & Badges on left, Cost & Action buttons on right */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-zinc-100 tracking-tight leading-snug break-words">
                        {task.title}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {isCompleted ? (
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                            Completed
                          </span>
                        ) : isOverdue ? (
                          <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-bold text-rose-400">
                            Overdue
                          </span>
                        ) : isDueSoon ? (
                          <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                            Due Soon
                          </span>
                        ) : (
                          <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[10px] text-zinc-400 font-mono">
                            Scheduled
                          </span>
                        )}

                        <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-[10px] uppercase font-semibold text-zinc-400 font-mono">
                          {task.category}
                        </span>
                      </div>
                    </div>

                    {task.cost && task.cost > 0 ? (
                      <span className="flex items-center gap-1 rounded-xl bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 text-xs font-bold text-amber-300 font-mono shrink-0">
                        <Coins className="h-3.5 w-3.5 text-amber-400" />
                        ₹{task.cost.toLocaleString()}
                      </span>
                    ) : null}
                  </div>

                  {/* Due Metrics Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {task.dueOdometer && !isCompleted && (
                      <span
                        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-mono font-medium ${
                          isOverdue
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                            : isDueSoon
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : "border-zinc-800 bg-zinc-950/60 text-zinc-300"
                        }`}
                      >
                        <Gauge className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {kmRemaining !== null && kmRemaining < 0
                            ? `${Math.abs(kmRemaining).toLocaleString()} km overdue`
                            : `${kmRemaining?.toLocaleString()} km left`}
                        </span>
                        <span className="text-zinc-500 text-[11px]">
                          (@ {task.dueOdometer.toLocaleString()} km)
                        </span>
                      </span>
                    )}

                    {task.dueDate && !isCompleted && (
                      <span
                        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium ${
                          daysRemaining !== null && daysRemaining < 0
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                            : isDueSoon
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : "border-zinc-800 bg-zinc-950/60 text-zinc-300"
                        }`}
                      >
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                        <span>
                          {new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {daysRemaining !== null && (
                          <span className="text-zinc-500 font-mono text-[11px]">
                            ({daysRemaining < 0 ? `${Math.abs(daysRemaining)}d late` : `in ${daysRemaining}d`})
                          </span>
                        )}
                      </span>
                    )}

                    {task.intervalKm && (
                      <span className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 text-[11px] text-zinc-400 font-mono">
                        <RotateCw className="h-3 w-3 shrink-0 text-zinc-500" />
                        Every {task.intervalKm.toLocaleString()} km
                      </span>
                    )}

                    {task.intervalMonths && (
                      <span className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 text-[11px] text-zinc-400 font-mono">
                        <Calendar className="h-3 w-3 shrink-0 text-zinc-500" />
                        Every {task.intervalMonths} mo
                      </span>
                    )}
                  </div>

                  {/* Notes & Service Center with proper clean badge */}
                  {(task.notes || task.serviceCenter) && (
                    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-3 text-xs flex flex-col gap-1">
                      {task.serviceCenter && (
                        <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{task.serviceCenter}</span>
                        </div>
                      )}
                      {task.notes && (
                        <p className="text-zinc-400 text-xs leading-relaxed">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Bottom Bar: Priority/Completion on left, Done action on right */}
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {isCompleted && task.lastCompletedDate ? (
                      <span className="flex items-center gap-1.5 text-zinc-400 text-xs truncate">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">
                          Done {new Date(task.lastCompletedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          {task.lastCompletedOdometer ? ` @ ${task.lastCompletedOdometer.toLocaleString()} km` : ""}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-500 font-medium truncate block">
                        Priority:{" "}
                        <span
                          className={
                            task.priority === "HIGH" || task.priority === "URGENT"
                              ? "text-rose-400 font-semibold"
                              : task.priority === "MEDIUM"
                              ? "text-amber-400 font-medium"
                              : "text-zinc-400"
                          }
                        >
                          {task.priority}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="flex items-center justify-center h-8 w-8 rounded-xl border border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition"
                      title="Edit task"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="flex items-center justify-center h-8 w-8 rounded-xl border border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {!isCompleted && (
                      <button
                        onClick={() => {
                          setCompletingTaskId(completingTaskId === task.id ? null : task.id);
                          setCompletionOdo(String(currentOdometer));
                          setCompletionCost(task.cost ? String(task.cost) : "");
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition shadow-sm h-8"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Done
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Complete Drawer */}
                {completingTaskId === task.id && (
                  <div className="mt-3 rounded-2xl border border-emerald-500/30 bg-zinc-950 p-3.5 flex flex-col gap-2.5">
                    <p className="text-xs font-semibold text-emerald-400">
                      Record Completion Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono">Odometer (km)</label>
                        <input
                          type="number"
                          value={completionOdo}
                          onChange={(e) => setCompletionOdo(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono">Actual Cost (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 850"
                          value={completionCost}
                          onChange={(e) => setCompletionCost(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-mono">Completion Date</label>
                        <input
                          type="date"
                          value={completionDate}
                          onChange={(e) => setCompletionDate(e.target.value)}
                          onClick={(e) => {
                            try {
                              e.currentTarget.showPicker?.();
                            } catch {}
                          }}
                          className="mt-1 w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 [color-scheme:dark] focus:outline-none focus:border-zinc-700 font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={() => setCompletingTaskId(null)}
                        className="rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleMarkComplete(task.id)}
                        className="rounded-lg bg-emerald-500 px-3.5 py-1 text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
                      >
                        Confirm Complete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </section>

      {/* Add / Edit Task Modal */}
      {(isAddModalOpen || Boolean(editingTask)) && (
        <AddServiceModal
          isOpen={isAddModalOpen || Boolean(editingTask)}
          initialData={editingTask}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTask(null);
          }}
          onSuccess={() => {
            fetchTasks();
            refreshVehicles();
          }}
        />
      )}
    </div>
  );
}
