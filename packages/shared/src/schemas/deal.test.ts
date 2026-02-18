import { describe, expect, it } from "vitest";
import { createDealSchema, updateDealSchema } from "./deal";

describe("createDealSchema", () => {
  it("accepts valid deal with defaults", () => {
    const result = createDealSchema.safeParse({ title: "Enterprise License" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stage).toBe("PROSPECT");
      expect(result.data.value).toBe(0);
      expect(result.data.priority).toBe(0);
    }
  });

  it("accepts full deal input", () => {
    const result = createDealSchema.safeParse({
      title: "Enterprise License",
      value: 50000,
      stage: "PROPOSAL",
      priority: 3,
      closeDate: "2025-06-30",
    });
    expect(result.success).toBe(true);
  });

  it("coerces string value to number", () => {
    const result = createDealSchema.safeParse({
      title: "Deal",
      value: "25000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe(25000);
    }
  });

  it("rejects negative value", () => {
    const result = createDealSchema.safeParse({
      title: "Deal",
      value: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = createDealSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid stage", () => {
    const result = createDealSchema.safeParse({
      title: "Deal",
      stage: "CLOSED",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateDealSchema", () => {
  it("accepts partial update with lostReason", () => {
    const result = updateDealSchema.safeParse({
      stage: "LOST",
      lostReason: "Budget constraints",
    });
    expect(result.success).toBe(true);
  });
});
