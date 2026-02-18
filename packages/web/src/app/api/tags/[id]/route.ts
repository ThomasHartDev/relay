import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { updateTagSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateTagSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.tag.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  if (parsed.data.name && parsed.data.name !== existing.name) {
    const duplicate = await prisma.tag.findUnique({ where: { name: parsed.data.name } });
    if (duplicate) {
      return NextResponse.json({ error: "Tag name already exists" }, { status: 409 });
    }
  }

  const tag = await prisma.tag.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ data: tag });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.tag.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  await prisma.tag.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
