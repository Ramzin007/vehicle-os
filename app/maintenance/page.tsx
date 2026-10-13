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
  Check,
  RotateCw,
  Coins,
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
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [_loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED" | "ALL">("ACTIVE");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [completionOdo, setCompletionOdo] = useState("");
  const [completionCost, setCompletionCost] = useState("");

  const fetchTasks = useCallback(async () => {
    if (!activeVehicle) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/maintenance?vehicleId=${activeVehicle.id}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
          lastCompletedDate: new Date().toISOString(),
          cost,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCompletingTaskId(null);
        setCompletionOdo("");
        setCompletionCost("");
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
    <div className="flex flex-col gap-5 p-4 sm:p-5">
      {/* Header & Schedule CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-cyan-400" />
            Service & Care
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {activeVehicle ? `${activeVehicle.name} • ${activeVehicle.model}` : "Maintenance tracker"}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-1.5">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`rounded-xl py-2 text-xs font-semibold transition ${
            activeTab === "ACTIVE"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Upcoming ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`rounded-xl py-2 text-xs font-semibold transition ${
            activeTab === "COMPLETED"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => setActiveTab("ALL")}
          className={`rounded-xl py-2 text-xs font-semibold transition ${
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
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/50 mb-2" />
            <p className="text-sm font-semibold text-zinc-300">
              {activeTab === "ACTIVE"
                ? "No pending service tasks!"
                : "No tasks found in this view"}
            </p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Schedule oil changes, chain lubes, or brake inspections to keep your TVS Ronin running smoothly.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-cyan-400"
            >
              Schedule Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                className={`group rounded-2xl border p-4 transition ${
                  isOverdue
                    ? "border-red-500/40 bg-red-500/5"
                    : isDueSoon
                    ? "border-amber-500/40 bg-amber-500/5"
                    : isCompleted
                    ? "border-zinc-800/60 bg-zinc-900/50 opacity-80"
                    : "border-zinc-800 bg-zinc-900/90"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-zinc-100">
                        {task.title}
                      </span>

                      {/* Status / Urgency pill */}
                      {isCompleted ? (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          Completed
                        </span>
                      ) : isOverdue ? (
                        <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[10px] font-bold text-red-400 animate-pulse">
                          Overdue
                        </span>
                      ) : isDueSoon ? (
                        <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          Due Soon
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                          Scheduled
                        </span>
                      )}

                      <span className="rounded-full bg-zinc-800/70 px-2 py-0.5 text-[10px] uppercase font-semibold text-zinc-400">
                        {task.category}
                      </span>
                    </div>

                    {/* Due indicators */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      {task.dueOdometer && !isCompleted && (
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            isOverdue
                              ? "text-red-400 font-bold"
                              : isDueSoon
                              ? "text-amber-400 font-bold"
                              : "text-zinc-400"
                          }`}
                        >
                          <Gauge className="h-3.5 w-3.5" />
                          {kmRemaining !== null && kmRemaining < 0
                            ? `${Math.abs(kmRemaining)} km overdue (Due: ${task.dueOdometer} km)`
                            : `Due at ${task.dueOdometer.toLocaleString()} km (${kmRemaining} km left)`}
                        </span>
                      )}

                      {task.dueDate && !isCompleted && (
                        <span
                          className={`flex items-center gap-1 ${
                            daysRemaining !== null && daysRemaining < 0
                              ? "text-red-400"
                              : "text-zinc-400"
                          }`}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          {daysRemaining !== null && (
                            <span className="text-zinc-500">
                              ({daysRemaining < 0 ? `${Math.abs(daysRemaining)}d late` : `in ${daysRemaining}d`})
                            </span>
                          )}
                        </span>
                      )}

                      {isCompleted && task.lastCompletedDate && (
                        <span className="flex items-center gap-1 text-zinc-400 text-[11px]">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          Completed on {new Date(task.lastCompletedDate).toLocaleDateString()}
                          {task.lastCompletedOdometer ? ` @ ${task.lastCompletedOdometer.toLocaleString()} km` : ""}
                        </span>
                      )}

                      {task.intervalKm && (
                        <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                          <RotateCw className="h-3 w-3" />
                          Repeats every {task.intervalKm.toLocaleString()} km
                        </span>
                      )}
                    </div>

                    {/* Notes & Service Center */}
                    {(task.notes || task.serviceCenter) && (
                      <p className="mt-2 text-xs text-zinc-400">
                        {task.serviceCenter && (
                          <strong className="text-zinc-300 mr-1">
                            {task.serviceCenter}:
                          </strong>
                        )}
                        {task.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {task.cost && task.cost > 0 ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-zinc-300">
                        <Coins className="h-3 w-3 text-amber-400" />
                        ₹{task.cost.toLocaleString()}
                      </span>
                    ) : null}

                    <div className="flex items-center gap-1">
                      {!isCompleted && (
                        <button
                          onClick={() => {
                            setCompletingTaskId(task.id);
                            setCompletionOdo(String(currentOdometer));
                            setCompletionCost(task.cost ? String(task.cost) : "");
                          }}
                          className="flex items-center gap-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Done
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Complete Drawer */}
                {completingTaskId === task.id && (
                  <div className="mt-3 rounded-xl border border-emerald-500/30 bg-zinc-950 p-3 flex flex-col gap-2">
                    <p className="text-xs font-semibold text-emerald-400">
                      Record Completion Details
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400">Odometer (km)</label>
                        <input
                          type="number"
                          value={completionOdo}
                          onChange={(e) => setCompletionOdo(e.target.value)}
                          className="mt-0.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400">Actual Cost (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 850"
                          value={completionCost}
                          onChange={(e) => setCompletionCost(e.target.value)}
                          className="mt-0.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={() => setCompletingTaskId(null)}
                        className="rounded-lg border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleMarkComplete(task.id)}
                        className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
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

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <AddServiceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            fetchTasks();
            refreshVehicles();
          }}
        />
      )}
    </div>
  );
}
