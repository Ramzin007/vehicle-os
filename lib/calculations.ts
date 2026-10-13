export interface FuelLogItem {
  id: string;
  odometer: number;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  isFullTank: boolean;
  missedRefuel: boolean;
  date: Date | string;
  stationName?: string | null;
  notes?: string | null;
  calculatedEconomy?: number | null;
  calculatedDistance?: number | null;
}

export interface MaintenanceTaskItem {
  id: string;
  title: string;
  category: string;
  status: string; // PENDING, DUE_SOON, OVERDUE, COMPLETED
  priority: string;
  dueOdometer?: number | null;
  dueDate?: Date | string | null;
  lastCompletedOdometer?: number | null;
  lastCompletedDate?: Date | string | null;
  cost?: number | null;
}

export interface VehicleDocumentItem {
  id: string;
  title: string;
  type: string;
  expiryDate?: Date | string | null;
  issueDate?: Date | string | null;
  documentNumber?: string | null;
  provider?: string | null;
}

export interface ExpenseItem {
  id: string;
  date: Date | string;
  category: string;
  amount: number;
  title: string;
}

/**
 * Computes fuel economy and distance for a series of fuel logs.
 * Returns enriched fuel logs with calculatedDistance and calculatedEconomy,
 * plus aggregate statistics.
 */
export function calculateFuelMetrics(logs: FuelLogItem[]) {
  if (!logs || logs.length === 0) {
    return {
      enrichedLogs: [],
      totalLiters: 0,
      totalCost: 0,
      totalDistance: 0,
      averageEconomy: 0, // km/L
      bestEconomy: 0,
      worstEconomy: 0,
      costPerKm: 0,
      averagePricePerLiter: 0,
      latestEconomy: 0,
    };
  }

  // Sort ascending by odometer reading
  const sorted = [...logs].sort((a, b) => a.odometer - b.odometer);

  let totalLiters = 0;
  let totalCost = 0;
  let totalDistanceCalculated = 0;
  let totalFuelUsedForEconomy = 0;

  const validEconomies: number[] = [];
  const enriched: (FuelLogItem & { calculatedDistance: number | null; calculatedEconomy: number | null })[] = [];

  let accumulatedLitersSinceFull = 0;
  let lastFullOdometer: number | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    totalLiters += current.liters;
    totalCost += current.totalCost;

    let distance: number | null = null;
    let economy: number | null = null;

    if (i > 0) {
      const prev = sorted[i - 1];
      const stepDistance = current.odometer - prev.odometer;
      if (stepDistance > 0) {
        distance = stepDistance;
      }
    }

    if (current.missedRefuel) {
      // Missed refuel reset: cannot reliably calculate economy for this segment
      lastFullOdometer = current.isFullTank ? current.odometer : null;
      accumulatedLitersSinceFull = 0;
    } else if (current.isFullTank) {
      if (lastFullOdometer !== null) {
        const fullDistance = current.odometer - lastFullOdometer;
        const totalFuel = accumulatedLitersSinceFull + current.liters;
        if (fullDistance > 0 && totalFuel > 0) {
          economy = fullDistance / totalFuel;
          validEconomies.push(economy);
          totalDistanceCalculated += fullDistance;
          totalFuelUsedForEconomy += totalFuel;
        }
      }
      lastFullOdometer = current.odometer;
      accumulatedLitersSinceFull = 0;
    } else {
      // Partial fill: accumulate fuel for next full tank calculation
      accumulatedLitersSinceFull += current.liters;
    }

    enriched.push({
      ...current,
      calculatedDistance: distance,
      calculatedEconomy: economy ? Math.round(economy * 10) / 10 : null,
    });
  }

  // Calculate overall distance between first and latest refuel
  const overallDistance =
    sorted.length > 1
      ? Math.max(0, sorted[sorted.length - 1].odometer - sorted[0].odometer)
      : 0;

  const averageEconomy =
    totalFuelUsedForEconomy > 0 && totalDistanceCalculated > 0
      ? Math.round((totalDistanceCalculated / totalFuelUsedForEconomy) * 10) / 10
      : validEconomies.length > 0
      ? Math.round((validEconomies.reduce((a, b) => a + b, 0) / validEconomies.length) * 10) / 10
      : 0;

  const bestEconomy =
    validEconomies.length > 0 ? Math.round(Math.max(...validEconomies) * 10) / 10 : 0;
  const worstEconomy =
    validEconomies.length > 0 ? Math.round(Math.min(...validEconomies) * 10) / 10 : 0;

  const costPerKm =
    overallDistance > 0 && totalCost > 0
      ? Math.round((totalCost / overallDistance) * 100) / 100
      : averageEconomy > 0 && totalCost > 0 && totalLiters > 0
      ? Math.round((totalCost / totalLiters / averageEconomy) * 100) / 100
      : 0;

  const averagePricePerLiter =
    totalLiters > 0 ? Math.round((totalCost / totalLiters) * 100) / 100 : 0;

  const latestEconomy =
    validEconomies.length > 0
      ? Math.round(validEconomies[validEconomies.length - 1] * 10) / 10
      : 0;

  // Return descending (newest first) for UI display
  const descendingEnriched = [...enriched].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    enrichedLogs: descendingEnriched,
    totalLiters: Math.round(totalLiters * 10) / 10,
    totalCost: Math.round(totalCost),
    totalDistance: overallDistance,
    averageEconomy,
    bestEconomy,
    worstEconomy,
    costPerKm,
    averagePricePerLiter,
    latestEconomy,
  };
}

