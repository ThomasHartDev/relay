import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { createWorkflowSchema, workflowFilterSchema } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = workflowFilterSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid filters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { search, status, page, limit, sortBy, sortOrder } = parsed.data;

  const where = {
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    ...(status ? { status } : {}),
  };

  const [workflows, total] = await Promise.all([
    prisma.workflow.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { nodes: true, executions: true } },
      },
    }),
    prisma.workflow.count({ where }),
  ]);

  return NextResponse.json({
    data: workflows,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createWorkflowSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const workflow = await prisma.workflow.create({
    data: parsed.data,
    include: {
      _count: { select: { nodes: true, executions: true } },
    },
  });

  return NextResponse.json({ data: workflow }, { status: 201 });
}
