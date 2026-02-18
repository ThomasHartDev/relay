"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ListTodo } from "lucide-react";
import { ACTIVITY_TYPES, type ActivityType } from "@relay/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickLogActivity } from "@/components/activities/quick-log-activity";
import { ActivityItem } from "@/components/activities/activity-item";
import {
  groupByDueDate,
  type ActivityItem as ActivityItemType,
} from "@/lib/activities/group-by-due-date";
import { ACTIVITY_COLORS } from "@/lib/design-tokens";
import { useDebounce } from "@/lib/hooks/use-debounce";

const TYPE_LABELS: Record<ActivityType, string> = {
  CALL: "Calls",
  EMAIL: "Emails",
  MEETING: "Meetings",
  TASK: "Tasks",
  NOTE: "Notes",
};

interface ActivitiesResponse {
  data: ActivityItemType[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItemType[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ActivityType | null>(null);
  const [completedFilter, setCompletedFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "100",
    });

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (typeFilter) params.set("type", typeFilter);
    if (completedFilter) params.set("completed", completedFilter);

    try {
      const res = await fetch(`/api/activities?${params.toString()}`);
      if (res.ok) {
        const json: ActivitiesResponse = await res.json();
        setActivities(json.data);
        setMeta(json.meta);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, typeFilter, completedFilter]);

  useEffect(() => {
    void fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, completedFilter]);

  async function handleToggleComplete(id: string, completed: boolean) {
    // Optimistic update
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, completedAt: completed ? new Date().toISOString() : null } : a,
      ),
    );

    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });

      if (!res.ok) {
        // Revert on failure
        void fetchActivities();
      }
    } catch {
      void fetchActivities();
    }
  }

  const groups = groupByDueDate(activities);
  const overdueCount = activities.filter(
    (a) => !a.completedAt && a.dueDate && new Date(a.dueDate) < new Date(),
  ).length;

  const isEmpty =
    !isLoading && activities.length === 0 && !debouncedSearch && !typeFilter && !completedFilter;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
          {!isLoading && (
            <p className="text-sm text-gray-500">
              {meta.total} activit{meta.total !== 1 ? "ies" : "y"}
            </p>
          )}
        </div>
        <QuickLogActivity onCreated={fetchActivities} />
      </div>

      {/* Von Restorff: overdue banner pops visually */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <p className="text-sm font-medium text-red-700">
            {overdueCount} overdue activit{overdueCount !== 1 ? "ies" : "y"} need
            {overdueCount === 1 ? "s" : ""} attention
          </p>
        </div>
      )}

      {isEmpty ? (
        <EmptyState
          icon={<ListTodo className="h-12 w-12" />}
          title="No activities yet"
          description="Log your first activity to start tracking your work."
          action={<QuickLogActivity onCreated={fetchActivities} />}
        />
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />

            {/* Pre-attentive: type filter chips with activity colors */}
            <div className="flex gap-1.5">
              {ACTIVITY_TYPES.map((t) => {
                const colors = ACTIVITY_COLORS[t];
                const isActive = typeFilter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(isActive ? null : t)}
                    className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                    style={
                      isActive
                        ? { backgroundColor: colors.text, color: "#fff" }
                        : { backgroundColor: colors.bg, color: colors.text }
                    }
                  >
                    {TYPE_LABELS[t]}
                  </button>
                );
              })}
            </div>

            {/* Completion filter */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setCompletedFilter(completedFilter === "false" ? null : "false")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  completedFilter === "false"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setCompletedFilter(completedFilter === "true" ? null : "true")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  completedFilter === "true"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((g) => (
                <div key={g} className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No activities match your filters
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.label}>
                  <div className="mb-2 flex items-center gap-2">
                    <h3
                      className={`text-sm font-semibold ${
                        group.label === "Overdue" ? "text-red-600" : "text-gray-700"
                      }`}
                    >
                      {group.label}
                    </h3>
                    <span className="text-xs text-gray-400">{group.items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((activity) => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        onToggleComplete={handleToggleComplete}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {meta.page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
