import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { createSequenceStepSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const sequence = await prisma.sequence.findUnique({ where: { id } });
  if (!sequence) {
    return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createSequenceStepSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const step = await prisma.sequenceStep.create({
    data: {
      ...parsed.data,
      sequenceId: id,
    },
  });

  return NextResponse.json({ data: step }, { status: 201 });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const sequence = await prisma.sequence.findUnique({ where: { id } });
  if (!sequence) {
    return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  }

  const body = await request.json();
  const { steps } = body as { steps: { id: string; order: number }[] };

  if (!Array.isArray(steps)) {
    return NextResponse.json({ error: "steps array required" }, { status: 400 });
  }

  await prisma.$transaction(
    steps.map((s) =>
      prisma.sequenceStep.update({
        where: { id: s.id },
        data: { order: s.order },
      }),
    ),
  );

  const updated = await prisma.sequenceStep.findMany({
    where: { sequenceId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ data: updated });
}
