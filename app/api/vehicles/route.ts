import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { ensureDefaultUserAndVehicle } from "@/lib/seed";
import { vehicleSchema } from "@/lib/validations";

export async function GET() {
  try {
    let user = await getSessionUser();

    // If no user exists anywhere, auto-seed default demo account
    if (!user) {
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        user = await ensureDefaultUserAndVehicle();
      } else {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            fuelLogs: true,
            maintenanceTasks: true,
            documents: true,
            expenses: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, vehicles });
  } catch (error) {
    console.error("Vehicles GET error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const validated = vehicleSchema.parse(json);

    if (validated.isDefault) {
      await prisma.vehicle.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: user.id,
        name: validated.name,
        model: validated.model,
        type: validated.type,
        make: validated.make,
        year: validated.year,
        registrationNumber: validated.registrationNumber,
        vin: validated.vin,
        color: validated.color,
        fuelType: validated.fuelType,
        tankCapacity: validated.tankCapacity,
        currentOdometer: validated.currentOdometer,
        isDefault: validated.isDefault,
      },
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("Vehicles POST error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { id, ...data } = json;

    if (!id) {
      return NextResponse.json({ success: false, error: "Vehicle id is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.vehicle.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
    }

    if (data.isDefault) {
      await prisma.vehicle.updateMany({
        where: { userId: user.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, vehicle: updated });
  } catch (error) {
    console.error("Vehicles PATCH error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}