export interface CareScoreResult {
  score: number; // 0 - 100
  rating: "EXCELLENT" | "GOOD" | "ATTENTION_NEEDED" | "CRITICAL";
  color: string; // hex / class
  maintenancePoints: number;
  documentPoints: number;
  refuelPoints: number;
  odometerPoints: number;
  recommendations: string[];
}

/**
 * Computes a weighted Vehicle Care Score (0 - 100) based on real telemetry:
 * - Maintenance Compliance (35 pts)
 * - Document Health & Expiry (30 pts)
 * - Fuel Logging Consistency (20 pts)
 * - Odometer Tracking & Updates (15 pts)
 */
export function calculateCareScore(
  currentOdometer: number,
  tasks: MaintenanceTaskItem[],
  documents: VehicleDocumentItem[],
  fuelLogs: FuelLogItem[]
): CareScoreResult {
  const recommendations: string[] = [];
  const now = new Date();

  // 1. Maintenance Component (Max 35)
  let maintenancePoints = 35;
  let overdueCount = 0;
  let dueSoonCount = 0;

  for (const task of tasks) {
    if (task.status === "COMPLETED") continue;

    let isOverdue = false;
    let isDueSoon = false;

    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) isOverdue = true;
      else if (diffDays <= 14) isDueSoon = true;
    }

    if (task.dueOdometer) {
      const diffKm = task.dueOdometer - currentOdometer;
      if (diffKm <= 0) isOverdue = true;
      else if (diffKm <= 300) isDueSoon = true;
    }

    if (task.status === "OVERDUE" || isOverdue) {
      overdueCount++;
    } else if (task.status === "DUE_SOON" || isDueSoon) {
      dueSoonCount++;
    }
  }

  if (overdueCount > 0) {
    maintenancePoints = Math.max(0, maintenancePoints - overdueCount * 12);
    recommendations.push(`Resolve ${overdueCount} overdue maintenance task${overdueCount > 1 ? "s" : ""}`);
  }
  if (dueSoonCount > 0) {
    maintenancePoints = Math.max(0, maintenancePoints - dueSoonCount * 4);
    recommendations.push(`${dueSoonCount} service task${dueSoonCount > 1 ? "s" : ""} approaching due date or km`);
  }

  // 2. Document Health Component (Max 30)
  let documentPoints = 30;
  let expiredDocs = 0;
  let expiringSoonDocs = 0;

  if (documents.length === 0) {
    documentPoints = 15;
    recommendations.push("Add vehicle documents (RC, Insurance, PUC) to track validity");
  } else {
    for (const doc of documents) {
      if (!doc.expiryDate) continue;
      const expiry = new Date(doc.expiryDate);
      const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) {
        expiredDocs++;
      } else if (daysLeft <= 30) {
        expiringSoonDocs++;
      }
    }

    if (expiredDocs > 0) {
      documentPoints = Math.max(0, documentPoints - expiredDocs * 15);
      recommendations.push(`Renew ${expiredDocs} expired document${expiredDocs > 1 ? "s" : ""} immediately`);
    }
    if (expiringSoonDocs > 0) {
      documentPoints = Math.max(5, documentPoints - expiringSoonDocs * 5);
      recommendations.push(`${expiringSoonDocs} document${expiringSoonDocs > 1 ? "s" : ""} expiring within 30 days`);
    }
  }

  // 3. Fuel Logging Consistency (Max 20)
  let refuelPoints = 20;
  if (!fuelLogs || fuelLogs.length === 0) {
    refuelPoints = 5;
    recommendations.push("Log your first fuel refill to start monitoring fuel economy");
  } else {
    const mostRecent = [...fuelLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    const daysSinceLastRefuel = Math.ceil(
      (now.getTime() - new Date(mostRecent.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastRefuel > 45) {
      refuelPoints = 10;
      recommendations.push("Record your latest refuel to maintain accurate mileage insights");
    } else if (daysSinceLastRefuel > 30) {
      refuelPoints = 15;
    }
  }

  // 4. Odometer Tracking (Max 15)
  let odometerPoints = 15;
  if (currentOdometer <= 0) {
    odometerPoints = 5;
    recommendations.push("Update current odometer reading to keep service schedules accurate");
  }

  const rawTotal = maintenancePoints + documentPoints + refuelPoints + odometerPoints;
  const score = Math.max(10, Math.min(100, Math.round(rawTotal)));

  let rating: CareScoreResult["rating"] = "GOOD";
  let color = "#34d399"; // emerald

  if (score >= 90) {
    rating = "EXCELLENT";
    color = "#10b981"; // emerald-500
  } else if (score >= 75) {
    rating = "GOOD";
    color = "#06b6d4"; // cyan-500
  } else if (score >= 55) {
    rating = "ATTENTION_NEEDED";
    color = "#f59e0b"; // amber-500
  } else {
    rating = "CRITICAL";
    color = "#ef4444"; // red-500
  }

  if (recommendations.length === 0) {
    recommendations.push("Vehicle is in prime condition! Keep up regular maintenance.");
  }

  return {
    score,
    rating,
    color,
    maintenancePoints,
    documentPoints,
    refuelPoints,
    odometerPoints,
    recommendations,
  };
}

/**
 * Summarizes expenses across categories and months.
 */
export function calculateExpenseSummary(expenses: ExpenseItem[], currentOdometer: number) {
  if (!expenses || expenses.length === 0) {
    return {
      totalSpend: 0,
      categoryBreakdown: [],
      monthlyBreakdown: [],
      costPerKm: 0,
    };
  }

  let totalSpend = 0;
  const categoryMap: Record<string, number> = {};
  const monthMap: Record<string, number> = {};

  for (const exp of expenses) {
    totalSpend += exp.amount;
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;

    const date = new Date(exp.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthMap[monthKey] = (monthMap[monthKey] || 0) + exp.amount;
  }

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount),
      percentage: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const monthlyBreakdown = Object.entries(monthMap)
    .map(([month, amount]) => ({
      month,
      amount: Math.round(amount),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const costPerKm =
    currentOdometer > 0 && totalSpend > 0
      ? Math.round((totalSpend / currentOdometer) * 100) / 100
      : 0;

  return {
    totalSpend: Math.round(totalSpend),
    categoryBreakdown,
    monthlyBreakdown,
    costPerKm,
  };
}

/**
 * Helper to get days remaining for a document expiry date.
 */
export function getDocumentStatus(expiryDate?: Date | string | null): {
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "NO_DATE";
  label: string;
  daysRemaining: number | null;
  badgeClass: string;
} {
  if (!expiryDate) {
    return {
      status: "NO_DATE",
      label: "No Expiry",
      daysRemaining: null,
      badgeClass: "bg-zinc-800 text-zinc-400 border-zinc-700",
    };
  }

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return {
      status: "EXPIRED",
      label: `Expired (${Math.abs(days)}d ago)`,
      daysRemaining: days,
      badgeClass: "bg-red-500/10 text-red-400 border-red-500/30",
    };
  }

  if (days <= 30) {
    return {
      status: "EXPIRING_SOON",
      label: `Expires in ${days}d`,
      daysRemaining: days,
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    };
  }

  return {
    status: "ACTIVE",
    label: `Valid (${days}d left)`,
    daysRemaining: days,
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  };
}
