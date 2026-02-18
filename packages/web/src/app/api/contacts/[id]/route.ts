import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { updateContactSchema } from "@relay/shared";
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

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true, domain: true } },
      owner: { select: { id: true, name: true, email: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      deals: {
        include: {
          company: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json({ data: contact });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const contact = await prisma.contact.update({
    where: { id },
    data: parsed.data,
    include: {
      company: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ data: contact });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  await prisma.contact.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
