import { describe, it, expect } from "vitest";
import { createNoteSchema, updateNoteSchema, noteFilterSchema } from "./note";

describe("createNoteSchema", () => {
  it("validates a minimal note", () => {
    const result = createNoteSchema.safeParse({ content: "Meeting notes here" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pinned).toBe(false);
    }
  });

  it("validates with all optional fields", () => {
    const result = createNoteSchema.safeParse({
      content: "Follow up on proposal",
      pinned: true,
      contactId: "cm1234567890abcdefghijklm",
      companyId: "cm1234567890abcdefghijkln",
      dealId: "cm1234567890abcdefghijklo",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = createNoteSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects content over 10000 characters", () => {
    const result = createNoteSchema.safeParse({ content: "x".repeat(10001) });
    expect(result.success).toBe(false);
  });

  it("rejects missing content", () => {
    const result = createNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateNoteSchema", () => {
  it("allows partial updates", () => {
    const result = updateNoteSchema.safeParse({ pinned: true });
    expect(result.success).toBe(true);
  });

  it("allows empty object", () => {
    const result = updateNoteSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("noteFilterSchema", () => {
  it("applies default values", () => {
    const result = noteFilterSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(25);
    expect(result.sortBy).toBe("createdAt");
    expect(result.sortOrder).toBe("desc");
  });

  it("coerces string page/limit to numbers", () => {
    const result = noteFilterSchema.parse({ page: "2", limit: "50" });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
  });

  it("accepts pinned filter", () => {
    const result = noteFilterSchema.parse({ pinned: "true" });
    expect(result.pinned).toBe("true");
  });

  it("rejects invalid pinned value", () => {
    const result = noteFilterSchema.safeParse({ pinned: "maybe" });
    expect(result.success).toBe(false);
  });

  it("accepts entity ID filters", () => {
    const result = noteFilterSchema.parse({
      contactId: "cm1234567890abcdefghijklm",
    });
    expect(result.contactId).toBe("cm1234567890abcdefghijklm");
  });

  it("rejects limit over 100", () => {
    const result = noteFilterSchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });
});
