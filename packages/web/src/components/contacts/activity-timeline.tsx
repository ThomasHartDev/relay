"use client";

import { Phone, Mail, Calendar, CheckSquare, FileText } from "lucide-react";
import { cn } from "@/lib/cn";
import { ACTIVITY_COLORS } from "@/lib/design-tokens";

type ActivityType = "CALL" | "EMAIL" | "MEETING" | "TASK" | "NOTE";

interface TimelineActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  user: { id: string; name: string };
}

const ICON_MAP: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  TASK: CheckSquare,
  NOTE: FileText,
};

function groupByDate(activities: TimelineActivity[]): Record<string, TimelineActivity[]> {
  const groups: Record<string, TimelineActivity[]> = {};
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();

  for (const activity of activities) {
    const date = new Date(activity.createdAt);
    const dateStr = date.toDateString();

    let label: string;
    if (dateStr === today) {
      label = "Today";
    } else if (dateStr === yesterday) {
      label = "Yesterday";
    } else {
      label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
      });
    }

    const existing = groups[label];
    if (existing) {
      existing.push(activity);
    } else {
      groups[label] = [activity];
    }
  }

  return groups;
}

interface ActivityTimelineProps {
  activities: TimelineActivity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No activities yet</p>;
  }

  const grouped = groupByDate(activities);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {date}
          </h4>
          <div className="space-y-3">
            {items.map((activity) => {
              const Icon = ICON_MAP[activity.type];
              const colors = ACTIVITY_COLORS[activity.type];
              return (
                <div key={activity.id} className="flex gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p
                      className={cn(
                        "text-sm font-medium text-gray-900",
                        activity.completed && "text-gray-400 line-through",
                      )}
                    >
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="mt-0.5 text-xs text-gray-500">{activity.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {activity.user.name} &middot;{" "}
                      {new Date(activity.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export { groupByDate };
export type { TimelineActivity };
