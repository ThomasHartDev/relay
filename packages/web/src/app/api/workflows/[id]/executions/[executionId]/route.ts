import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { getAuthUser } from "@/lib/server/auth";

interface RouteParams {
  params: Promise<{ id: string; executionId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id, executionId } = await params;

  const execution = await prisma.workflowExecution.findFirst({
    where: { id: executionId, workflowId: id },
  });

  if (!execution) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 });
  }

  return NextResponse.json({ data: execution });
}
