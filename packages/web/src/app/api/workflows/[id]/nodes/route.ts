import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@relay/db";
import { prisma } from "@relay/db";
import { createWorkflowNodeSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const workflow = await prisma.workflow.findUnique({ where: { id } });
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createWorkflowNodeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { type, label, config, positionX, positionY } = parsed.data;

  const node = await prisma.workflowNode.create({
    data: {
      workflowId: id,
      type,
      label,
      config: config as Prisma.InputJsonValue,
      positionX,
      positionY,
    },
  });

  return NextResponse.json({ data: node }, { status: 201 });
}
