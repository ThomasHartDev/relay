import { describe, expect, it } from "vitest";
import { createContactSchema, updateContactSchema, contactFilterSchema } from "./contact";

describe("createContactSchema", () => {
  it("accepts valid contact input", () => {
    const result = createContactSchema.safeParse({
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Doe",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("LEAD");
    }
  });

  it("accepts full contact with all optional fields", () => {
    const result = createContactSchema.safeParse({
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Doe",
      phone: "+1-555-0100",
      title: "VP of Sales",
      status: "CUSTOMER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = createContactSchema.safeParse({
      email: "not-an-email",
      firstName: "Jane",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty first name", () => {
    const result = createContactSchema.safeParse({
      email: "jane@example.com",
      firstName: "",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = createContactSchema.safeParse({
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Doe",
      status: "INVALID",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateContactSchema", () => {
  it("accepts partial updates", () => {
    const result = updateContactSchema.safeParse({ firstName: "Janet" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateContactSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("contactFilterSchema", () => {
  it("provides defaults for pagination", () => {
    const result = contactFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(25);
      expect(result.data.sortBy).toBe("createdAt");
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("coerces page to number", () => {
    const result = contactFilterSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it("rejects limit over 100", () => {
    const result = contactFilterSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});
