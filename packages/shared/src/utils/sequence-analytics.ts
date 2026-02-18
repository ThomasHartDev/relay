import type { EnrollmentStatus } from "../schemas/sequence";

interface EnrollmentForAnalytics {
  status: EnrollmentStatus;
  currentStepId: string | null;
}

interface StepForAnalytics {
  id: string;
  order: number;
  type: string;
  subject: string | null;
}

export interface AnalyticsMetrics {
  totalEnrolled: number;
  activeCount: number;
  completedCount: number;
  repliedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  pausedCount: number;
  completionRate: number;
  replyRate: number;
  bounceRate: number;
}

export interface FunnelStep {
  label: string;
  count: number;
  rate: number;
}

export interface StepMetric {
  stepId: string;
  order: number;
  subject: string;
  reached: number;
  reachedRate: number;
}

export function computeMetrics(enrollments: EnrollmentForAnalytics[]): AnalyticsMetrics {
  const total = enrollments.length;
  const activeCount = enrollments.filter((e) => e.status === "ACTIVE").length;
  const completedCount = enrollments.filter((e) => e.status === "COMPLETED").length;
  const repliedCount = enrollments.filter((e) => e.status === "REPLIED").length;
  const bouncedCount = enrollments.filter((e) => e.status === "BOUNCED").length;
  const unsubscribedCount = enrollments.filter((e) => e.status === "UNSUBSCRIBED").length;
  const pausedCount = enrollments.filter((e) => e.status === "PAUSED").length;

  const finishedCount = completedCount + repliedCount;
  const completionRate = total > 0 ? Math.round((finishedCount / total) * 100) : 0;
  const replyRate = total > 0 ? Math.round((repliedCount / total) * 100) : 0;
  const bounceRate = total > 0 ? Math.round((bouncedCount / total) * 100) : 0;

  return {
    totalEnrolled: total,
    activeCount,
    completedCount,
    repliedCount,
    bouncedCount,
    unsubscribedCount,
    pausedCount,
    completionRate,
    replyRate,
    bounceRate,
  };
}

export function computeFunnel(metrics: AnalyticsMetrics): FunnelStep[] {
  const { totalEnrolled, activeCount, completedCount, repliedCount } = metrics;
  const finishedCount = completedCount + repliedCount;

  return [
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
}

export function computeStepMetrics(
  steps: StepForAnalytics[],
  enrollments: EnrollmentForAnalytics[],
): StepMetric[] {
  const emailSteps = steps.filter((s) => s.type === "EMAIL");
  const stepOrderMap = new Map(steps.map((s) => [s.id, s.order]));
  const totalEnrolled = enrollments.length;

  return emailSteps.map((step) => {
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
}
