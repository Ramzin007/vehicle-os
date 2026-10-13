import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email, password } = json;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your email and password" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
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
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to sign in" },
      { status: 500 }
    );
  }
}
