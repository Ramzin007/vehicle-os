import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vehicle-os-secure-jwt-secret-key-32-chars-long"
);
const COOKIE_NAME = "vehicleos_session";

const protectedRoutes = [
  "/",
  "/fuel",
  "/maintenance",
  "/documents",
  "/expenses",
  "/stations",
  "/more",
];

const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload && typeof payload.userId === "string") {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Exact match for '/' or prefix match for other protected routes
  const isProtected = protectedRoutes.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If user is NOT authenticated and attempting to view protected pages, redirect to /login
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    // Clear stale cookie if present
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // If user is already authenticated and visits /login or /register, redirect to dashboard /
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - public files (favicon.ico, favicon.svg, icon.svg, sw.js, manifest, icons, screenshots)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|icon.svg|sw.js|manifest.webmanifest|icons|screenshots).*)",
  ],
};
