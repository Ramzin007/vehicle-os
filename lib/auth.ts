import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vehicle-os-secure-jwt-secret-key-32-chars-long"
);
export const COOKIE_NAME = "vehicleos_session";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (typeof payload.userId === "string") {
      return { userId: payload.userId };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Retrieves the currently authenticated user from HTTP-only cookie.
 */
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    if (!session?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
