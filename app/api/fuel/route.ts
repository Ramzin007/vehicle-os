import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fuelLogSchema } from "@/lib/validations";
import { calculateFuelMetrics } from "@/lib/calculations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");

    const where = vehicleId ? { vehicleId } : {};
    const logs = await prisma.fuelLog.findMany({
      where,
      orderBy: { odometer: "asc" },
      include: {
        vehicle: {
          select: { name: true, model: true, registrationNumber: true, tankCapacity: true },
        },
      },
    });

    const metrics = calculateFuelMetrics(logs);

    return NextResponse.json({
      success: true,
      logs: metrics.enrichedLogs,
      metrics: {
        totalLiters: metrics.totalLiters,
        totalCost: metrics.totalCost,
        totalDistance: metrics.totalDistance,
        averageEconomy: metrics.averageEconomy,
        bestEconomy: metrics.bestEconomy,
        worstEconomy: metrics.worstEconomy,
        costPerKm: metrics.costPerKm,
        averagePricePerLiter: metrics.averagePricePerLiter,
        latestEconomy: metrics.latestEconomy,
      },
    });
  } catch (error) {
    console.error("Fuel GET error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const validated = fuelLogSchema.parse(json);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validated.vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
    }

    const logDate = new Date(validated.date);

    // Create the fuel log
    const fuelLog = await prisma.fuelLog.create({
      data: {
        vehicleId: validated.vehicleId,
        date: logDate,
        odometer: validated.odometer,
        liters: validated.liters,
        pricePerLiter: validated.pricePerLiter,
        totalCost: validated.totalCost,
        isFullTank: validated.isFullTank,
        missedRefuel: validated.missedRefuel,
        stationName: validated.stationName || null,
        notes: validated.notes || null,
      },
    });

    // Update vehicle odometer if new reading is higher
    if (validated.odometer > vehicle.currentOdometer) {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { currentOdometer: validated.odometer },
      });
    }

    // Auto-create synced Expense
    await prisma.expense.create({
      data: {
        vehicleId: validated.vehicleId,
        date: logDate,
        category: "FUEL",
        amount: validated.totalCost,
        title: `Fuel Refill (${validated.liters} L)${validated.stationName ? ` - ${validated.stationName}` : ""}`,
        notes: validated.notes || `Odometer: ${validated.odometer} km`,
        odometer: validated.odometer,
        referenceId: fuelLog.id,
      },
    });

    return NextResponse.json({ success: true, fuelLog });
  } catch (error) {
    console.error("Fuel POST error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Fuel log id is required" }, { status: 400 });
    }

    // Delete linked expense if any
    await prisma.expense.deleteMany({
      where: { referenceId: id },
    });

    await prisma.fuelLog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Fuel log deleted" });
  } catch (error) {
    console.error("Fuel DELETE error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}
