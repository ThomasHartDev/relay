import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("loginSchema", () => {
  it("accepts valid login", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "password" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-email", password: "password" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      name: "Test User",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      name: "Test User",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      name: "T",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password over 128 chars", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      name: "Test User",
      password: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });
});
