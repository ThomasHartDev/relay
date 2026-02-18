import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { updateEnrollmentSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

interface RouteParams {
  params: Promise<{ id: string; enrollmentId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, enrollmentId } = await params;

  const enrollment = await prisma.sequenceEnrollment.findFirst({
    where: { id: enrollmentId, sequenceId: id },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateEnrollmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.sequenceEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status: parsed.data.status,
      ...(parsed.data.status === "COMPLETED" ? { completedAt: new Date() } : {}),
    },
    include: {
      contact: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, enrollmentId } = await params;

  const enrollment = await prisma.sequenceEnrollment.findFirst({
    where: { id: enrollmentId, sequenceId: id },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
  }

  await prisma.sequenceEnrollment.delete({ where: { id: enrollmentId } });

  return NextResponse.json({ success: true });
}
