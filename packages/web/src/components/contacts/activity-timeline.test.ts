import { describe, expect, it, vi } from "vitest";
import { groupByDate, type TimelineActivity } from "./activity-timeline";

function makeActivity(overrides: Partial<TimelineActivity> = {}): TimelineActivity {
  return {
    id: "1",
    type: "CALL",
    title: "Test",
    description: null,
    dueDate: null,
    completed: false,
    createdAt: new Date().toISOString(),
    user: { id: "u1", name: "Alice" },
    ...overrides,
  };
}

describe("groupByDate", () => {
  it("groups today's activities under 'Today'", () => {
    const activities = [makeActivity({ id: "1" }), makeActivity({ id: "2" })];
    const groups = groupByDate(activities);
    expect(groups["Today"]).toHaveLength(2);
  });

  it("groups yesterday's activities under 'Yesterday'", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const activities = [makeActivity({ id: "1", createdAt: yesterday })];
    const groups = groupByDate(activities);
    expect(groups["Yesterday"]).toHaveLength(1);
  });

  it("groups older activities by formatted date", () => {
    const oldDate = new Date("2025-01-15T12:00:00Z").toISOString();
    vi.setSystemTime(new Date("2025-03-01T12:00:00Z"));
    const activities = [makeActivity({ id: "1", createdAt: oldDate })];
    const groups = groupByDate(activities);
    const keys = Object.keys(groups);
    expect(keys[0]).toContain("Jan");
    expect(keys[0]).toContain("15");
    vi.useRealTimers();
  });

  it("returns empty object for empty array", () => {
    const groups = groupByDate([]);
    expect(Object.keys(groups)).toHaveLength(0);
  });

  it("preserves chronological order within groups", () => {
    // Pin to noon so "1 hour ago" is still today in any timezone
    vi.setSystemTime(new Date("2025-06-15T12:00:00"));
    const now = new Date();
    const earlier = new Date(now.getTime() - 3600000).toISOString();
    const later = now.toISOString();
    const activities = [
      makeActivity({ id: "1", createdAt: earlier }),
      makeActivity({ id: "2", createdAt: later }),
    ];
    const groups = groupByDate(activities);
    const todayGroup = groups["Today"];
    expect(todayGroup).toBeDefined();
    expect(todayGroup![0]!.id).toBe("1");
    expect(todayGroup![1]!.id).toBe("2");
    vi.useRealTimers();
  });
});
