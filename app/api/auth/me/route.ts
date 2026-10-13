import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: true, user: null });
    }
    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Auth me error:", err);
    return NextResponse.json({ success: false, error: "Failed to check session" }, { status: 500 });
  }
}
