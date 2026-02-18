import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@relay/db";
import { prisma } from "@relay/db";
import { WORKFLOW_TEMPLATES } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const templateId = (body as Record<string, unknown>).templateId;

  if (typeof templateId !== "string") {
    return NextResponse.json({ error: "templateId is required" }, { status: 400 });
  }

  const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Create workflow with nodes and edges in a transaction
  const workflow = await prisma.$transaction(async (tx) => {
    const wf = await tx.workflow.create({
      data: {
        name: template.name,
        description: template.description,
        status: "DRAFT",
        triggerType: template.triggerType,
      },
    });

    // Create nodes and build tempId -> realId map
    const idMap = new Map<string, string>();
    for (const templateNode of template.nodes) {
      const node = await tx.workflowNode.create({
        data: {
          workflowId: wf.id,
          type: templateNode.type,
          label: templateNode.label,
          config: templateNode.config as Prisma.InputJsonValue,
          positionX: templateNode.positionX,
          positionY: templateNode.positionY,
        },
      });
      idMap.set(templateNode.tempId, node.id);
    }

    // Create edges using the real node IDs
    for (const templateEdge of template.edges) {
      const sourceId = idMap.get(templateEdge.sourceTempId);
      const targetId = idMap.get(templateEdge.targetTempId);
      if (sourceId && targetId) {
        await tx.workflowEdge.create({
          data: {
            workflowId: wf.id,
            sourceNodeId: sourceId,
            targetNodeId: targetId,
            label: templateEdge.label,
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

  return NextResponse.json({ data: workflow }, { status: 201 });
}
