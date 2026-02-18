import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { validateWorkflowGraph } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const workflow = await prisma.workflow.findUnique({
    where: { id },
    include: { nodes: true, edges: true },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  if (workflow.status === "ACTIVE") {
    return NextResponse.json({ error: "Workflow is already active" }, { status: 400 });
  }

  // Validate graph before activation
  const validation = validateWorkflowGraph(
    workflow.nodes.map((n) => ({ id: n.id, type: n.type })),
    workflow.edges.map((e) => ({
      id: e.id,
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
      label: e.label,
    })),
  );

  if (!validation.valid) {
    return NextResponse.json(
      { error: "Invalid workflow graph", details: validation.errors },
      { status: 400 },
    );
  }

  const updated = await prisma.workflow.update({
    where: { id },
    data: { status: "ACTIVE" },
    include: { _count: { select: { nodes: true, executions: true } } },
  });

  return NextResponse.json({ data: updated });
}
