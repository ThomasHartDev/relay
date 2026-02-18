import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { getAuthUser } from "@/lib/server/auth";

interface RouteParams {
  params: Promise<{ id: string; edgeId: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, edgeId } = await params;

  const existing = await prisma.workflowEdge.findFirst({
    where: { id: edgeId, workflowId: id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Edge not found" }, { status: 404 });
  }

  await prisma.workflowEdge.delete({ where: { id: edgeId } });

  return NextResponse.json({ success: true });
}
