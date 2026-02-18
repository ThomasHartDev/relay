import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { dealFilterSchema, createDealSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = dealFilterSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid filters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { search, stage, ownerId, companyId, page, limit, sortBy, sortOrder } = parsed.data;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [{ title: { contains: search, mode: "insensitive" } }];
  }

  if (stage) where.stage = stage;
  if (ownerId) where.ownerId = ownerId;
  if (companyId) where.companyId = companyId;

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.deal.count({ where }),
  ]);

  return NextResponse.json({
    data: deals,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createDealSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const deal = await prisma.deal.create({
    data: {
      ...parsed.data,
      ownerId: parsed.data.ownerId ?? user.id,
    },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ data: deal }, { status: 201 });
}
