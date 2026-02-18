import { describe, expect, it } from "vitest";
import { serverEnvSchema, clientEnvSchema } from "./env";

describe("serverEnvSchema", () => {
  const validEnv = {
    DATABASE_URL: "postgresql://relay:relay_dev@localhost:5432/relay",
    REDIS_URL: "redis://localhost:6379",
    JWT_SECRET: "a-very-long-secret-that-is-at-least-32-chars",
    JWT_REFRESH_SECRET: "another-long-secret-that-is-at-least-32-ch",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NODE_ENV: "development" as const,
    RESEND_API_KEY: "re_test_123456",
  };

  it("accepts valid environment variables", () => {
    const result = serverEnvSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it("rejects invalid DATABASE_URL", () => {
    const result = serverEnvSchema.safeParse({ ...validEnv, DATABASE_URL: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("rejects short JWT_SECRET", () => {
    const result = serverEnvSchema.safeParse({ ...validEnv, JWT_SECRET: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects short JWT_REFRESH_SECRET", () => {
    const result = serverEnvSchema.safeParse({ ...validEnv, JWT_REFRESH_SECRET: "short" });
    expect(result.success).toBe(false);
  });

  it("defaults NODE_ENV to development", () => {
    const { NODE_ENV: _, ...envWithoutNode } = validEnv;
    const result = serverEnvSchema.safeParse(envWithoutNode);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe("development");
    }
  });

  it("rejects invalid NODE_ENV", () => {
    const result = serverEnvSchema.safeParse({ ...validEnv, NODE_ENV: "staging" });
    expect(result.success).toBe(false);
  });

  it("rejects empty RESEND_API_KEY", () => {
    const result = serverEnvSchema.safeParse({ ...validEnv, RESEND_API_KEY: "" });
    expect(result.success).toBe(false);
  });
});

describe("clientEnvSchema", () => {
  it("accepts valid client env", () => {
    const result = clientEnvSchema.safeParse({
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL", () => {
    const result = clientEnvSchema.safeParse({
      NEXT_PUBLIC_APP_URL: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});
