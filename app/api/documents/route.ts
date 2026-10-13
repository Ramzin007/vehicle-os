import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { vehicleDocumentSchema } from "@/lib/validations";
import { getDocumentStatus } from "@/lib/calculations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");

    const where = vehicleId ? { vehicleId } : {};
    const documents = await prisma.vehicleDocument.findMany({
      where,
      orderBy: { expiryDate: "asc" },
      include: {
        vehicle: {
          select: { name: true, model: true, registrationNumber: true },
        },
      },
    });

    const enriched = documents.map((doc) => {
      const statusInfo = getDocumentStatus(doc.expiryDate);
      return {
        ...doc,
        computedStatus: statusInfo.status,
        statusLabel: statusInfo.label,
        daysRemaining: statusInfo.daysRemaining,
        badgeClass: statusInfo.badgeClass,
      };
    });

    return NextResponse.json({ success: true, documents: enriched });
  } catch (error) {
    console.error("Documents GET error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const validated = vehicleDocumentSchema.parse(json);

    const doc = await prisma.vehicleDocument.create({
      data: {
        vehicleId: validated.vehicleId,
        title: validated.title,
        type: validated.type,
        documentNumber: validated.documentNumber || null,
        issueDate: validated.issueDate ? new Date(validated.issueDate) : null,
        expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
        provider: validated.provider || null,
        notes: validated.notes || null,
        fileUrl: validated.fileUrl || null,
      },
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error) {
    console.error("Documents POST error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const json = await req.json();
    const { id, ...data } = json;

    if (!id) {
      return NextResponse.json({ success: false, error: "Document id is required" }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.documentNumber !== undefined) updatePayload.documentNumber = data.documentNumber || null;
    if (data.provider !== undefined) updatePayload.provider = data.provider || null;
    if (data.issueDate !== undefined) updatePayload.issueDate = data.issueDate ? new Date(data.issueDate) : null;
    if (data.expiryDate !== undefined) updatePayload.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
    if (data.notes !== undefined) updatePayload.notes = data.notes || null;
    if (data.fileUrl !== undefined) updatePayload.fileUrl = data.fileUrl || null;

    const updated = await prisma.vehicleDocument.update({
      where: { id },
      data: updatePayload,
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (error) {
    console.error("Documents PATCH error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Document id is required" }, { status: 400 });
    }

    await prisma.vehicleDocument.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error("Documents DELETE error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}
