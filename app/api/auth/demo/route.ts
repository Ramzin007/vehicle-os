import { NextResponse } from "next/server";
import { ensureDefaultUserAndVehicle } from "@/lib/seed";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    const demoUser = await ensureDefaultUserAndVehicle();
    const token = await createSessionToken(demoUser.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error("Demo login error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to initialize demo rider session" },
      { status: 500 }
    );
  }
}
