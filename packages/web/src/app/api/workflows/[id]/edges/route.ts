import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { createWorkflowEdgeSchema } from "@relay/shared";
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
  const parsed = createWorkflowEdgeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const edge = await prisma.workflowEdge.create({
    data: {
      ...parsed.data,
      workflowId: id,
    },
  });

  return NextResponse.json({ data: edge }, { status: 201 });
}
