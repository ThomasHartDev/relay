import { NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { loginSchema } from "@relay/shared";
import { verifyPassword, setAuthCookies } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await setAuthCookies({ userId: user.id, email: user.email });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
