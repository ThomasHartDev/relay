import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { noteFilterSchema, createNoteSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = noteFilterSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid filters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { search, contactId, companyId, dealId, pinned, page, limit, sortBy, sortOrder } =
    parsed.data;

  const where: Record<string, unknown> = {};

  if (search) {
    where.content = { contains: search, mode: "insensitive" };
  }

  if (contactId) where.contactId = contactId;
  if (companyId) where.companyId = companyId;
  if (dealId) where.dealId = dealId;
  if (pinned === "true") where.pinned = true;
  else if (pinned === "false") where.pinned = false;

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        deal: { select: { id: true, title: true } },
      },
      orderBy: [{ pinned: "desc" }, { [sortBy]: sortOrder }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.note.count({ where }),
  ]);

  return NextResponse.json({
    data: notes,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createNoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const note = await prisma.note.create({
    data: {
      ...parsed.data,
      userId: user.id,
    },
    include: {
      user: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json({ data: note }, { status: 201 });
}
