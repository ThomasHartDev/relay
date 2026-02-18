import { describe, it, expect } from "vitest";
import {
  activityTypeSchema,
  createActivitySchema,
  updateActivitySchema,
  activityFilterSchema,
} from "./activity";

describe("activityTypeSchema", () => {
  it("accepts valid activity types", () => {
    expect(activityTypeSchema.parse("CALL")).toBe("CALL");
    expect(activityTypeSchema.parse("EMAIL")).toBe("EMAIL");
    expect(activityTypeSchema.parse("MEETING")).toBe("MEETING");
    expect(activityTypeSchema.parse("TASK")).toBe("TASK");
    expect(activityTypeSchema.parse("NOTE")).toBe("NOTE");
  });

  it("rejects invalid types", () => {
    expect(() => activityTypeSchema.parse("INVALID")).toThrow();
    expect(() => activityTypeSchema.parse("")).toThrow();
  });
});

describe("createActivitySchema", () => {
  it("validates a minimal activity", () => {
    const result = createActivitySchema.safeParse({
      type: "TASK",
      title: "Follow up with client",
    });
    expect(result.success).toBe(true);
  });

  it("validates with all optional fields", () => {
    const result = createActivitySchema.safeParse({
      type: "CALL",
      title: "Schedule demo",
      description: "Demo of new features",
      dueDate: "2025-02-01",
      contactId: "cm1234567890abcdefghijklm",
      dealId: "cm1234567890abcdefghijkln",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = createActivitySchema.safeParse({ type: "TASK" });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = createActivitySchema.safeParse({ type: "TASK", title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects title over 200 characters", () => {
    const result = createActivitySchema.safeParse({
      type: "TASK",
      title: "x".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateActivitySchema", () => {
  it("allows partial updates", () => {
    const result = updateActivitySchema.safeParse({ title: "New title" });
    expect(result.success).toBe(true);
  });

  it("allows empty object", () => {
    const result = updateActivitySchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("activityFilterSchema", () => {
  it("applies default values", () => {
    const result = activityFilterSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(100);
    expect(result.sortBy).toBe("dueDate");
    expect(result.sortOrder).toBe("asc");
  });

  it("coerces string page/limit to numbers", () => {
    const result = activityFilterSchema.parse({ page: "3", limit: "50" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });

  it("accepts type filter", () => {
    const result = activityFilterSchema.parse({ type: "CALL" });
    expect(result.type).toBe("CALL");
  });

  it("accepts completed filter", () => {
    const result = activityFilterSchema.parse({ completed: "true" });
    expect(result.completed).toBe("true");
  });

  it("rejects invalid completed value", () => {
    const result = activityFilterSchema.safeParse({ completed: "maybe" });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 200", () => {
    const result = activityFilterSchema.safeParse({ limit: "500" });
    expect(result.success).toBe(false);
  });
});
