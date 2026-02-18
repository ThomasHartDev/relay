import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { getAuthUser } from "@/lib/server/auth";
import { executeWorkflow } from "@/lib/workflows/executor";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

  if (workflow.status !== "ACTIVE") {
    return NextResponse.json({ error: "Workflow must be active to execute" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const triggerData = (body as Record<string, unknown>).triggerData ?? {};

  const execution = await executeWorkflow(workflow, triggerData as Record<string, unknown>);

  return NextResponse.json({ data: execution }, { status: 201 });
}
