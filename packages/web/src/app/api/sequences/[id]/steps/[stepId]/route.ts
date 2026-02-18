import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { createSequenceStepSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

interface RouteParams {
  params: Promise<{ id: string; stepId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, stepId } = await params;

  const step = await prisma.sequenceStep.findFirst({
    where: { id: stepId, sequenceId: id },
  });
  if (!step) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createSequenceStepSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.sequenceStep.update({
    where: { id: stepId },
    data: parsed.data,
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, stepId } = await params;

  const step = await prisma.sequenceStep.findFirst({
    where: { id: stepId, sequenceId: id },
  });
  if (!step) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  await prisma.sequenceStep.delete({ where: { id: stepId } });

  return NextResponse.json({ success: true });
}
