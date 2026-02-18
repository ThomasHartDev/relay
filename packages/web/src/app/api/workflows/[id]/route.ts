import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { updateWorkflowSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const workflow = await prisma.workflow.findUnique({
    where: { id },
    include: {
      nodes: true,
      edges: true,
      _count: { select: { executions: true } },
    },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json({ data: workflow });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateWorkflowSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.workflow.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const workflow = await prisma.workflow.update({
    where: { id },
    data: parsed.data,
    include: {
      _count: { select: { nodes: true, executions: true } },
    },
  });

  return NextResponse.json({ data: workflow });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.workflow.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  await prisma.workflow.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
