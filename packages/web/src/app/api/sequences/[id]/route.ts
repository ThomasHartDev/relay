import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { updateSequenceSchema } from "@relay/shared";
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

  const sequence = await prisma.sequence.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!sequence) {
    return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  }

  return NextResponse.json({ data: sequence });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSequenceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.sequence.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  }

  const sequence = await prisma.sequence.update({
    where: { id },
    data: parsed.data,
    include: {
      _count: { select: { steps: true, enrollments: true } },
    },
  });

  return NextResponse.json({ data: sequence });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.sequence.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  }

  await prisma.sequence.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
