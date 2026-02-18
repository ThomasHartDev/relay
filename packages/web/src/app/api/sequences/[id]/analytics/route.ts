import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
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

  const sequence = await prisma.sequence.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: "asc" } },
      enrollments: {
        select: {
          id: true,
          status: true,
          currentStepId: true,
          enrolledAt: true,
          completedAt: true,
        },
      },
    },
  });

  if (!sequence) {
    return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  }

  const enrollments = sequence.enrollments;
  const totalEnrolled = enrollments.length;
  const activeCount = enrollments.filter((e) => e.status === "ACTIVE").length;
  const completedCount = enrollments.filter((e) => e.status === "COMPLETED").length;
  const repliedCount = enrollments.filter((e) => e.status === "REPLIED").length;
  const bouncedCount = enrollments.filter((e) => e.status === "BOUNCED").length;
  const unsubscribedCount = enrollments.filter((e) => e.status === "UNSUBSCRIBED").length;
  const pausedCount = enrollments.filter((e) => e.status === "PAUSED").length;

  // Completion rate: completed + replied out of all non-active enrollments
  const finishedCount = completedCount + repliedCount;
  const completionRate = totalEnrolled > 0 ? Math.round((finishedCount / totalEnrolled) * 100) : 0;

  // Reply rate: replied / enrolled
  const replyRate = totalEnrolled > 0 ? Math.round((repliedCount / totalEnrolled) * 100) : 0;

  // Bounce rate: bounced / enrolled
  const bounceRate = totalEnrolled > 0 ? Math.round((bouncedCount / totalEnrolled) * 100) : 0;

  // Per-step breakdown: how many enrollments are at or past each step
  const emailSteps = sequence.steps.filter((s) => s.type === "EMAIL");
  const stepOrderMap = new Map(sequence.steps.map((s) => [s.id, s.order]));

  const stepMetrics = emailSteps.map((step) => {
    // "Reached" = enrollments whose currentStepId order >= this step's order,
    // OR who completed/replied (they passed all steps)
    const reached = enrollments.filter((e) => {
      if (e.status === "COMPLETED" || e.status === "REPLIED") return true;
      if (!e.currentStepId) return false;
      const currentOrder = stepOrderMap.get(e.currentStepId);
      return currentOrder !== undefined && currentOrder >= step.order;
    }).length;

    const reachedRate = totalEnrolled > 0 ? Math.round((reached / totalEnrolled) * 100) : 0;

    return {
      stepId: step.id,
      order: step.order,
      subject: step.subject ?? `Email ${step.order + 1}`,
      reached,
      reachedRate,
    };
  });

  // Funnel: enrolled -> active -> completed -> replied
  const funnel = [
    { label: "Enrolled", count: totalEnrolled, rate: 100 },
    {
      label: "Active",
      count: activeCount + finishedCount,
      rate:
        totalEnrolled > 0 ? Math.round(((activeCount + finishedCount) / totalEnrolled) * 100) : 0,
    },
    {
      label: "Completed",
      count: finishedCount,
      rate: totalEnrolled > 0 ? Math.round((finishedCount / totalEnrolled) * 100) : 0,
    },
    {
      label: "Replied",
      count: repliedCount,
      rate: totalEnrolled > 0 ? Math.round((repliedCount / totalEnrolled) * 100) : 0,
    },
  ];

  return NextResponse.json({
    data: {
      metrics: {
        totalEnrolled,
        activeCount,
        completedCount,
        repliedCount,
        bouncedCount,
        unsubscribedCount,
        pausedCount,
        completionRate,
        replyRate,
        bounceRate,
      },
      funnel,
      stepMetrics,
    },
  });
}
