import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { updateDealSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true, email: true } },
      company: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true, email: true } },
      activities: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      notes: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  return NextResponse.json({ data: deal });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateDealSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const deal = await prisma.deal.update({
    where: { id },
    data: parsed.data,
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ data: deal });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  await prisma.deal.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
