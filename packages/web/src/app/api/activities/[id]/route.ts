import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
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

  const existing = await prisma.activity.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  // Handle completion toggle
  if ("completed" in body) {
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        completedAt: body.completed ? new Date() : null,
      },
    });
    return NextResponse.json({ data: activity });
  }

  const activity = await prisma.activity.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ data: activity });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.activity.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  await prisma.activity.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
