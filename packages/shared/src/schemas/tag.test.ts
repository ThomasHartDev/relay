import { describe, it, expect } from "vitest";
import { createTagSchema, updateTagSchema, TAG_COLORS } from "./tag";

describe("TAG_COLORS", () => {
  it("has 10 preset colors", () => {
    expect(TAG_COLORS).toHaveLength(10);
  });

  it("all colors are valid hex", () => {
    for (const color of TAG_COLORS) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("all colors are distinct", () => {
    const unique = new Set(TAG_COLORS);
    expect(unique.size).toBe(TAG_COLORS.length);
  });
});

describe("createTagSchema", () => {
  it("validates a minimal tag", () => {
    const result = createTagSchema.safeParse({ name: "Hot Lead" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBe("#6B7280");
    }
  });

  it("validates with custom color", () => {
    const result = createTagSchema.safeParse({ name: "VIP", color: "#EF4444" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createTagSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 50 characters", () => {
    const result = createTagSchema.safeParse({ name: "x".repeat(51) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid hex color", () => {
    const result = createTagSchema.safeParse({ name: "Test", color: "red" });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateTagSchema", () => {
  it("allows partial updates", () => {
    const result = updateTagSchema.safeParse({ color: "#3B82F6" });
    expect(result.success).toBe(true);
  });

  it("allows empty object", () => {
    const result = updateTagSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
