import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@relay/db";
import { verifyRefreshToken, setAuthCookies } from "@/lib/server/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("relay_refresh")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    await setAuthCookies({ userId: user.id, email: user.email });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }
}
