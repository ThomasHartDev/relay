import type { ActivityType } from "@relay/shared";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  user: { id: string; name: string };
  contact: { id: string; firstName: string; lastName: string } | null;
  deal: { id: string; title: string } | null;
}

export type DateGroup = "Overdue" | "Today" | "Tomorrow" | "This Week" | "Later" | "No Due Date";

const GROUP_ORDER: DateGroup[] = [
  "Overdue",
  "Today",
  "Tomorrow",
  "This Week",
  "Later",
  "No Due Date",
];

export function groupByDueDate(
  activities: ActivityItem[],
): { label: DateGroup; items: ActivityItem[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86_400_000);
  const endOfWeek = new Date(today.getTime() + (7 - today.getDay()) * 86_400_000);

  const groups = new Map<DateGroup, ActivityItem[]>();

  for (const group of GROUP_ORDER) {
    groups.set(group, []);
  }

  for (const activity of activities) {
    if (!activity.dueDate) {
      groups.get("No Due Date")!.push(activity);
      continue;
    }

    const due = new Date(activity.dueDate);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    if (activity.completedAt) {
      // Completed activities go where they belong chronologically
      if (dueDay < today) {
        groups.get("Overdue")!.push(activity);
      } else if (dueDay.getTime() === today.getTime()) {
        groups.get("Today")!.push(activity);
      } else if (dueDay.getTime() === tomorrow.getTime()) {
        groups.get("Tomorrow")!.push(activity);
      } else if (dueDay <= endOfWeek) {
        groups.get("This Week")!.push(activity);
      } else {
        groups.get("Later")!.push(activity);
      }
    } else if (dueDay < today) {
      groups.get("Overdue")!.push(activity);
    } else if (dueDay.getTime() === today.getTime()) {
      groups.get("Today")!.push(activity);
    } else if (dueDay.getTime() === tomorrow.getTime()) {
      groups.get("Tomorrow")!.push(activity);
    } else if (dueDay <= endOfWeek) {
      groups.get("This Week")!.push(activity);
    } else {
      groups.get("Later")!.push(activity);
    }
  }

  return GROUP_ORDER.filter((label) => {
    const items = groups.get(label);
    return items && items.length > 0;
  }).map((label) => ({
    label,
    items: groups.get(label)!,
  }));
}
