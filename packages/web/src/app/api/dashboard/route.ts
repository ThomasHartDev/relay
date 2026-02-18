import { NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { getAuthUser } from "@/lib/server/auth";
import { DEAL_STAGES } from "@relay/shared";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86_400_000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    totalContacts,
    contactsThisMonth,
    openDeals,
    pipelineValue,
    dealsWonThisMonth,
    wonValueThisMonth,
    activitiesToday,
    overdueActivities,
    recentActivities,
    dealsByStage,
    topDeals,
  ] = await Promise.all([
    // Total contacts
    prisma.contact.count(),

    // Contacts added this month
    prisma.contact.count({
      where: { createdAt: { gte: monthStart, lt: monthEnd } },
    }),

    // Open deals (not Won or Lost)
    prisma.deal.count({
      where: { stage: { notIn: ["WON", "LOST"] } },
    }),

    // Total pipeline value (open deals)
    prisma.deal.aggregate({
      _sum: { value: true },
      where: { stage: { notIn: ["WON", "LOST"] } },
    }),

    // Deals won this month
    prisma.deal.count({
      where: { stage: "WON", updatedAt: { gte: monthStart, lt: monthEnd } },
    }),

    // Won value this month
    prisma.deal.aggregate({
      _sum: { value: true },
      where: { stage: "WON", updatedAt: { gte: monthStart, lt: monthEnd } },
    }),

    // Activities due today
    prisma.activity.count({
      where: {
        dueDate: { gte: todayStart, lt: todayEnd },
        completedAt: null,
      },
    }),

    // Overdue activities
    prisma.activity.count({
      where: {
        dueDate: { lt: todayStart },
        completedAt: null,
      },
    }),

    // Recent activities (last 5)
    prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    }),

    // Deals by stage (for pipeline bar)
    Promise.all(
      DEAL_STAGES.map(async (stage) => {
        const result = await prisma.deal.aggregate({
          _count: true,
          _sum: { value: true },
          where: { stage },
        });
        return {
          stage,
          count: result._count,
          value: result._sum.value ?? 0,
        };
      }),
    ),

    // Top deals by value
    prisma.deal.findMany({
      take: 5,
      where: { stage: { notIn: ["WON", "LOST"] } },
      orderBy: { value: "desc" },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    data: {
      metrics: {
        totalContacts,
        contactsThisMonth,
        openDeals,
        pipelineValue: pipelineValue._sum.value ?? 0,
        dealsWonThisMonth,
        wonValueThisMonth: wonValueThisMonth._sum.value ?? 0,
        activitiesToday,
        overdueActivities,
      },
      dealsByStage,
      recentActivities,
      topDeals,
    },
  });
}
