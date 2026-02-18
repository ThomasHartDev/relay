import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { createSequenceSchema, sequenceFilterSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = sequenceFilterSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid filters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { search, status, page, limit, sortBy, sortOrder } = parsed.data;

  const where: Record<string, unknown> = {};
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (status) {
    where.status = status;
  }

  const [sequences, total] = await Promise.all([
    prisma.sequence.findMany({
      where,
      include: {
        _count: { select: { steps: true, enrollments: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sequence.count({ where }),
  ]);

  return NextResponse.json({
    data: sequences,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSequenceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const sequence = await prisma.sequence.create({
    data: parsed.data,
    include: {
      _count: { select: { steps: true, enrollments: true } },
    },
  });

  return NextResponse.json({ data: sequence }, { status: 201 });
}
