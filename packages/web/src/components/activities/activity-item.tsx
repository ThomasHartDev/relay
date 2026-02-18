"use client";

import { Phone, Mail, Calendar, CheckSquare, FileText } from "lucide-react";
import { cn } from "@/lib/cn";
import { ACTIVITY_COLORS } from "@/lib/design-tokens";
import type { ActivityItem as ActivityItemType } from "@/lib/activities/group-by-due-date";
import type { ActivityType } from "@relay/shared";

const ICON_MAP: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  TASK: CheckSquare,
  NOTE: FileText,
};

interface ActivityItemProps {
  activity: ActivityItemType;
  onToggleComplete: (id: string, completed: boolean) => void;
}

export function ActivityItem({ activity, onToggleComplete }: ActivityItemProps) {
  const Icon = ICON_MAP[activity.type];
  const colors = ACTIVITY_COLORS[activity.type];
  const isCompleted = !!activity.completedAt;

  return (
    <div className="flex items-start gap-3 rounded-md border border-gray-200 p-3 transition-colors hover:bg-gray-50">
      <button
        onClick={() => onToggleComplete(activity.id, !isCompleted)}
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 transition-colors hover:border-gray-400"
        style={isCompleted ? { backgroundColor: colors.text, borderColor: colors.text } : undefined}
      >
        {isCompleted && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium text-gray-900",
            isCompleted && "text-gray-400 line-through",
          )}
        >
          {activity.title}
        </p>
        {activity.description && (
          <p className="mt-0.5 truncate text-xs text-gray-500">{activity.description}</p>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
          <span>{activity.user.name}</span>
          {activity.contact && (
            <>
              <span>&middot;</span>
              <span>
                {activity.contact.firstName} {activity.contact.lastName}
              </span>
            </>
          )}
          {activity.deal && (
            <>
              <span>&middot;</span>
              <span>{activity.deal.title}</span>
            </>
          )}
        </div>
      </div>

      {activity.dueDate && (
        <span className="shrink-0 text-xs text-gray-400">
          {new Date(activity.dueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      )}
    </div>
  );
}
