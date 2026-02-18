import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
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

  const original = await prisma.workflow.findUnique({
    where: { id },
    include: { nodes: true, edges: true },
  });

  if (!original) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const duplicate = await prisma.$transaction(async (tx) => {
    const wf = await tx.workflow.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        status: "DRAFT",
        triggerType: original.triggerType,
      },
    });

    // Copy nodes and build old -> new ID map
    const idMap = new Map<string, string>();
    for (const node of original.nodes) {
      const newNode = await tx.workflowNode.create({
        data: {
          workflowId: wf.id,
          type: node.type,
          label: node.label,
          config: node.config ?? {},
          positionX: node.positionX,
          positionY: node.positionY,
        },
      });
      idMap.set(node.id, newNode.id);
    }

    // Copy edges using remapped IDs
    for (const edge of original.edges) {
      const sourceId = idMap.get(edge.sourceNodeId);
      const targetId = idMap.get(edge.targetNodeId);
      if (sourceId && targetId) {
        await tx.workflowEdge.create({
          data: {
            workflowId: wf.id,
            sourceNodeId: sourceId,
            targetNodeId: targetId,
            label: edge.label,
          },
        });
      }
    }

    return tx.workflow.findUnique({
      where: { id: wf.id },
      include: {
        nodes: true,
        edges: true,
        _count: { select: { executions: true } },
      },
    });
  });

  return NextResponse.json({ data: duplicate }, { status: 201 });
}
