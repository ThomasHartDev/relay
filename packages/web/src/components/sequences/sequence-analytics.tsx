"use client";

import { useCallback, useEffect, useState } from "react";
import { Users, CheckCircle, MessageSquare, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsMetrics {
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

interface FunnelStep {
  label: string;
  count: number;
  rate: number;
}

interface StepMetric {
  stepId: string;
  order: number;
  subject: string;
  reached: number;
  reachedRate: number;
}

interface AnalyticsData {
  metrics: AnalyticsMetrics;
  funnel: FunnelStep[];
  stepMetrics: StepMetric[];
}

interface SequenceAnalyticsProps {
  sequenceId: string;
}

const FUNNEL_COLORS = ["#3B82F6", "#6366F1", "#8B5CF6", "#22C55E"] as const;

export function SequenceAnalytics({ sequenceId }: SequenceAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sequences/${sequenceId}/analytics`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [sequenceId]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-400">Failed to load analytics</p>
      </div>
    );
  }

  const { metrics, funnel, stepMetrics } = data;

  return (
    <div className="space-y-4">
      {/* 4 key metrics — Miller's Law: 4 above the fold */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Users className="h-4 w-4" />}
          label="Total Enrolled"
          value={String(metrics.totalEnrolled)}
          subtext={`${metrics.activeCount} currently active`}
        />
        <MetricCard
          icon={<CheckCircle className="h-4 w-4" />}
          label="Completion Rate"
          value={`${metrics.completionRate}%`}
          subtext={`${metrics.completedCount} completed`}
        />
        <MetricCard
          icon={<MessageSquare className="h-4 w-4" />}
          label="Reply Rate"
          value={`${metrics.replyRate}%`}
          subtext={`${metrics.repliedCount} replied`}
        />
        <MetricCard
          icon={<AlertCircle className="h-4 w-4" />}
          label="Bounce Rate"
          value={`${metrics.bounceRate}%`}
          subtext={`${metrics.bouncedCount} bounced`}
          alert={metrics.bounceRate > 5}
        />
      </div>

      {/* Funnel chart — Pre-attentive: gradient from blue to green */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Enrollment Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.totalEnrolled === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No enrollments yet — enroll contacts to see funnel data
            </p>
          ) : (
            <div className="space-y-3">
              {funnel.map((step, i) => {
                const color = FUNNEL_COLORS[i % FUNNEL_COLORS.length];
                const barWidth = Math.max(step.rate, 2);
                return (
                  <div key={step.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{step.label}</span>
                      <span className="text-sm text-gray-500">
                        {step.count} ({step.rate}%)
                      </span>
                    </div>
                    <div className="h-8 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="flex h-full items-center rounded-full transition-all"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: color,
                        }}
                      >
                        {step.rate > 15 && (
                          <span className="pl-3 text-xs font-medium text-white">{step.rate}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-step performance */}
      {stepMetrics.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Per-Step Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {stepMetrics.map((step, i) => (
                <div
                  key={step.stepId}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
                        {i + 1}
                      </span>
                      <p className="truncate text-sm font-medium text-gray-900">{step.subject}</p>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{step.reached}</p>
                      <p className="text-[10px] text-gray-400">reached</p>
                    </div>
                    <div className="w-24">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${Math.max(step.reachedRate, 2)}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-right text-[10px] text-gray-400">
                        {step.reachedRate}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Enrollment Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.totalEnrolled === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">No enrollment data</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <StatusItem
                label="Active"
                count={metrics.activeCount}
                total={metrics.totalEnrolled}
                color="#22C55E"
              />
              <StatusItem
                label="Paused"
                count={metrics.pausedCount}
                total={metrics.totalEnrolled}
                color="#F59E0B"
              />
              <StatusItem
                label="Completed"
                count={metrics.completedCount}
                total={metrics.totalEnrolled}
                color="#3B82F6"
              />
              <StatusItem
                label="Replied"
                count={metrics.repliedCount}
                total={metrics.totalEnrolled}
                color="#8B5CF6"
              />
              <StatusItem
                label="Bounced"
                count={metrics.bouncedCount}
                total={metrics.totalEnrolled}
                color="#EF4444"
              />
              <StatusItem
                label="Unsubscribed"
                count={metrics.unsubscribedCount}
                total={metrics.totalEnrolled}
                color="#6B7280"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  alert?: boolean;
}) {
  return (
    <Card className={alert ? "border-red-200" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
        <span className={alert ? "text-red-500" : "text-gray-400"}>{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className={`mt-1 text-xs ${alert ? "text-red-500" : "text-gray-500"}`}>{subtext}</p>
      </CardContent>
    </Card>
  );
}

function StatusItem({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
      <div className="h-8 w-1 rounded-full" style={{ backgroundColor: color }} />
      <div>
        <p className="text-lg font-semibold text-gray-900">{count}</p>
        <p className="text-xs text-gray-500">
          {label} ({pct}%)
        </p>
      </div>
    </div>
  );
}
