import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { groupByDueDate, type ActivityItem } from "./group-by-due-date";

function makeActivity(overrides: Partial<ActivityItem> = {}): ActivityItem {
  return {
    id: "act-1",
    type: "TASK",
    title: "Test activity",
    description: null,
    dueDate: null,
    completedAt: null,
    createdAt: "2025-01-15T10:00:00Z",
    user: { id: "u-1", name: "Thomas" },
    contact: null,
    deal: null,
    ...overrides,
  };
}

describe("groupByDueDate", () => {
  beforeEach(() => {
    // Fix "now" to Wednesday Jan 15, 2025 at noon UTC
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty array when given no activities", () => {
    const result = groupByDueDate([]);
    expect(result).toEqual([]);
  });

  it("groups activities with no due date", () => {
    const activities = [makeActivity({ id: "1" }), makeActivity({ id: "2" })];
    const result = groupByDueDate(activities);

    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("No Due Date");
    expect(result[0]!.items).toHaveLength(2);
  });

  it("puts past-due activities in Overdue", () => {
    const activity = makeActivity({
      id: "1",
      dueDate: "2025-01-13T10:00:00Z", // 2 days ago
    });
    const result = groupByDueDate([activity]);

    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("Overdue");
  });

  it("puts today's activities in Today", () => {
    const activity = makeActivity({
      id: "1",
      dueDate: "2025-01-15T08:00:00Z", // today
    });
    const result = groupByDueDate([activity]);

    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("Today");
  });

  it("puts tomorrow's activities in Tomorrow", () => {
    const activity = makeActivity({
      id: "1",
      dueDate: "2025-01-16T10:00:00Z", // tomorrow
    });
    const result = groupByDueDate([activity]);

    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("Tomorrow");
  });

  it("puts this week's activities in This Week", () => {
    // Jan 15, 2025 is a Wednesday. End of week (Sunday) = Jan 19
    const activity = makeActivity({
      id: "1",
      dueDate: "2025-01-18T10:00:00Z", // Saturday, same week
    });
    const result = groupByDueDate([activity]);

    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("This Week");
  });

  it("puts far future activities in Later", () => {
    const activity = makeActivity({
      id: "1",
      dueDate: "2025-02-15T10:00:00Z", // next month
    });
    const result = groupByDueDate([activity]);

    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("Later");
  });

  it("sorts groups in priority order (Overdue first)", () => {
    const activities = [
      makeActivity({ id: "1", dueDate: "2025-02-15T10:00:00Z" }), // Later
      makeActivity({ id: "2", dueDate: "2025-01-13T10:00:00Z" }), // Overdue
      makeActivity({ id: "3", dueDate: "2025-01-15T10:00:00Z" }), // Today
      makeActivity({ id: "4" }), // No Due Date
    ];
    const result = groupByDueDate(activities);

    expect(result.map((g) => g.label)).toEqual(["Overdue", "Today", "Later", "No Due Date"]);
  });

  it("omits empty groups from results", () => {
    const activities = [
      makeActivity({ id: "1", dueDate: "2025-01-15T10:00:00Z" }), // Today only
    ];
    const result = groupByDueDate(activities);

    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("Today");
  });

  it("places completed overdue activities in Overdue group", () => {
    const activity = makeActivity({
      id: "1",
      dueDate: "2025-01-13T10:00:00Z",
      completedAt: "2025-01-14T10:00:00Z",
    });
    const result = groupByDueDate([activity]);

    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("Overdue");
    expect(result[0]!.items[0]!.completedAt).toBeTruthy();
  });

  it("handles multiple activities across all groups", () => {
    const activities = [
      makeActivity({ id: "1", dueDate: "2025-01-10T10:00:00Z" }), // Overdue
      makeActivity({ id: "2", dueDate: "2025-01-15T10:00:00Z" }), // Today
      makeActivity({ id: "3", dueDate: "2025-01-16T10:00:00Z" }), // Tomorrow
      makeActivity({ id: "4", dueDate: "2025-01-18T10:00:00Z" }), // This Week
      makeActivity({ id: "5", dueDate: "2025-03-01T10:00:00Z" }), // Later
      makeActivity({ id: "6" }), // No Due Date
    ];
    const result = groupByDueDate(activities);

    expect(result).toHaveLength(6);
    expect(result.map((g) => g.label)).toEqual([
      "Overdue",
      "Today",
      "Tomorrow",
      "This Week",
      "Later",
      "No Due Date",
    ]);
    result.forEach((group) => {
      expect(group.items).toHaveLength(1);
    });
  });
});
