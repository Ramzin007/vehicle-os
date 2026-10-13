import { NextResponse } from "next/server";
import { ensureDefaultVehicle, seedDatabase } from "@/lib/seed";

export async function GET() {
  try {
    const vehicle = await ensureDefaultVehicle();
    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === "reset") {
      const vehicle = await seedDatabase();
      return NextResponse.json({ success: true, message: "Database reset to TVS Ronin 225 sample data", vehicle });
    }
    const vehicle = await ensureDefaultVehicle();
    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
