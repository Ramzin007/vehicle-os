import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { maintenanceTaskSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");

    const where = vehicleId ? { vehicleId } : {};
    const tasks = await prisma.maintenanceTask.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { priority: "desc" },
        { dueDate: "asc" },
      ],
      include: {
        vehicle: {
          select: { name: true, model: true, currentOdometer: true },
        },
      },
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("Maintenance GET error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const validated = maintenanceTaskSchema.parse(json);

    const task = await prisma.maintenanceTask.create({
      data: {
        vehicleId: validated.vehicleId,
        title: validated.title,
        category: validated.category,
        status: validated.status,
        priority: validated.priority,
        dueOdometer: validated.dueOdometer || null,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        intervalKm: validated.intervalKm || null,
        intervalMonths: validated.intervalMonths || null,
        lastCompletedOdometer: validated.lastCompletedOdometer || null,
        lastCompletedDate: validated.lastCompletedDate ? new Date(validated.lastCompletedDate) : null,
        cost: validated.cost || 0,
        serviceCenter: validated.serviceCenter || null,
        notes: validated.notes || null,
      },
    });

    // If already marked completed with a cost, record expense
    if (validated.status === "COMPLETED" && (validated.cost || 0) > 0) {
      await prisma.expense.create({
        data: {
          vehicleId: validated.vehicleId,
          date: validated.lastCompletedDate ? new Date(validated.lastCompletedDate) : new Date(),
          category: "SERVICE",
          amount: validated.cost || 0,
          title: `Service: ${validated.title}`,
          notes: validated.serviceCenter ? `Service Center: ${validated.serviceCenter}` : validated.notes,
          odometer: validated.lastCompletedOdometer,
          referenceId: task.id,
        },
      });
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("Maintenance POST error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const json = await req.json();
    const { id, ...updates } = json;

    if (!id) {
      return NextResponse.json({ success: false, error: "Task id is required" }, { status: 400 });
    }

    const currentTask = await prisma.maintenanceTask.findUnique({
      where: { id },
    });

    if (!currentTask) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = { ...updates };
    if (updates.dueDate) data.dueDate = new Date(updates.dueDate);
    if (updates.lastCompletedDate) data.lastCompletedDate = new Date(updates.lastCompletedDate);

    // If changing to COMPLETED
    if (updates.status === "COMPLETED" && currentTask.status !== "COMPLETED") {
      const completionDate = updates.lastCompletedDate ? new Date(updates.lastCompletedDate) : new Date();
      data.lastCompletedDate = completionDate;

      // If repeating interval exists, calculate next due
      if (currentTask.intervalKm && updates.lastCompletedOdometer) {
        data.dueOdometer = updates.lastCompletedOdometer + currentTask.intervalKm;
      }
      if (currentTask.intervalMonths) {
        const nextDate = new Date(completionDate);
        nextDate.setMonth(nextDate.getMonth() + currentTask.intervalMonths);
        data.dueDate = nextDate;
      }

      // Update vehicle odometer if completed odometer is higher
      if (updates.lastCompletedOdometer) {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: currentTask.vehicleId },
        });
        if (vehicle && updates.lastCompletedOdometer > vehicle.currentOdometer) {
          await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: { currentOdometer: updates.lastCompletedOdometer },
          });
        }
      }

      // Record service expense if cost provided (prevent duplicate for same task id and date)
      const cost = updates.cost !== undefined ? updates.cost : currentTask.cost;
      if (cost && cost > 0) {
        // Save the updated cost on the task itself too
        data.cost = cost;

        // Upsert expense record with referenceId = task.id to prevent duplicates
        const existingExpense = await prisma.expense.findFirst({
          where: { referenceId: currentTask.id },
        });

        if (existingExpense) {
          await prisma.expense.update({
            where: { id: existingExpense.id },
            data: {
              amount: cost,
              date: completionDate,
              odometer: updates.lastCompletedOdometer || null,
              notes: updates.notes || currentTask.notes || `Completed at ${updates.lastCompletedOdometer || "N/A"} km`,
            },
          });
        } else {
          await prisma.expense.create({
            data: {
              vehicleId: currentTask.vehicleId,
              date: completionDate,
              category: "SERVICE",
              amount: cost,
              title: `Service: ${currentTask.title}`,
              notes: updates.notes || currentTask.notes || `Completed at ${updates.lastCompletedOdometer || "N/A"} km`,
              odometer: updates.lastCompletedOdometer || null,
              referenceId: currentTask.id,
            },
          });
        }
      }
    }

    const updatedTask = await prisma.maintenanceTask.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Maintenance PATCH error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Task id is required" }, { status: 400 });
    }

    await prisma.maintenanceTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("Maintenance DELETE error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}
