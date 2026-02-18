import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { createTagSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const tags = await prisma.tag.findMany({
    include: {
      _count: { select: { contacts: true, deals: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: tags });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createTagSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.tag.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: "Tag name already exists" }, { status: 409 });
  }

  const tag = await prisma.tag.create({
    data: parsed.data,
  });

  return NextResponse.json({ data: tag }, { status: 201 });
}
