import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { enrollContactsSchema } from "@relay/shared";
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

  const sequence = await prisma.sequence.findUnique({ where: { id } });
  if (!sequence) {
    return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  }

  const enrollments = await prisma.sequenceEnrollment.findMany({
    where: { sequenceId: id },
    include: {
      contact: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return NextResponse.json({ data: enrollments });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const sequence = await prisma.sequence.findUnique({
    where: { id },
    include: { steps: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (!sequence) {
    return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = enrollContactsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existingEnrollments = await prisma.sequenceEnrollment.findMany({
    where: {
      sequenceId: id,
      contactId: { in: parsed.data.contactIds },
      status: { in: ["ACTIVE", "PAUSED"] },
    },
    select: { contactId: true },
  });

  const alreadyEnrolled = new Set(existingEnrollments.map((e) => e.contactId));
  const newContactIds = parsed.data.contactIds.filter((cid) => !alreadyEnrolled.has(cid));

  if (newContactIds.length === 0) {
    return NextResponse.json(
      { error: "All selected contacts are already enrolled" },
      { status: 409 },
    );
  }

  const firstStep = sequence.steps[0];

  const enrollments = await prisma.$transaction(
    newContactIds.map((contactId) =>
      prisma.sequenceEnrollment.create({
        data: {
          contactId,
          sequenceId: id,
          status: "ACTIVE",
          currentStepId: firstStep?.id ?? null,
        },
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
    ),
  );

  return NextResponse.json({ data: enrollments }, { status: 201 });
}
