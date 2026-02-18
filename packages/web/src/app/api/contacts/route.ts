import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { contactFilterSchema, createContactSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = contactFilterSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid filters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { search, status, companyId, ownerId, tagId, page, limit, sortBy, sortOrder } = parsed.data;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) where.status = status;
  if (companyId) where.companyId = companyId;
  if (ownerId) where.ownerId = ownerId;
  if (tagId) {
    where.tags = { some: { tagId } };
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contact.count({ where }),
  ]);

  return NextResponse.json({
    data: contacts,
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
  const parsed = createContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const contact = await prisma.contact.create({
    data: {
      ...parsed.data,
      ownerId: parsed.data.ownerId ?? user.id,
    },
    include: {
      company: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ data: contact }, { status: 201 });
}
