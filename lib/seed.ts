import prisma from "./prisma";
import { hashPassword } from "./auth";

export async function ensureDefaultUserAndVehicle() {
  let demoUser = await prisma.user.findUnique({
    where: { email: "demo@vehicleos.app" },
  });

  if (!demoUser) {
    const passwordHash = await hashPassword("demo123");
    demoUser = await prisma.user.create({
      data: {
        email: "demo@vehicleos.app",
        name: "Ramzin P (TVS Rider)",
        passwordHash,
      },
    });
  }

  const vehicleCount = await prisma.vehicle.count({
    where: { userId: demoUser.id },
  });

  if (vehicleCount === 0) {
    await seedDatabaseForUser(demoUser.id);
  }

  return demoUser;
}

export async function seedDatabaseForUser(userId: string) {
  // Clear any existing vehicles for this user if resetting
  await prisma.vehicle.deleteMany({
    where: { userId },
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      userId,
      name: "TVS Ronin",
      model: "225 — Lightning Black",
      type: "MOTORCYCLE",
      make: "TVS",
      year: 2024,
      registrationNumber: "KL 10 AV 4242",
      vin: "MD625GF58R1A04242",
      color: "Lightning Black",
      fuelType: "PETROL",
      tankCapacity: 14.0,
      currentOdometer: 4350,
      isDefault: true,
    },
  });

  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // 1. Refuel Logs
  const fuel1 = await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle.id,
      date: daysAgo(42),
      odometer: 3210,
      liters: 12.5,
      pricePerLiter: 102.5,
      totalCost: 1281.25,
      isFullTank: true,
      missedRefuel: false,
      stationName: "IndianOil Swaraj Fuels",
      notes: "First tracked full tank refill",
    },
  });

  const fuel2 = await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle.id,
      date: daysAgo(28),
      odometer: 3695,
      liters: 12.1,
      pricePerLiter: 103.1,
      totalCost: 1247.51,
      isFullTank: true,
      missedRefuel: false,
      stationName: "BPCL Highway Fuel Point",
      notes: "Highway ride back from Kozhikode (485 km covered on 12.1L ~ 40.1 km/L)",
      calculatedDistance: 485,
      calculatedEconomy: 40.1,
    },
  });

  const fuel3 = await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle.id,
      date: daysAgo(14),
      odometer: 4050,
      liters: 9.1,
      pricePerLiter: 102.8,
      totalCost: 935.48,
      isFullTank: true,
      missedRefuel: false,
      stationName: "HP AutoCare Station",
      notes: "City commuting in Rain mode",
      calculatedDistance: 355,
      calculatedEconomy: 39.0,
    },
  });

  const fuel4 = await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle.id,
      date: daysAgo(2),
      odometer: 4350,
      liters: 7.5,
      pricePerLiter: 103.5,
      totalCost: 776.25,
      isFullTank: true,
      missedRefuel: false,
      stationName: "IndianOil Express Hub",
      notes: "Pre-weekend tank top up",
      calculatedDistance: 300,
      calculatedEconomy: 40.0,
    },
  });

  // 2. Maintenance Tasks
  await prisma.maintenanceTask.createMany({
    data: [
      {
        vehicleId: vehicle.id,
        title: "1st Periodic Service (1,000 km)",
        category: "ROUTINE",
        status: "COMPLETED",
        priority: "HIGH",
        dueOdometer: 1000,
        lastCompletedOdometer: 980,
        lastCompletedDate: daysAgo(75),
        cost: 850,
        serviceCenter: "TVS Authorized Service Center",
        notes: "Engine oil flushed & filled with TVS Tru4 Synthetic 10W-30, oil filter replaced, chain slack adjusted to 25mm.",
      },
      {
        vehicleId: vehicle.id,
        title: "Chain Clean & Lubricate",
        category: "CHAIN",
        status: "DUE_SOON",
        priority: "MEDIUM",
        dueOdometer: 4500,
        dueDate: daysFromNow(6),
        intervalKm: 500,
        intervalMonths: 1,
        lastCompletedOdometer: 3980,
        lastCompletedDate: daysAgo(16),
        cost: 150,
        serviceCenter: "Self / Garage",
        notes: "Use Motul Chain Clean (C1) and Chain Lube (C2). Check tension 20-30mm free play.",
      },
      {
        vehicleId: vehicle.id,
        title: "2nd Periodic Service (6,000 km)",
        category: "ROUTINE",
        status: "PENDING",
        priority: "HIGH",
        dueOdometer: 6000,
        dueDate: daysFromNow(55),
        intervalKm: 5000,
        intervalMonths: 6,
        cost: 1450,
        serviceCenter: "TVS Authorized Service Center",
        notes: "Engine oil, spark plug check, throttle body cleaning, air filter inspection.",
      },
      {
        vehicleId: vehicle.id,
        title: "Brake Fluid & Pad Inspection",
        category: "BRAKES",
        status: "PENDING",
        priority: "MEDIUM",
        dueOdometer: 7000,
        dueDate: daysFromNow(70),
        cost: 300,
        serviceCenter: "TVS Service Point",
        notes: "Check dual-channel ABS sensor ring and front/rear pad thickness.",
      },
    ],
  });

  // 3. Vehicle Documents
  await prisma.vehicleDocument.createMany({
    data: [
      {
        vehicleId: vehicle.id,
        title: "Registration Certificate (RC)",
        type: "RC",
        documentNumber: "KL1020240058319",
        issueDate: daysAgo(180),
        expiryDate: daysFromNow(5290), // ~15 years
        provider: "Motor Vehicles Department, Kerala",
        notes: "Permanent registration valid across India. Smart card in possession.",
      },
      {
        vehicleId: vehicle.id,
        title: "Comprehensive Insurance Policy",
        type: "INSURANCE",
        documentNumber: "HDFC-2W-98234190",
        issueDate: daysAgo(180),
        expiryDate: daysFromNow(185), // ~6 months left
        provider: "HDFC ERGO General Insurance",
        notes: "1 Year Own Damage + 5 Year Third Party Cover. Zero depreciation included.",
      },
      {
        vehicleId: vehicle.id,
        title: "Pollution Under Control (PUC)",
        type: "PUC",
        documentNumber: "KL-PUC-2026-8812",
        issueDate: daysAgo(135),
        expiryDate: daysFromNow(45), // ~45 days left (Attention alert)
        provider: "Govt Authorized Emission Test Centre",
        notes: "BS-VI emission compliance verified. Hydrocarbons and CO within limits.",
      },
      {
        vehicleId: vehicle.id,
        title: "Driving License",
        type: "LICENSE",
        documentNumber: "DL-092021008129",
        issueDate: daysAgo(800),
        expiryDate: daysFromNow(3650), // 10 years
        provider: "Regional Transport Office",
        notes: "Authorized for MCWG (Motorcycle with Gear) and LMV.",
      },
    ],
  });

  // 4. Expenses
  await prisma.expense.createMany({
    data: [
      {
        vehicleId: vehicle.id,
        date: daysAgo(42),
        category: "FUEL",
        amount: 1281.25,
        title: "Fuel Refill (12.5 L)",
        notes: "Station: IndianOil Swaraj Fuels",
        odometer: 3210,
        referenceId: fuel1.id,
      },
      {
        vehicleId: vehicle.id,
        date: daysAgo(28),
        category: "FUEL",
        amount: 1247.51,
        title: "Fuel Refill (12.1 L)",
        notes: "Station: BPCL Highway Fuel Point",
        odometer: 3695,
        referenceId: fuel2.id,
      },
      {
        vehicleId: vehicle.id,
        date: daysAgo(14),
        category: "FUEL",
        amount: 935.48,
        title: "Fuel Refill (9.1 L)",
        notes: "Station: HP AutoCare Station",
        odometer: 4050,
        referenceId: fuel3.id,
      },
      {
        vehicleId: vehicle.id,
        date: daysAgo(2),
        category: "FUEL",
        amount: 776.25,
        title: "Fuel Refill (7.5 L)",
        notes: "Station: IndianOil Express Hub",
        odometer: 4350,
        referenceId: fuel4.id,
      },
      {
        vehicleId: vehicle.id,
        date: daysAgo(75),
        category: "SERVICE",
        amount: 850,
        title: "1st Periodic Service (1,000 km)",
        notes: "Engine oil, filter, labor charges",
        odometer: 980,
      },
      {
        vehicleId: vehicle.id,
        date: daysAgo(50),
        category: "ACCESSORIES",
        amount: 1850,
        title: "TVS Ronin Engine Crash Guard",
        notes: "Original matte black engine guard installed",
        odometer: 2500,
      },
      {
        vehicleId: vehicle.id,
        date: daysAgo(35),
        category: "PARTS",
        amount: 720,
        title: "Motul Chain Cleaner & Lube Combo Spray",
        notes: "Maintenance care kit",
        odometer: 3400,
      },
      {
        vehicleId: vehicle.id,
        date: daysAgo(10),
        category: "WASH",
        amount: 250,
        title: "Foam Wash & Ceramic Spray Polish",
        notes: "Detailing garage wash",
        odometer: 4180,
      },
    ],
  });

  return await prisma.vehicle.findUnique({
    where: { id: vehicle.id },
    include: {
      fuelLogs: { orderBy: { odometer: "desc" } },
      maintenanceTasks: { orderBy: { status: "asc" } },
      documents: true,
      expenses: { orderBy: { date: "desc" } },
    },
  });
}
