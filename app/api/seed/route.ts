import { NextResponse } from "next/server";
import { ensureDefaultUserAndVehicle, seedDatabaseForUser } from "@/lib/seed";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const demoUser = await ensureDefaultUserAndVehicle();
    return NextResponse.json({ success: true, user: demoUser });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const demoUser = await ensureDefaultUserAndVehicle();
    const targetUserId = user ? user.id : demoUser.id;

    const body = await req.json().catch(() => ({}));
    if (body.action === "reset") {
      const vehicle = await seedDatabaseForUser(targetUserId);
      return NextResponse.json({
        success: true,
        message: "Database reset to TVS Ronin 225 sample data",
        vehicle,
      });
    }

    return NextResponse.json({ success: true, user: demoUser });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
