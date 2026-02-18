import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { getAuthUser } from "@/lib/server/auth";

interface RouteParams {
  params: Promise<{ id: string; nodeId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, nodeId } = await params;
  const body = await request.json();

  const existing = await prisma.workflowNode.findFirst({
    where: { id: nodeId, workflowId: id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  const node = await prisma.workflowNode.update({
    where: { id: nodeId },
    data: {
      type: body.type ?? existing.type,
      label: body.label ?? existing.label,
      config: body.config ?? existing.config,
      positionX: body.positionX ?? existing.positionX,
      positionY: body.positionY ?? existing.positionY,
    },
  });

  return NextResponse.json({ data: node });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, nodeId } = await params;

  const existing = await prisma.workflowNode.findFirst({
    where: { id: nodeId, workflowId: id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  await prisma.workflowNode.delete({ where: { id: nodeId } });

  return NextResponse.json({ success: true });
}
