import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { name, email, password } = json;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const token = await createSessionToken(user.id);

    const response = NextResponse.json({ success: true, user });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to register account" },
      { status: 500 }
    );
  }
}
