import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations";
import { calculateExpenseSummary } from "@/lib/calculations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");

    const where = vehicleId ? { vehicleId } : {};
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        vehicle: {
          select: { name: true, model: true, currentOdometer: true },
        },
      },
    });

    const vehicle = vehicleId
      ? await prisma.vehicle.findUnique({ where: { id: vehicleId } })
      : await prisma.vehicle.findFirst({ where: { isDefault: true } });

    const summary = calculateExpenseSummary(expenses, vehicle?.currentOdometer ?? 0);

    return NextResponse.json({
      success: true,
      expenses,
      summary,
    });
  } catch (error) {
    console.error("Expenses GET error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const validated = expenseSchema.parse(json);

    const expense = await prisma.expense.create({
      data: {
        vehicleId: validated.vehicleId,
        date: new Date(validated.date),
        category: validated.category,
        amount: validated.amount,
        title: validated.title,
        notes: validated.notes || null,
        odometer: validated.odometer || null,
        referenceId: validated.referenceId || null,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("Expenses POST error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Expense id is required" }, { status: 400 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Expense deleted" });
  } catch (error) {
    console.error("Expenses DELETE error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}
