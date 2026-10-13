import {
  calculateFuelMetrics,
  calculateCareScore,
  getDocumentStatus,
  calculateExpenseSummary,
} from "../lib/calculations";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

console.log("=== RUNNING VEHICLEOS UNIT TESTS ===");

// 1. Fuel Metrics Test
const sampleLogs = [
  {
    id: "1",
    odometer: 3200,
    liters: 12.0,
    pricePerLiter: 100,
    totalCost: 1200,
    isFullTank: true,
    missedRefuel: false,
    date: new Date("2026-08-01"),
  },
  {
    id: "2",
    odometer: 3600,
    liters: 10.0,
    pricePerLiter: 100,
    totalCost: 1000,
    isFullTank: true,
    missedRefuel: false,
    date: new Date("2026-08-10"),
  },
  {
    id: "3",
    odometer: 4000,
    liters: 10.0,
    pricePerLiter: 100,
    totalCost: 1000,
    isFullTank: true,
    missedRefuel: false,
    date: new Date("2026-08-20"),
  },
];

const fuelMetrics = calculateFuelMetrics(sampleLogs);
assert(fuelMetrics.totalLiters === 32, "Total liters is 32");
assert(fuelMetrics.totalDistance === 800, "Total distance is 800 km");
assert(fuelMetrics.averageEconomy === 40, "Average economy is 40 km/L (800km / 20L)");
assert(fuelMetrics.costPerKm === 4, "Cost per km is 4 (3200 / 800)");

// 2. Care Score Test
const now = new Date();
const goodTasks = [
  {
    id: "t1",
    title: "Oil Change",
    category: "OIL",
    status: "PENDING",
    priority: "HIGH",
    dueOdometer: 5000,
  },
];
const goodDocs = [
  {
    id: "d1",
    title: "Insurance",
    type: "INSURANCE",
    expiryDate: new Date(now.getTime() + 100 * 24 * 60 * 60 * 1000), // 100 days away
  },
];

const careScore = calculateCareScore(4350, goodTasks, goodDocs, sampleLogs);
assert(careScore.score >= 80, `Care score for well maintained vehicle is high: ${careScore.score}`);
assert(careScore.rating === "GOOD" || careScore.rating === "EXCELLENT", "Care score rating is Good/Excellent");

// Test Overdue Task Penalty
const overdueTasks = [
  {
    id: "t2",
    title: "Chain Lube",
    category: "CHAIN",
    status: "OVERDUE",
    priority: "URGENT",
    dueOdometer: 4000, // < 4350
  },
];
const penalizedScore = calculateCareScore(4350, overdueTasks, goodDocs, sampleLogs);
assert(penalizedScore.score < careScore.score, "Overdue task reduces score");
assert(penalizedScore.recommendations.some(r => r.includes("overdue")), "Recommendation warns about overdue task");

// 3. Document Expiry Test
const activeDoc = getDocumentStatus(new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000));
assert(activeDoc.status === "ACTIVE", "Doc expiring in 60 days is ACTIVE");

const soonDoc = getDocumentStatus(new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000));
assert(soonDoc.status === "EXPIRING_SOON", "Doc expiring in 15 days is EXPIRING_SOON");

const expiredDoc = getDocumentStatus(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000));
assert(expiredDoc.status === "EXPIRED", "Doc expired 5 days ago is EXPIRED");

// 4. Expense Summary Test
const expenses = [
  { id: "e1", date: new Date(), category: "FUEL", amount: 1000, title: "Fuel" },
  { id: "e2", date: new Date(), category: "SERVICE", amount: 500, title: "Service" },
  { id: "e3", date: new Date(), category: "FUEL", amount: 500, title: "Fuel" },
];
const expSummary = calculateExpenseSummary(expenses, 1000);
assert(expSummary.totalSpend === 2000, "Total spend is 2000");
assert(expSummary.categoryBreakdown[0].category === "FUEL", "Top category is FUEL");
assert(expSummary.categoryBreakdown[0].amount === 1500, "FUEL spend is 1500");
assert(expSummary.categoryBreakdown[0].percentage === 75, "FUEL is 75%");
assert(expSummary.costPerKm === 2, "Cost per km is 2 (2000 / 1000)");

console.log("=== ALL UNIT TESTS PASSED SUCCESSFULLY! ===");
