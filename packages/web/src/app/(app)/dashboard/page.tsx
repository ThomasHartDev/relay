"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Handshake,
  DollarSign,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { STAGE_COLORS, ACTIVITY_COLORS } from "@/lib/design-tokens";
import type { DealStage, ActivityType } from "@relay/shared";
import { DEAL_STAGE_LABELS } from "@relay/shared";

interface DashboardData {
  metrics: {
    totalContacts: number;
    contactsThisMonth: number;
    openDeals: number;
    pipelineValue: number;
    dealsWonThisMonth: number;
    wonValueThisMonth: number;
    activitiesToday: number;
    overdueActivities: number;
  };
  dealsByStage: {
    stage: DealStage;
    count: number;
    value: number;
  }[];
  recentActivities: {
    id: string;
    type: ActivityType;
    title: string;
    createdAt: string;
    user: { id: string; name: string };
    contact: { id: string; firstName: string; lastName: string } | null;
  }[];
  topDeals: {
    id: string;
    title: string;
    value: number;
    stage: DealStage;
    contact: { id: string; firstName: string; lastName: string } | null;
    company: { id: string; name: string } | null;
  }[];
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, dealsByStage, recentActivities, topDeals } = data;
  const totalPipelineDeals = dealsByStage.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500">
          Here&apos;s what&apos;s happening with your CRM today.
        </p>
      </div>

      {/* Key metrics — Miller's Law: 4 above the fold */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Users className="h-4 w-4" />}
          label="Total Contacts"
          value={metrics.totalContacts.toLocaleString()}
          subtext={`+${metrics.contactsThisMonth} this month`}
        />
        <MetricCard
          icon={<Handshake className="h-4 w-4" />}
          label="Open Deals"
          value={String(metrics.openDeals)}
          subtext={`${metrics.dealsWonThisMonth} won this month`}
        />
        <MetricCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Pipeline Value"
          value={formatCurrency(metrics.pipelineValue)}
          subtext={`${formatCurrency(metrics.wonValueThisMonth)} closed`}
        />
        <MetricCard
          icon={<CalendarCheck className="h-4 w-4" />}
          label="Activities Today"
          value={String(metrics.activitiesToday)}
          subtext={
            metrics.overdueActivities > 0 ? `${metrics.overdueActivities} overdue` : "All on track"
          }
          alert={metrics.overdueActivities > 0}
        />
      </div>

      {/* Von Restorff: overdue alert banner */}
      {metrics.overdueActivities > 0 && (
        <div
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 transition-colors hover:bg-red-100"
          onClick={() => router.push("/activities")}
        >
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <p className="text-sm font-medium text-red-700">
            You have {metrics.overdueActivities} overdue activit
            {metrics.overdueActivities !== 1 ? "ies" : "y"} — click to review
          </p>
        </div>
      )}

      {/* Pipeline bar — Pre-attentive: stage colors for instant recognition */}
      {totalPipelineDeals > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pipeline Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-8 overflow-hidden rounded-full">
              {dealsByStage
                .filter((s) => s.count > 0)
                .map((s) => {
                  const colors = STAGE_COLORS[s.stage];
                  const width = (s.count / totalPipelineDeals) * 100;
                  return (
                    <div
                      key={s.stage}
                      className="flex items-center justify-center text-xs font-medium transition-all"
                      style={{
                        width: `${width}%`,
                        backgroundColor: colors.text,
                        color: "#fff",
                        minWidth: width > 0 ? "24px" : 0,
                      }}
                      title={`${DEAL_STAGE_LABELS[s.stage]}: ${s.count} deals — ${formatCurrency(s.value)}`}
                    >
                      {width > 8 ? s.count : ""}
                    </div>
                  );
                })}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {dealsByStage
                .filter((s) => s.count > 0)
                .map((s) => {
                  const colors = STAGE_COLORS[s.stage];
                  return (
                    <div key={s.stage} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: colors.text }}
                      />
                      <span className="text-gray-600">
                        {DEAL_STAGE_LABELS[s.stage]} ({s.count})
                      </span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom grid — F-Pattern: recent activity left, top deals right */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">No recent activities</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const colors = ACTIVITY_COLORS[activity.type];
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        <span className="text-[10px] font-bold">{activity.type[0]}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-400">
                          {activity.user.name}
                          {activity.contact &&
                            ` — ${activity.contact.firstName} ${activity.contact.lastName}`}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">
                        {new Date(activity.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Deals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base">Top Deals by Value</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {topDeals.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">No open deals</p>
            ) : (
              <div className="space-y-3">
                {topDeals.map((deal) => {
                  const colors = STAGE_COLORS[deal.stage];
                  return (
                    <div
                      key={deal.id}
                      className="flex cursor-pointer items-center justify-between rounded-md border border-gray-100 p-2.5 transition-colors hover:bg-gray-50"
                      onClick={() => router.push(`/deals/${deal.id}`)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{deal.title}</p>
                        <p className="text-xs text-gray-400">
                          {(deal.company?.name ?? deal.contact)
                            ? `${deal.contact?.firstName} ${deal.contact?.lastName}`
                            : "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(deal.value)}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px]"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {DEAL_STAGE_LABELS[deal.stage]}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
        <p className={`mt-1 text-xs ${alert ? "text-red-500" : "text-gray-500"}`}>
          {alert && <TrendingUp className="mr-1 inline h-3 w-3" />}
          {subtext}
        </p>
      </CardContent>
    </Card>
  );
}
